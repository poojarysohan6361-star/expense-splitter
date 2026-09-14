# Expense Splitter

A Splitwise-style expense splitting app. React + Vite frontend, Express +
PostgreSQL backend.

## Structure

```
frontend/   React app (Vite)
backend/    Express API
database/   schema.sql, seed.sql
```

## Setup

### 1. Database (do this yourself — see setup walkthrough)
Create a local PostgreSQL database, then run:
```
psql -d expense_splitter -f database/schema.sql
```

### 2. Backend
```
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npm run dev
```
Visit http://localhost:5000/api/health — should return `{"status":"ok","db":"connected"}`.

### 3. Frontend
```
cd frontend
npm install
npm run dev
```
Visit http://localhost:5173.

## Status

Scaffold only — no features implemented yet. Working order: auth → groups →
members → expenses → splitting → balances → history → polish.
