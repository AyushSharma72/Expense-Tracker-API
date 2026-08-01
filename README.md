# Smart Expense Tracker API

A REST API for managing personal expenses, built with Node.js and Express. Expenses are stored in MongoDB (via Mongoose). The project uses a layered architecture, Joi for request validation, Winston for logging, and MongoDB transactions for safe concurrent writes.

## Features

- Add an expense (`id`, `title`, `amount`, `category`, `date`)
- View all expenses
- Filter expenses by category
- Calculate total expenses (overall and by category)
- Delete an expense

## Project structure

```
.
├── README.md
├── AI_NOTES.md
├── .env
├── package.json
├── Dockerfile
├── docker-compose.yml
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── validators/
└── tests/
```

## Requirements

- Node.js 18+ (tested with Node.js 22)
- npm
- Network access to MongoDB Atlas
- Docker and Docker Compose (optional, for containerized runs)

## Environment variables

Configuration lives in `.env` (committed on purpose so reviewers can run the project without creating an env file themselves):

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `3000`) |
| `NODE_ENV` | `development`, `production`, or `test` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | Database name (`SmartExpenseTracker`) |

Collection used: `expenses`.

## Install dependencies

```bash
npm install
```

## Start the server

```bash
npm start
```

The API listens on `http://localhost:3000` by default.

## Run with Docker

Build and start:

```bash
docker compose up --build
```

Stop:

```bash
docker compose down
```

The API is available at `http://localhost:3000`. Compose loads variables from `.env`.

## Run tests

```bash
npm test
```

Tests connect to the MongoDB database from `.env` and clear the `expenses` collection between cases.

## API endpoints

Base path: `/api/expenses`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/expenses` | Create an expense |
| `GET` | `/api/expenses` | List all expenses |
| `GET` | `/api/expenses?category=Food` | Filter by category |
| `GET` | `/api/expenses/totals` | Overall total |
| `GET` | `/api/expenses/totals?category=Food` | Total for a category |
| `GET` | `/api/expenses/totals/by-category` | Totals grouped by category |
| `DELETE` | `/api/expenses/:id` | Delete an expense by id |
| `GET` | `/health` | Health check |

### Create expense — request body

```json
{
  "title": "Lunch",
  "amount": 12.5,
  "category": "Food",
  "date": "2026-07-31"
}
```

`date` must be in `YYYY-MM-DD` format. `amount` must be a positive number. The server generates a UUID `id`.

### Example requests

```bash
# Create
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Lunch\",\"amount\":12.5,\"category\":\"Food\",\"date\":\"2026-07-31\"}"

# List all
curl http://localhost:3000/api/expenses

# Filter by category
curl "http://localhost:3000/api/expenses?category=Food"

# Totals
curl http://localhost:3000/api/expenses/totals
curl "http://localhost:3000/api/expenses/totals?category=Food"
curl http://localhost:3000/api/expenses/totals/by-category

# Delete
curl -X DELETE http://localhost:3000/api/expenses/<expense-id>
```

## Architecture

- **Routes** — HTTP mapping and middleware wiring
- **Validators** — Joi schemas for body, query, and params
- **Controllers** — request/response handling
- **Services** — business logic (create, filter, totals, not-found)
- **Repository** — Mongoose access to MongoDB `expenses` collection (writes use transactions)
- **Middlewares** — request logging, validation, 404, centralized errors
