# Bank Transactions Backend

A robust backend API for managing users, accounts, and transactions in a banking system. Built with Node.js, Express, TypeScript, and MongoDB (Mongoose).

---

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Core Logic & Features](#core-logic--features)
- [Setup & Environment](#setup--environment)
- [License](#license)

---

## Project Overview
This backend provides RESTful APIs for:
- User registration, authentication, and profile management
- Account creation and retrieval
- Secure, idempotent transactions between accounts
- Ledger management for transaction history and balance calculation

Technologies used:
- **Node.js** + **Express** (API server)
- **TypeScript** (type safety)
- **MongoDB** + **Mongoose** (database & ODM)
- **JWT** (authentication)
- **Bcrypt** (password hashing)

---

## Architecture
- **Modular MVC structure**: Controllers, Models, Routes, Middlewares, and Utilities
- **Idempotency**: Prevents duplicate transactions
- **JWT Auth**: Secure endpoints for users and system operations
- **Ledger-based accounting**: Immutable ledger entries for all transactions

---

## Folder Structure
```
Backend/
├── .env                  # Environment variables
├── package.json          # Project metadata & scripts
├── tsconfig.json         # TypeScript configuration
├── src/
│   ├── app.ts            # Express app setup
│   ├── server.ts         # Server entry point
│   ├── controllers/      # Route logic (account, transaction, user)
│   ├── lib/              # DB connection logic
│   ├── middlewares/      # Auth & error handling
│   ├── models/           # Mongoose schemas (Account, User, Transaction, Ledger)
│   ├── routes/           # API route definitions
│   ├── types/            # TypeScript types & interfaces
│   └── utils/            # Utility functions (async, idempotency, etc)
```

---

## API Endpoints

### Auth
- `POST /api/auth/signup` — Register a new user
- `POST /api/auth/signin` — Login and receive JWT
- `GET /api/auth/profile` — Get user profile (auth required)
- `GET /api/auth/signout` — Logout user

### Account
- `POST /api/account/create` — Create a new account (auth required)
- `GET /api/account/profile` — Get account details & balance (auth required)

### Transaction
- `POST /api/transaction/create` — Create a transaction (auth required)
- `POST /api/transaction/transfer-funds` — Transfer funds (system user)

---

## Database Models

### User
- `name`: String
- `email`: String (unique, required)
- `password`: String (hashed)
- `systemUser`: Boolean (for system operations)

### Account
- `userId`: ObjectId (User reference)
- `status`: "ACTIVE" | "FROZEN" | "CLOSED"
- `currency`: String (default: INR)

### Transaction
- `idempotencyKey`: String (unique)
- `fromAccountId`: ObjectId (Account reference)
- `toAccountId`: ObjectId (Account reference)
- `status`: "PENDING" | "COMPLETED" | "FAILED" | "REVERSED"
- `amount`: Number

### Ledger
- `accountId`: ObjectId (Account reference)
- `amount`: Number
- `transactionId`: ObjectId (Transaction reference)
- `type`: "DEBIT" | "CREDIT"

---

## Core Logic & Features

- **Authentication**: JWT-based, with secure password hashing (bcrypt)
- **Account Management**: Each user can create one account; status and currency tracked
- **Transaction Handling**:
  - Idempotency key to prevent duplicate processing
  - Validates account status and ownership
  - Updates ledger entries for both sender and receiver
- **Ledger System**:
  - Immutable entries (cannot be modified/deleted)
  - Balance calculated as sum of credits minus debits
- **Error Handling**: Centralized middleware for consistent API responses
- **Async Utilities**: Async wrapper for route handlers

---

## Setup & Environment

1. **Clone the repository**
   ```sh
   git clone https://github.com/anurag150304/Bank-Transactions.git
   ```
2. **Install dependencies**
   ```sh
   pnpm install --frozen-lockfile
   ```
3. **Configure environment**
   - Copy `.env` and set:
     - `PORT` (default: 3000)
     - `DB_URL` (MongoDB connection string)
     - `JWT_SECRET` (for signing tokens)
4. **Run the server**
   ```sh
   pnpm run dev
   ```
   Or build and start:
   ```sh
   pnpm run build
   pnpm start
   ```
