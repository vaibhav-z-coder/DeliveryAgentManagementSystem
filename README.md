# Delivery Agent Management System (DAMS)

A modern, production-grade, full-stack **Delivery Agent Management System (DAMS)** built with **Next.js**, **Node.js/Express**, **TypeScript**, **PostgreSQL (Prisma ORM)**, and **Redis Cache**.

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Prerequisites & Environment Variables](#prerequisites--environment-variables)
6. [Getting Started & Setup](#getting-started--setup)
7. [Database Setup & Migrations](#database-setup--migrations)
8. [Redis Caching Architecture & Strategy](#redis-caching-architecture--strategy)
9. [REST API Documentation](#rest-api-documentation)
10. [Frontend UI & User Experience](#frontend-ui--user-experience)
11. [Testing Suite](#testing-suite)
12. [Project Structure](#project-structure)
13. [Key Design & Architectural Decisions](#key-design--architectural-decisions)

---

## 1. Project Overview

The **Delivery Agent Management System (DAMS)** is designed for logistics operators and dispatch managers to seamlessly oversee, register, inspect, update, and manage delivery agent fleets.

It features complete end-to-end CRUD capabilities, centralized error handling, strict runtime validation via Zod, persistent relational storage with PostgreSQL, and intelligent multi-layered response caching powered by Redis with automated cache invalidation upon any data mutation.

---

## 2. Key Features

- **Full Delivery Agent CRUD**:
  - Register new agents with contact details, operational area, and vehicle assignment.
  - Paginated, filterable, and searchable agent fleet directory.
  - Granular single-agent inspection view with copyable UUIDs.
  - In-place profile updating with pre-filled form state.
  - One-click active/inactive status toggle switch.
  - Safe deletion workflow protected by interactive confirmation dialogs.
- **Enterprise-Grade Redis Caching**:
  - High-speed caching on agent listings (`agents:list:*`) and individual lookups (`agent:{id}`).
  - Real-time `X-Cache: HIT` / `X-Cache: MISS` telemetry.
  - Automatic non-blocking pattern-based cache invalidation (`SCAN` / `DEL`) on agent creation, update, and deletion.
  - Graceful degradation: Continues serving directly from PostgreSQL if Redis is offline.
- **Robust Schema Validation**:
  - Input validation with **Zod** across request bodies, URL params, and query strings.
  - Client-side real-time form validation with inline feedback.
- **Polished SaaS Dashboard**:
  - Built with **Next.js 14**, **Tailwind CSS**, and **Lucide React**.
  - Real-time KPI statistics cards (Total, Active, Inactive, New in last 7 days).
  - Search by Name, Email, Phone, or Service Area with debounce.
  - Filter by status (`ALL`, `ACTIVE`, `INACTIVE`) and sort by creation date, name, or service area.
  - Shimmer skeleton loaders and responsive pagination.
  - Animated toast notification system.
- **Centralized Error Handling**:
  - Uniform JSON error payloads (`{ success: false, error: { message, code, details } }`).
  - Strict HTTP status code adherence (`200`, `201`, `400`, `404`, `409`, `500`).
  - No database stack traces leaked to clients.

---

## 3. Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Native Fetch with custom strongly typed API client

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript (compiled with `tsc` / run with `tsx`)
- **Validation**: Zod
- **Security & Logging**: Helmet, CORS, Morgan

### Database & Caching
- **Database**: PostgreSQL 16
- **ORM**: Prisma ORM 5
- **In-Memory Cache**: Redis 7 (`ioredis`)

### Testing & Tooling
- **Testing**: Jest, ts-jest, Supertest
- **Containers**: Docker & Docker Compose

---

## 4. System Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                  Next.js 14 Frontend                    │
│      (Responsive Dashboard, Skeletons, Modals, Toasts)  │
└────────────────────────────┬────────────────────────────┘
                             │
                      REST HTTP Calls
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 Express.js Backend                      │
│     (Routes, Zod Validation, Controllers, Services)     │
└─────────────────────┬───────────────────┬───────────────┘
                      │                   │
         Read / Invalidate Cache     Persistent Queries
                      │                   │
                      ▼                   ▼
            ┌───────────────────┐ ┌───────────────┐
            │   Redis 7 Cache   │ │ PostgreSQL 16 │
            │ (agents:list,     │ │ (Prisma ORM)  │
            │  agent:{id})      │ └───────────────┘
            └───────────────────┘
```

---

## 5. Prerequisites & Environment Variables

### Prerequisites
- **Node.js** v18+ (tested on Node.js v22)
- **npm** v9+
- **Docker & Docker Compose** (for PostgreSQL and Redis containers)

### Environment Configuration

The application includes `.env.example` templates in the root, `backend/`, and `frontend/` directories.

#### Backend (`backend/.env`)
```env
PORT=5050
NODE_ENV=development
DATABASE_URL=postgresql://dams_user:dams_password@localhost:5432/dams_db?schema=public
REDIS_URL=redis://localhost:6379
REDIS_TTL=60
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5050/api
```

---

## 6. Getting Started & Setup

### Step 1: Clone Repository & Navigate
```bash
git clone <repo-url>
cd PrepPro
```

### Step 2: Start Infrastructure (PostgreSQL & Redis)
Use Docker Compose to launch both PostgreSQL and Redis with health checks:
```bash
docker compose up -d
```
To verify containers are running:
```bash
docker compose ps
```

### Step 3: Install Dependencies
Install dependencies for both backend and frontend:
```bash
npm run install:all
```
*(Or navigate to `backend` and `frontend` separately and run `npm install`)*

---

## 7. Database Setup & Migrations

### Apply Migrations
Generate the Prisma Client and apply migrations to PostgreSQL:
```bash
npm run db:migrate
```
*(Or inside `backend/`: `npx prisma migrate dev`)*

### Seed Initial Sample Agents
Populate the database with 12 realistic delivery agents across various regions:
```bash
npm run db:seed
```
*(Or inside `backend/`: `npm run prisma:seed`)*

---

## 8. Redis Caching Architecture & Strategy

Redis is actively utilized for read optimization and response caching.

### Cache Keys & Hierarchy

| Key Pattern | Description | TTL | Invalidation Triggers |
| :--- | :--- | :--- | :--- |
| `agents:list:*` | Query-indexed agent list cache (e.g. `agents:list:limit=10:page=1:search=rahul:sortBy=createdAt:sortOrder=desc`) | 60 seconds (configurable) | Created, Updated, Deleted, Status Toggled |
| `agent:{id}` | Single agent profile by UUID | 60 seconds (configurable) | Updated, Deleted, Status Toggled |
| `agents:stats` | Fleet analytics (totals, active count, 7-day additions) | 60 seconds | Created, Updated, Deleted, Status Toggled |

### Cache Flow Diagram

```text
Incoming GET /api/agents
       │
       ▼
Is Redis connected?
 ├── NO ──────► Fetch directly from PostgreSQL ──► Return X-Cache: MISS
 └── YES
      │
      ▼
Check key: agents:list:...
 ├── Key EXISTS (HIT) ─► Return JSON data + HTTP Header [X-Cache: HIT]
 └── Key MISS
      │
      ▼
Fetch from PostgreSQL (Prisma $transaction)
      │
      ▼
Write payload to Redis with TTL (EX 60s)
      │
      ▼
Return JSON data + HTTP Header [X-Cache: MISS]
```

### Invalidation Strategy
When any write operation occurs (`POST /api/agents`, `PUT /api/agents/:id`, `PATCH /api/agents/:id/status`, `DELETE /api/agents/:id`):
1. The PostgreSQL mutation completes inside a safe database transaction.
2. The service executes non-blocking `SCAN` iteration matching `agents:list*` and removes all list key variants using pipelined `DEL`.
3. The specific entity key `agent:{id}` is removed.
4. The fleet aggregate key `agents:stats` is removed.
5. All subsequent requests fetch fresh data from PostgreSQL and re-warm the cache.

---

## 9. REST API Documentation

Base URL: `http://localhost:5050/api`

### Health Check
- **`GET /api/health`**
  - **Status Code**: `200 OK` (or `503 Service Unavailable` if DB down)
  - **Response**:
    ```json
    {
      "success": true,
      "status": "healthy",
      "message": "API is healthy",
      "services": {
        "database": "connected",
        "redis": "connected"
      },
      "uptime": 120.4,
      "timestamp": "2026-10-07T12:00:00.000Z"
    }
    ```

### Fleet Statistics
- **`GET /api/agents/stats`**
  - **Status Code**: `200 OK`
  - **Headers**: `X-Cache: HIT` or `X-Cache: MISS`
  - **Response**:
    ```json
    {
      "success": true,
      "data": {
        "total": 12,
        "active": 9,
        "inactive": 3,
        "recentlyAdded": 12,
        "recentAgents": [...]
      },
      "cached": true
    }
    ```

### Create Agent
- **`POST /api/agents`**
  - **Status Code**: `201 Created`
  - **Request Body**:
    ```json
    {
      "fullName": "Rahul Sharma",
      "phone": "+91 98765 43210",
      "email": "rahul.sharma@example.com",
      "serviceArea": "Indiranagar, Bangalore",
      "status": "ACTIVE",
      "vehicleType": "Electric Scooter (Ather 450X)",
      "vehicleNumber": "KA-01-EQ-1029"
    }
    ```
  - **Success Response**:
    ```json
    {
      "success": true,
      "data": {
        "id": "e79c1a54-2719-47af-976d-dd59e9f71dca",
        "fullName": "Rahul Sharma",
        "phone": "+91 98765 43210",
        "email": "rahul.sharma@example.com",
        "serviceArea": "Indiranagar, Bangalore",
        "status": "ACTIVE",
        "vehicleType": "Electric Scooter (Ather 450X)",
        "vehicleNumber": "KA-01-EQ-1029",
        "createdAt": "2026-10-07T12:00:00.000Z",
        "updatedAt": "2026-10-07T12:00:00.000Z"
      }
    }
    ```
  - **Error Responses**:
    - `400 Bad Request`: Validation failure (e.g., invalid email, missing required fields).
    - `409 Conflict`: Email address already registered.

### List Agents
- **`GET /api/agents`**
  - **Query Parameters**:
    - `page` *(number, optional, default: 1)*
    - `limit` *(number, optional, default: 10, max: 100)*
    - `status` *(string, optional: `ACTIVE` or `INACTIVE`)*
    - `search` *(string, optional: matches name, email, phone, or serviceArea)*
    - `sortBy` *(string, optional: `createdAt`, `fullName`, `serviceArea`, `status`)*
    - `sortOrder` *(string, optional: `asc` or `desc`)*
  - **Status Code**: `200 OK`
  - **Headers**: `X-Cache: HIT` or `X-Cache: MISS`
  - **Response**:
    ```json
    {
      "success": true,
      "data": [...],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 12,
        "totalPages": 2,
        "hasNextPage": true,
        "hasPrevPage": false
      },
      "cached": true
    }
    ```

### Get Single Agent
- **`GET /api/agents/:id`**
  - **Status Code**: `200 OK`
  - **Headers**: `X-Cache: HIT` or `X-Cache: MISS`
  - **Error Responses**:
    - `400 Bad Request`: If `:id` is not a valid UUID.
    - `404 Not Found`: If agent does not exist.

### Update Agent
- **`PUT /api/agents/:id`**
  - **Status Code**: `200 OK`
  - **Request Body** *(all fields optional)*:
    ```json
    {
      "fullName": "Rahul Kumar Sharma",
      "phone": "+91 98765 00000",
      "serviceArea": "Koramangala, Bangalore"
    }
    ```
  - **Error Responses**:
    - `400 Bad Request`: Validation failure.
    - `404 Not Found`: Agent ID not found.
    - `409 Conflict`: New email already belongs to another agent.

### Toggle Status
- **`PATCH /api/agents/:id/status`**
  - **Status Code**: `200 OK`
  - **Request Body**:
    ```json
    {
      "status": "INACTIVE"
    }
    ```

### Delete Agent
- **`DELETE /api/agents/:id`**
  - **Status Code**: `200 OK`
  - **Success Response**:
    ```json
    {
      "success": true,
      "data": {
        "id": "e79c1a54-2719-47af-976d-dd59e9f71dca",
        "message": "Delivery agent successfully deleted"
      }
    }
    ```
  - **Error Responses**:
    - `404 Not Found`: Agent does not exist.

---

## 10. Frontend UI & User Experience

- **Live URL**: `http://localhost:3000`
- **Dashboard Features**:
  - **Fleet KPI Metrics**: Instant overview of Total Fleet, Active Count, Inactive Count, and Recent Additions.
  - **Real-Time Redis Cache Indicator**: Dynamic pill badge in header showing `Redis: Cache HIT` (green) vs `Redis: Cache MISS` (amber).
  - **Fast Interactive Filtering**: Search by name, phone, email, or area with 300ms debounce.
  - **Instant Status Toggle**: Toggle an agent's active status directly from table rows with optimistic UI updates.
  - **Safe Deletion Dialog**: Prevents accidental data destruction with explicit agent identity confirmation.
  - **Interactive Details Drawer**: Full inspection view with 1-click UUID copying, registration timestamps, and vehicle specifications.
  - **Accessible Toast Notifications**: Non-intrusive feedback on creation, update, deletion, and network status.

---

## 11. Testing Suite

The backend includes a comprehensive Jest and Supertest test suite validating all REST endpoints, Zod schema validation, Prisma persistence, Redis cache hits/misses, and cache invalidation.

To run the backend test suite:
```bash
npm run test:backend
```
*(Or inside `backend/`: `npm test`)*

### Test Coverage Highlights:
- `POST /api/agents`: Valid creation, missing fields (400), invalid email (400), duplicate email (409).
- `GET /api/agents`: Cache miss on first call, Cache hit on repeat call, search filter, status filter, pagination.
- `GET /api/agents/:id`: Cache miss/hit behavior, non-existent UUID (404), invalid UUID format (400).
- `PUT /api/agents/:id`: Update execution, cache invalidation verification on list and item keys.
- `PATCH /api/agents/:id/status`: Status toggling and cache invalidation.
- `DELETE /api/agents/:id`: Successful deletion and cache eviction.
- `GET /api/health`: Database and Redis connection health diagnostics.

---

## 12. Project Structure

```text
PrepPro/
├── docker-compose.yml           # PostgreSQL 16 & Redis 7 container specifications
├── package.json                 # Monorepo management scripts
├── README.md                    # Detailed documentation
├── .gitignore                   # Multi-tier git ignore rules
├── .env.example                 # Root environment variables guide
│
├── backend/
│   ├── src/
│   │   ├── config/              # Prisma, Redis, and Environment loaders
│   │   │   ├── env.ts
│   │   │   ├── prisma.ts
│   │   │   └── redis.ts
│   │   ├── cache/               # Redis query indexing & SCAN invalidation logic
│   │   │   └── agentCache.ts
│   │   ├── controllers/         # Express endpoint request handlers
│   │   │   └── agentController.ts
│   │   ├── middleware/          # Central error handler, 404, Zod validator
│   │   │   ├── errorHandler.ts
│   │   │   └── validateRequest.ts
│   │   ├── routes/              # Express route declarations
│   │   │   ├── agentRoutes.ts
│   │   │   └── healthRoutes.ts
│   │   ├── services/            # Core business logic and database queries
│   │   │   └── agentService.ts
│   │   ├── utils/               # Response formatters and custom errors
│   │   │   ├── apiResponse.ts
│   │   │   └── errors.ts
│   │   ├── validators/          # Zod validation schemas
│   │   │   └── agentValidator.ts
│   │   ├── app.ts               # Express app instance & middlewares
│   │   └── server.ts            # Server bootstrap and graceful shutdown
│   ├── prisma/
│   │   ├── schema.prisma        # PostgreSQL Agent model & indexes
│   │   ├── migrations/          # Applied migrations
│   │   └── seed.ts              # 12 sample delivery agents seed script
│   ├── tests/
│   │   └── agent.test.ts        # Comprehensive Supertest suite
│   ├── jest.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── app/
    │   ├── globals.css          # Tailwind CSS base styles and animations
    │   ├── layout.tsx           # HTML Root layout & SEO meta
    │   └── page.tsx             # Main dashboard page with full state logic
    ├── components/
    │   ├── Header.tsx           # Navigation bar with Redis cache badge
    │   ├── StatsOverview.tsx    # Fleet KPI statistics cards
    │   ├── AgentTable.tsx       # Fleet directory table with actions
    │   ├── AgentModal.tsx       # Add / Edit form modal with live validation
    │   ├── AgentDetailModal.tsx # Inspection view with copyable UUID
    │   ├── DeleteConfirmModal.tsx # Delete confirmation dialog
    │   ├── Pagination.tsx       # Responsive page navigation
    │   ├── SkeletonTable.tsx    # Shimmer loading skeleton
    │   └── Toast.tsx            # Toast notification container
    ├── lib/
    │   └── api.ts               # Strongly typed API client
    ├── types/
    │   └── agent.ts             # Shared frontend TypeScript interfaces
    ├── tailwind.config.js
    ├── next.config.js
    ├── tsconfig.json
    ├── package.json
    └── .env.local
```

---

## 13. Key Design & Architectural Decisions

1. **Separation of Concerns**: Strict decoupling across Controllers (HTTP translation), Services (business logic & cache orchestration), Validators (Zod rules), and Cache layer.
2. **Resilient Redis Fallback**: If Redis becomes temporarily unreachable, the application logs a warning and automatically falls back to PostgreSQL without throwing 500 errors to the user.
3. **Non-blocking Cache Invalidation**: Used `redis.scan` with `MATCH` instead of `redis.keys` to safely evict query-variant list keys without causing blocking latency spikes in Redis.
4. **Optimistic UI Updates**: Toggling an agent's active status on the frontend updates state immediately for zero perceived latency, and rolls back with an error notification if the backend rejects the change.
5. **Standardized JSON Envelope**: All API endpoints return a standardized structure with `{ success: true, data, pagination, cached }` or `{ success: false, error: { message, code } }`.
