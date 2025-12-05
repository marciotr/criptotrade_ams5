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

app = FastAPI(title="Chatbot Service")

GATEWAY_BASE = os.getenv('GATEWAY_BASE', 'http://localhost:5102')

# Configure CORS so the frontend (and gateway) can call this service directly
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

    # fallback reply
    return ChatResponse(reply="Desculpe, não entendi. Posso responder consultas como 'Qual meu saldo?' ou executar comandos como 'Depositar 200 USD'.")


if __name__ == '__main__':
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=6000, reload=True)
