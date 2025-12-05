Chatbot Service (FastAPI)

Resumo:
- Expõe `POST /chatbot/message`.
- Entende comandos em português como "Qual meu saldo?" e "Depositar 200 USD".
- Para consultas de saldo, chama o gateway em `GET /balance/summary` (o gateway deve encaminhar para a Wallet API) e formata a resposta.
- Para comandos de depósito, o serviço enfileira o evento em memória e também tenta uma chamada imediata ao gateway `POST /transactions/deposit/fiat` para processamento rápido.

Execução local (desenvolvimento):
1. Criar um venv Python e instalar dependências:

```powershell
cd backend/chatbot_service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Executar o serviço:

```powershell
$env:GATEWAY_BASE = "http://localhost:5102"
uvicorn main:app --reload --port 6000
```

3. Exemplos de requisições:

Consultar saldo (é esperado que o cliente envie o `Authorization: Bearer <token>`):

```bash
curl -X POST http://localhost:6000/chatbot/message -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{"message":"Qual meu saldo?"}'
```

Comando de depósito (o token também deve ser enviado):

```bash
curl -X POST http://localhost:6000/chatbot/message -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{"message":"Depositar 200 USD"}'
```

Observações:
- O serviço espera um gateway disponível em `GATEWAY_BASE` que encaminhe os endpoints necessários para a Wallet API (por padrão `http://localhost:5102`).
- O endpoint de depósito chamado pelo chatbot é `POST /transactions/deposit/fiat` no gateway.
- RabbitMQ é opcional: quando presente o design anterior permitia publicar eventos, mas atualmente o serviço usa fila em memória e processamento em background; habilite RabbitMQ apenas se desejar publicar eventos para outros consumidores.
