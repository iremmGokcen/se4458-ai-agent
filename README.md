# Ollama Agent – AI Gateway Backend

This project is an AI-driven backend (gateway) built using Node.js and Express. It processes user messages, detects their intent, extracts parameters, and communicates with the Midterm Billing API via HTTP requests.

## Features

- Parses user messages using natural language (via Ollama + LLaMA3)
- Detects intent: `query_bill`, `query_bill_detailed`, `make_payment`
- Extracts `subscriberNo`, `month`, `year`
- Forwards requests to protected Spring Boot Midterm API endpoints
- Uses Bearer token authentication for API access
- CORS-enabled to allow frontend testing

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create `.env` File

```env
MIDTERM_API_URL=http://localhost:8080/api/v1/bill
GATEWAY_TOKEN=<your-latest-jwt-token-here>
```

⚠️ You must refresh the `GATEWAY_TOKEN` if the JWT expires (every hour). You can get it via `/api/v1/auth/login` on Swagger.

### 3. Run Ollama (model download required once)

```bash
ollama run llama3
```

Keep this terminal open while testing.

### 4. Start the Server

```bash
node index.js
```

## Available Route

```
POST /chat
```

### Request Body (JSON)

```json
{
  "message": "Please pay for subscriber 1001 in April 2025"
}
```

### Response

```json
{
  "response": "Fatura başarıyla ödendi."
}
```

## Example Test Messages

| Type | Message | Expected Action |
|------|---------|------------------|
|  Payment | `Please pay for subscriber 1001 in April 2025` | Calls `/bill/pay` |
|  Summary Query | `What is the bill for subscriber 1001 in April 2025` | Calls `/bill` |
|  Detailed Query | `Show me the detailed bill for subscriber 1001 in April 2025` | Calls `/bill/detailed` |
|  Invalid | `Tell me a joke` | Returns `Unknown intent` |

## Demo Recording

[Watch the demo on Google Drive](https://drive.google.com/file/d/13Lgwy78dEQnIj_9DNvpFfylsF_-jtaZ8/view?usp=sharing)
