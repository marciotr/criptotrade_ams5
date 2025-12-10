from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re
import os
import asyncio
import json
import httpx
import uuid
from typing import Optional
from typing import Dict, Any

app = FastAPI(title="Chatbot Service")

GATEWAY_BASE = os.getenv('GATEWAY_BASE', 'http://localhost:5102')

# Configurar CORS para o frontend (e gateway) poder chamar este serviço diretamente
allowed_origins = [
    os.getenv('FRONTEND_ORIGIN', 'http://localhost:5294'),
    os.getenv('GATEWAY_ORIGIN', 'http://localhost:5102')
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# simples fila em memória para eventos pendentes
event_queue = asyncio.Queue()

class ChatRequest(BaseModel):
    userId: Optional[int] = None
    message: str

class ChatResponse(BaseModel):
    reply: str
    published: bool = False
    event: Optional[dict] = None


async def publish_event_deposit(payload: dict) -> bool:
    """Tenta publicar evento: atualmente apenas enfileira localmente e retorna False (não publicado).
    Mantemos o evento na fila em memória para processamento em background.
    """
    await event_queue.put(payload)
    return False


async def process_deposit_via_gateway(payload: dict, auth_header: Optional[str] = None) -> dict:
    """Call gateway /transactions/deposit/fiat to enact the deposit. Returns gateway response or raises."""
    url = f"{GATEWAY_BASE}/transactions/deposit/fiat"
    headers = {"Authorization": auth_header} if auth_header else None
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError:
            
            raise
        except Exception:
            raise


async def process_gateway_request(path: str, method: str = 'POST', payload: Optional[Dict[str, Any]] = None, auth_header: Optional[str] = None) -> Any:
    """Generic gateway caller used by chatbot: supports GET and POST currently."""
    url = f"{GATEWAY_BASE}/{path.lstrip('/') }"
    headers = {"Authorization": auth_header} if auth_header else None
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            if method.upper() == 'GET':
                resp = await client.get(url, headers=headers, params=payload)
            else:
                resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            try:
                return resp.json()
            except Exception:
                return resp.text
        except httpx.HTTPStatusError as e:
            raise
        except Exception:
            raise


def normalize_number(s: str) -> float:
    try:
        return float(s.replace(',', '.'))
    except Exception:
        return 0.0


async def resolve_currency_and_price(target_symbol: str, auth_header: Optional[str] = None):
    """Find currency object from catalog and ensure we have a usable current price.
    Returns (found_currency_dict, price_float, error_message_or_None).
    """
    try:
        currencies = await process_gateway_request('currency', method='GET', payload=None, auth_header=auth_header)
    except Exception as e:
        return None, 0.0, f"Falha ao consultar catálogo de moedas: {e}"

    found = None
    if isinstance(currencies, list):
        for c in currencies:
            sym = (c.get('symbol') or c.get('Symbol') or '').upper()
            if sym == target_symbol:
                found = c
                break

    if not found:
        return None, 0.0, f"Moeda {target_symbol} não encontrada no catálogo."

    raw_price = found.get('currentPrice') or found.get('CurrentPrice') or found.get('price') or found.get('Price') or 0
    price = 0.0
    try:
        price = float(raw_price) if raw_price is not None else 0.0
    except Exception:
        price = 0.0

    if price <= 0:
        tried = []
        for pair in (f"{target_symbol}USDT", target_symbol):
            tried.append(pair)
            try:
                resp = await process_gateway_request(f'crypto/ticker/{pair}', method='GET', payload=None, auth_header=auth_header)
                candidate = None
                if isinstance(resp, dict):
                    for key in ('lastPrice', 'LastPrice', 'price', 'last', 'close'):
                        if key in resp:
                            candidate = resp.get(key)
                            break
                else:
                    try:
                        j = json.loads(resp)
                        if isinstance(j, dict):
                            for key in ('lastPrice', 'LastPrice', 'price', 'last', 'close'):
                                if key in j:
                                    candidate = j.get(key)
                                    break
                    except Exception:
                        candidate = None

                if candidate is not None:
                    try:
                        price = float(candidate)
                        if price > 0:
                            break
                    except Exception:
                        price = 0.0
            except Exception:
                continue

    return found, price, None


HELP_TEXT = (
    "Posso ajudar com alguns comandos: \n"
    "- 'Qual meu saldo?' — resumo da carteira.\n"
    "- 'Depositar 200 USD' — inicia depósito.\n"
    "- 'Comprar 0.01 BTC' ou 'Comprar 100 USD de BTC' — comprar cripto.\n"
    "- 'Vender 0.5 BTC' — vender cripto.\n"
    "- 'Histórico' ou 'Extrato' — ver transações recentes.\n"
)


async def background_event_worker():
    """Processa eventos pendentes na fila chamando o endpoint de depósito via gateway."""
    while True:
        payload = await event_queue.get()
        try:
            print("Processando evento em fila:", payload)
            # melhora futura: diferenciar tipos de evento
            try:
                resp = await process_deposit_via_gateway(payload, payload.get('authHeader'))
                print("Depósito processado via gateway, resposta:", resp)
            except Exception as e:
                print("Falha ao processar depósito via gateway para payload", payload, "erro:", e)
                # em produção poderíamos implementar retry/backoff; aqui apenas logamos
        finally:
            event_queue.task_done()


@app.on_event("startup")
async def startup_event():
    # starta background worker pra eventos de fila
    loop = asyncio.get_event_loop()
    loop.create_task(background_event_worker())
    print("Serviço Chatbot iniciado. Gateway:", GATEWAY_BASE)


@app.post('/chatbot/message', response_model=ChatResponse)
async def handle_message(req: ChatRequest, request: Request):
    text = req.message.strip()
    lower = text.lower()
    auth_header = request.headers.get("authorization")

    # Verifica consulta de saldo
    if re.search(r"\bsaldo\b|qual meu saldo|quanto tenho|quanto.*saldo", lower):
        # tenta chamar resumo da carteira via gateway (usa token de autenticação para inferir usuário)
        if not auth_header:
            return ChatResponse(reply="Para consultar saldo preciso do token de autenticação. Faça login e tente novamente.")
        url = f"{GATEWAY_BASE}/balance/summary"
        async with httpx.AsyncClient(timeout=10) as client:
            try:
                resp = await client.get(url, headers={"Authorization": auth_header})
                resp.raise_for_status()
                data = resp.json()
                # Resumo da carteira inclui valores totais e detalhes por ativo
                if not isinstance(data, dict):
                    return ChatResponse(reply=f"Saldo (resposta inesperada): {json.dumps(data)}")

                total_usd = data.get('totalValueUsd') or data.get('totalValue')
                detailed = data.get('detailed') or data.get('positions') or []

                asset_parts = []
                for item in detailed:
                    symbol = item.get('symbol') or item.get('asset') or item.get('currency')
                    amount = item.get('amount')
                    value = item.get('value') or item.get('currentValue')
                    if symbol and amount is not None:
                        piece = f"{symbol}: {amount}"
                        if value is not None:
                            piece += f" (US$ {value})"
                        asset_parts.append(piece)

                summary_parts = []
                if total_usd is not None:
                    summary_parts.append(f"Total: US$ {total_usd}")
                if asset_parts:
                    summary_parts.append("Detalhes: " + ", ".join(asset_parts))

                reply = " | ".join(summary_parts) if summary_parts else f"Saldo: {json.dumps(data)}"
                return ChatResponse(reply=reply)
            except httpx.HTTPStatusError as e:
                return ChatResponse(reply=f"Falha ao consultar saldo: {e.response.status_code} - {e.response.text}")
            except Exception as e:
                return ChatResponse(reply=f"Erro ao consultar saldo: {str(e)}")

    # Verifica comando de depósito como "Depositar 200 USD" ou "depositar 200 usd"
    m = re.search(r"depositar\s+(\d+[\.,]?\d*)\s*([A-Za-z]{3}|[A-Za-z]+)?", lower)
    if m:
        amount_raw = m.group(1)
        currency_raw = m.group(2) or 'USD'
        # normalize
        amount = float(amount_raw.replace(',', '.'))
        currency = currency_raw.upper()
        if not auth_header:
            return ChatResponse(reply="Para efetuar depósito preciso do token de autenticação. Faça login e tente novamente.")

        reference_id = str(uuid.uuid4())
        event = {
            'type': 'chatbot.wallet.deposit',
            'amount': amount,
            'currency': currency,
            'method': 'CHATBOT',
            'referenceId': reference_id,
            'authHeader': auth_header
        }

        published = await publish_event_deposit(event)

        # também dispara uma chamada imediata best-effort para a carteira via gateway (para que efeitos fiquem visíveis rapidamente)
        try:
            gw_payload = {
                'currency': currency,
                'amount': amount,
                'method': 'CHATBOT',
                'referenceId': reference_id,
                'source': 'chatbot'
            }
            gw_resp = await process_deposit_via_gateway(gw_payload, auth_header)
            reply = f"Evento de depósito publicado ({'via broker' if published else 'queued locally'}) e processado. Gateway: {gw_resp}"
        except Exception as e:
            reply = f"Evento de depósito publicado ({'via broker' if published else 'queued locally'}). A execução do depósito falhou ao chamar o gateway: {e} — será processado em background."

        return ChatResponse(reply=reply, published=published, event=event)

    # Verifica comando de compra: "comprar 0.01 btc" ou "comprar 100 usd de btc"
    m_buy = re.search(r"\b(comprar|buy)\b\s+(\d+[\.,]?\d*)\s*(usd|brl)?\s*(de\s*)?(btc|eth|[A-Za-z]{2,6})?", lower)
    if m_buy:
        qty_or_amount = m_buy.group(2)
        fiat_marker = m_buy.group(3)
        symbol = m_buy.group(5) or m_buy.group(4) or None
        if not auth_header:
            return ChatResponse(reply="Para comprar preciso do token de autenticação. Faça login e tente novamente.")

        reference_id = str(uuid.uuid4())
        target_symbol = (symbol or 'BTC').upper() if symbol else 'BTC'
        found, price, err = await resolve_currency_and_price(target_symbol, auth_header=auth_header)
        if err:
            return ChatResponse(reply=err)

        id_currency = found.get('id') or found.get('Id')
        if not id_currency:
            return ChatResponse(reply=f"Id da moeda {target_symbol} não disponível no catálogo.")

        if fiat_marker:
            fiat_amount = normalize_number(qty_or_amount)
            dto = {
                'IdAccount': '00000000-0000-0000-0000-000000000000',
                'IdWallet': '00000000-0000-0000-0000-000000000000',
                'IdCurrency': id_currency,
                'FiatAmount': fiat_amount,
                'Fee': 0,
                'CreateNewLot': True,
                'ReferenceId': reference_id,
            }
        else:
            qty = normalize_number(qty_or_amount)
            if price <= 0:
                return ChatResponse(reply=f"Preço da moeda {target_symbol} indisponível; não é possível calcular o valor fiat.")
            fiat_amount = qty * price
            dto = {
                'IdAccount': '00000000-0000-0000-0000-000000000000',
                'IdWallet': '00000000-0000-0000-0000-000000000000',
                'IdCurrency': id_currency,
                'FiatAmount': fiat_amount,
                'Fee': 0,
                'CreateNewLot': True,
                'ReferenceId': reference_id,
            }

        try:
            print("[Chatbot] Sending BUY DTO:", dto)
            resp = await process_gateway_request('transactions/buy', method='POST', payload=dto, auth_header=auth_header)
            print("[Chatbot] Gateway buy response:", resp)
            return ChatResponse(reply=f"Ordem de compra enviada: {resp}")
        except Exception as e:
            return ChatResponse(reply=f"Falha ao enviar ordem de compra: {e}")

    # Verifica comando de venda: "vender 0.5 btc" ou "vender 100 usd de btc"
    m_sell = re.search(r"\b(vender|sell)\b\s+(\d+[\.,]?\d*)\s*(usd|brl)?\s*(de\s*)?(btc|eth|[A-Za-z]{2,6})?", lower)
    if m_sell:
        qty_or_amount = m_sell.group(2)
        fiat_marker = m_sell.group(3)
        symbol = m_sell.group(5) or m_sell.group(4) or None
        if not auth_header:
            return ChatResponse(reply="Para vender preciso do token de autenticação. Faça login e tente novamente.")

        reference_id = str(uuid.uuid4())
        target_symbol = (symbol or 'BTC').upper() if symbol else 'BTC'
        try:
            currencies = await process_gateway_request('currency', method='GET', payload=None, auth_header=auth_header)
        except Exception as e:
            return ChatResponse(reply=f"Falha ao consultar catálogo de moedas: {e}")

        target_symbol = (symbol or 'BTC').upper() if symbol else 'BTC'
        found, price, err = await resolve_currency_and_price(target_symbol, auth_header=auth_header)
        if err:
            return ChatResponse(reply=err)

        id_currency = found.get('id') or found.get('Id')
        if not id_currency:
            return ChatResponse(reply=f"Id da moeda {target_symbol} não disponível no catálogo.")

        if fiat_marker:
            fiat_amount = normalize_number(qty_or_amount)
            if price <= 0:
                return ChatResponse(reply=f"Preço da moeda {target_symbol} indisponível; não é possível calcular a quantidade a vender.")
            cripto_amount = fiat_amount / price
        else:
            cripto_amount = normalize_number(qty_or_amount)

        dto = {
            'IdAccount': '00000000-0000-0000-0000-000000000000',
            'IdWallet': '00000000-0000-0000-0000-000000000000',
            'IdCurrency': id_currency,
            'CriptoAmount': cripto_amount,
            'Fee': 0,
            'IdWalletPositionLot': None,
            'LotAmount': None,
            'ReferenceId': reference_id,
        }

        try:
            print("[Chatbot] Sending SELL DTO:", dto)
            resp = await process_gateway_request('transactions/sell', method='POST', payload=dto, auth_header=auth_header)
            print("[Chatbot] Gateway sell response:", resp)
            return ChatResponse(reply=f"Ordem de venda enviada: {resp}")
        except Exception as e:
            return ChatResponse(reply=f"Falha ao enviar ordem de venda: {e}")

    # Verifica histórico/extrato
    if re.search(r"\b(hist[oó]rico|extrato|transa[cç][oõ]es|minhas transa(c|ç)oes)\b", lower):
        if not auth_header:
            return ChatResponse(reply="Para ver o histórico preciso do token de autenticação. Faça login e tente novamente.")
        try:
            resp = await process_gateway_request('transactions', method='GET', payload=None, auth_header=auth_header)
            if isinstance(resp, list):
                parts = []
                for t in resp[:5]:
                    typ = t.get('type') or t.get('transactionType') or t.get('kind') or 'txn'
                    amt = t.get('amount') or t.get('fiatAmount') or t.get('quantity') or ''
                    cur = t.get('symbol') or t.get('currency') or ''
                    parts.append(f"{typ} {amt} {cur}")
                return ChatResponse(reply=("Transações recentes: " + ", ".join(parts)) if parts else "Nenhuma transação encontrada.")
            return ChatResponse(reply=f"Histórico: {resp}")
        except Exception as e:
            return ChatResponse(reply=f"Falha ao recuperar histórico: {e}")

    # Ajuda
    if re.search(r"\b(ajuda|help|comandos|o que posso fazer)\b", lower):
        return ChatResponse(reply=HELP_TEXT)

    return ChatResponse(reply="Desculpe, não entendi. Posso responder consultas como 'Qual meu saldo?' ou executar comandos como 'Depositar 200 USD'.")


if __name__ == '__main__':
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=6000, reload=True)
