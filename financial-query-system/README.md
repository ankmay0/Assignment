# TWIGG

> Natural language query interface for financial data

A backend service that accepts natural language questions about financial data and returns intelligent, human-readable answers using LLM technology.

## Features

- 🔍 **Natural Language Processing** — Ask questions in plain English
- 👤 **Multi-user Support** — User-specific financial data isolation
- 💳 **Multi-domain Data** — Bank transactions, Mutual Funds, Equities
- ⚡ **Smart Caching** — Redis-powered response caching
- 🔒 **Secure** — Rate limiting, input validation, collection whitelisting

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Node.js, Express |
| LLM | OpenAI GPT-4, LangChain |
| Database | MongoDB Atlas |
| Cache | Redis Cloud |
| Container | Docker |

## Quick Start

### Prerequisites

- Node.js 18+
- OpenAI API key
- MongoDB Atlas connection string
- Redis connection URL

### Installation

```bash
# Clone repository
git clone <repository-url>
cd financial-query-system

# Install dependencies
cd backend && npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Seed database
node src/seed.js

# Start server
npm start
```

### Docker

```bash
docker-compose up -d
```

## API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/users` | List all users |
| POST | `/api/query` | Process natural language query |

### Example Request

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How much did I spend on food?",
    "userId": "<user-id>",
    "userName": "Rahul Sharma"
  }'
```

### Example Response

```json
{
  "question": "How much did I spend on food?",
  "user": { "id": "...", "name": "Rahul Sharma" },
  "answer": "You spent a total of ₹4,300 on food.",
  "fromCache": false,
  "processingTime": 5234
}
```

## Database Schema

```
users
├── _id (UUID)
└── name (TEXT)

bank_transactions
├── _id (UUID)
├── user_id (UUID) → users
├── amount (NUMERIC)
├── category (TEXT)
├── merchant (TEXT)
└── transaction_date (DATE)

mutual_fund_holdings
├── _id (UUID)
├── user_id (UUID) → users
├── scheme_name (TEXT)
├── invested_value (NUMERIC)
└── current_value (NUMERIC)

equity_holdings
├── _id (UUID)
├── user_id (UUID) → users
├── stock_name (TEXT)
├── quantity (INTEGER)
└── current_price (NUMERIC)
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✓ | OpenAI API key |
| `MONGODB_URI` | ✓ | MongoDB connection string |
| `REDIS_URL` | ✓ | Redis connection URL |
| `PORT` | | Server port (default: 3000) |
| `CACHE_TTL` | | Cache TTL in seconds (default: 3600) |

## Project Structure

```
financial-query-system/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── langchain/      # LLM integration
│   │   └── index.js        # Entry point
│   ├── Dockerfile
│   └── package.json
├── test-interface.html     # Web UI
├── docker-compose.yml
└── README.md
```

## Sample Queries

| Category | Query |
|----------|-------|
| Spending | "How much did I spend on food?" |
| Portfolio | "What is my total portfolio value?" |
| Stocks | "What stocks do I own?" |
| Mutual Funds | "Show my mutual fund holdings" |
| Analysis | "Which stock has the highest value?" |

## License

MIT
