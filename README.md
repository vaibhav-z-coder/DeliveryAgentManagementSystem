# 🚚 Delivery Agent Management System (DAMS)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg?logo=next.js)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.21-lightgrey.svg?logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.21-2D3748.svg?logo=prisma)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D.svg?logo=redis)](https://redis.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Jest](https://img.shields.io/badge/Jest-29.7-C21325.svg?logo=jest)](https://jestjs.io/)

A modern, production-grade, full-stack **Delivery Agent Management System (DAMS)** designed for logistics operations, courier fleets, and delivery hubs. Built with **Next.js 14**, **Node.js/Express**, **TypeScript**, **PostgreSQL (Prisma ORM)**, and **Redis In-Memory Cache**.

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [System Architecture](#-system-architecture)
5. [Database Schema](#-database-schema)
6. [Redis Caching Architecture & Strategy](#-redis-caching-architecture--strategy)
7. [Getting Started & Local Setup](#-getting-started--local-setup)
8. [Environment Variables](#-environment-variables)
9. [REST API Documentation](#-rest-api-documentation)
10. [Frontend UI & User Experience](#-frontend-ui--user-experience)
11. [Testing Suite](#-testing-suite)
12. [Deployment Guide (Vercel & Render)](#-deployment-guide)
13. [Project Directory Structure](#-project-directory-structure)
14. [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🌟 Project Overview

The **Delivery Agent Management System (DAMS)** provides operations and dispatch teams with a centralized control plane to register, track, update, and manage delivery agent fleets.

### What makes it production-ready?
- **Strict Data Validation**: Runtime validation with **Zod** on both server and client layers.
- **Relational Integrity**: Backed by **PostgreSQL** with Prisma schema migrations and optimized indexes.
- **Intelligent Response Caching**: Multi-level **Redis caching** on queries and aggregates with non-blocking key invalidation (`SCAN` + `DEL`).
- **Resilient Fallback**: Graceful degradation to PostgreSQL if Redis is unreachable.
- **Unified API Response Envelope**: Consistent response formatting and HTTP status codes (`200`, `201`, `400`, `404`, `409`, `500`).
- **Modern User Experience**: Reactive dashboard with optimistic UI updates, debounced live search, modal workflows, and responsive layouts.

---

## ⚡ Key Features

- **Full Delivery Agent Lifecycle (CRUD)**:
  - ➕ **Register**: Add delivery agents with full name, phone number, unique email, service area, and vehicle details.
  - 📋 **Directory**: Paginated, filterable, and searchable agent directory with customizable sorting.
  - 🔍 **Inspect Details**: Modal drawer showing complete agent metadata, copyable UUID, timestamps, and vehicle specifications.
  - ✏️ **Edit & Update**: Real-time form pre-filling with instant client and server validation.
  - 🔄 **Quick Status Toggle**: Optimistic toggle between `ACTIVE` and `INACTIVE` states with immediate feedback.
  - 🗑️ **Safe Deletion**: Two-step confirmation modal preventing accidental data loss.
- **High-Performance Redis Caching**:
  - Transparent HTTP response header telemetry (`X-Cache: HIT` / `X-Cache: MISS`).
  - Cache tags: `agents:list:*` (query-indexed lists), `agent:{id}` (profile lookups), and `agents:stats` (KPI counts).
  - Automated cache eviction on write operations (`POST`, `PUT`, `PATCH`, `DELETE`).
- **Live Fleet KPI Analytics**:
  - Instant dashboard cards for Total Fleet, Active Agents, Inactive Agents, and New Additions (last 7 days).
- **Comprehensive Test Coverage**:
  - Integration and unit tests using Jest, ts-jest, and Supertest validating all endpoints and cache invalidation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js 14](https://nextjs.org/) (App Router), [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) |
| **Backend** | [Node.js](https://nodejs.org/) (v18+), [Express.js](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/), [tsx](https://github.com/privatenumber/tsx) |
| **Database** | [PostgreSQL 16](https://www.postgresql.org/), [Prisma ORM 5](https://www.prisma.io/) |
| **In-Memory Cache** | [Redis 7](https://redis.io/) (`ioredis`) |
| **Validation** | [Zod](https://zod.dev/) |
| **Testing** | [Jest 29](https://jestjs.io/), [ts-jest](https://kulshekhar.github.io/ts-jest/), [Supertest](https://github.com/ladjs/supertest) |
| **Containerization** | [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/) |

---

## 🏛️ System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 14 Frontend                      │
│   (App Router, Server/Client Components, Tailwind, Lucide)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                       HTTP / REST API
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express.js Backend API                    │
│   (Routing, Zod Validation, Controllers, Agent Service)     │
└──────────────────────┬──────────────────────┬───────────────┘
                       │                      │
          Read / Invalidate Cache        Database Queries
                       │                      │
                       ▼                      ▼
             ┌───────────────────┐  ┌───────────────────┐
             │   Redis 7 Cache   │  │   PostgreSQL 16   │
             │ (Query Indexing,  │  │   (Prisma ORM,    │
             │  SCAN eviction)   │  │   Indexed Tables) │
             └───────────────────┘  └───────────────────┘
```

---

## 🗄️ Database Schema

Defined in `backend/prisma/schema.prisma` and mapped to the PostgreSQL table `agents`:

```prisma
enum AgentStatus {
  ACTIVE
  INACTIVE
}

model Agent {
  id            String      @id @default(uuid())
  fullName      String
  phone         String
  email         String      @unique
  serviceArea   String
  status        AgentStatus @default(ACTIVE)
  vehicleType   String?     // e.g., Bike, Scooter, Electric Scooter, Van
  vehicleNumber String?     // e.g., KA-01-AB-1234
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([status])
  @@index([serviceArea])
  @@index([createdAt])
  @@map("agents")
}
```

### Database Indexes
- `email`: Unique index preventing duplicate registrations.
- `status`: B-tree index optimizing fleet status filtering (`ACTIVE` vs `INACTIVE`).
- `serviceArea`: B-tree index optimizing geographical lookups.
- `createdAt`: B-tree index supporting default reverse-chronological sorting.

---

## 🚀 Redis Caching Architecture & Strategy

Redis functions as a high-speed read cache positioned in front of PostgreSQL.

### Key Naming Conventions

| Key Pattern | Description | TTL | Invalidation Triggers |
| :--- | :--- | :--- | :--- |
| `agents:list:*` | Query-indexed list caches with hashed filters (e.g., `agents:list:limit=10:page=1:search=rahul:sortBy=createdAt:sortOrder=desc`) | 60s | Agent Created, Updated, Deleted, Status Toggled |
| `agent:{id}` | Single agent profile cache by UUID | 60s | Agent Updated, Deleted, Status Toggled |
| `agents:stats` | Fleet analytics (Total, Active, Inactive, 7-day delta) | 60s | Agent Created, Updated, Deleted, Status Toggled |

### Cache Flow Diagram

```text
Incoming Request: GET /api/agents?page=1&limit=10
                       │
                       ▼
             Is Redis Connected?
            ├── NO ──► Fetch directly from PostgreSQL ──► Response [X-Cache: MISS]
            └── YES
                 │
                 ▼
          Check Redis Key: agents:list:...
         ├── HIT  ──► Return Cached JSON ──────────────► Response [X-Cache: HIT]
         └── MISS
              │
              ▼
         Fetch from PostgreSQL via Prisma
              │
              ▼
         Store in Redis with 60s TTL
              │
              ▼
         Return Fresh JSON ─────────────────────────────► Response [X-Cache: MISS]
```

### Non-Blocking Cache Invalidation
When an agent is created, modified, or deleted:
1. The PostgreSQL transaction completes successfully.
2. The backend initiates a non-blocking `SCAN` iteration matching `agents:list*`.
3. Matched list keys are evicted in a pipelined batch using `DEL`.
4. The entity key `agent:{id}` and analytics key `agents:stats` are cleared.
5. Next read queries repopulate Redis transparently.

---

## ⚙️ Getting Started & Local Setup

### Prerequisites
- **Node.js** v18+ (tested on Node v20/v22)
- **npm** v9+
- **Docker & Docker Compose** (for automated PostgreSQL & Redis setup)

---

### Method A: Quick Start with Docker (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vaibhav-z-coder/DeliveryAgentManagementSystem.git
   cd DeliveryAgentManagementSystem
   ```

2. **Start PostgreSQL & Redis containers**:
   ```bash
   docker compose up -d
   ```
   *Verify running containers*: `docker compose ps`

3. **Install dependencies for root, backend, and frontend**:
   ```bash
   npm run install:all
   ```

4. **Set up backend environment variables**:
   ```bash
   cp backend/.env.example backend/.env
   ```

5. **Run database migrations and seed data**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

6. **Set up frontend environment variables**:
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```

7. **Start both development servers**:
   In terminal 1 (Backend):
   ```bash
   npm run dev:backend
   ```
   In terminal 2 (Frontend):
   ```bash
   npm run dev:frontend
   ```

8. **Open in browser**:
   - **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:5050/api](http://localhost:5050/api)
   - **Health Check**: [http://localhost:5050/api/health](http://localhost:5050/api/health)

---

### Method B: Manual Setup (Existing PostgreSQL & Redis)

If you already have PostgreSQL and Redis installed locally or hosted in the cloud:

1. Update `backend/.env` with your connection strings:
   ```env
   DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?schema=public"
   REDIS_URL="redis://<user>:<password>@<host>:<port>"
   ```
2. Navigate to `backend`:
   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npx tsx prisma/seed.ts
   npm run dev
   ```
3. In another terminal, navigate to `frontend`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🔐 Environment Variables

### Root / Backend (`backend/.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5050` | Port for Express API server |
| `NODE_ENV` | `development` | Runtime environment (`development` / `production`) |
| `DATABASE_URL` | `postgresql://dams_user:dams_password@localhost:5432/dams_db?schema=public` | PostgreSQL connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `REDIS_TTL` | `60` | Cache time-to-live in seconds |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed origin for CORS (comma-separated or single) |

### Frontend (`frontend/.env.local`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5050/api` | Base URL for backend REST API |

---

## 📡 REST API Documentation

Base URL: `http://localhost:5050/api`

### 1. Health Check
Checks connectivity for database and Redis services.

- **Endpoint**: `GET /api/health`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "status": "healthy",
    "message": "API is healthy",
    "services": {
      "database": "connected",
      "redis": "connected"
    },
    "uptime": 240.5,
    "timestamp": "2026-10-07T14:30:00.000Z"
  }
  ```

---

### 2. Fleet Analytics / Stats
Fetches fleet totals and status distribution (cached).

- **Endpoint**: `GET /api/agents/stats`
- **Response Headers**: `X-Cache: HIT` or `X-Cache: MISS`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "total": 12,
      "active": 9,
      "inactive": 3,
      "recentlyAdded": 12
    },
    "cached": true
  }
  ```

---

### 3. List Delivery Agents
Returns a paginated list of delivery agents with optional filters.

- **Endpoint**: `GET /api/agents`
- **Query Parameters**:
  - `page` *(number, default: 1)*
  - `limit` *(number, default: 10, max: 100)*
  - `status` *(string, optional: `ACTIVE` | `INACTIVE`)*
  - `search` *(string, optional: matches name, email, phone, service area)*
  - `sortBy` *(string, default: `createdAt` - options: `fullName`, `createdAt`, `serviceArea`, `status`)*
  - `sortOrder` *(string, default: `desc` - options: `asc` | `desc`)*
- **Response Headers**: `X-Cache: HIT` or `X-Cache: MISS`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": [
      {
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
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 12,
      "totalPages": 2,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "cached": false
  }
  ```

---

### 4. Create Delivery Agent
Registers a new delivery agent. Automatically evicts cached lists and stats.

- **Endpoint**: `POST /api/agents`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "fullName": "Priya Nair",
    "phone": "+91 98123 45678",
    "email": "priya.nair@example.com",
    "serviceArea": "Koramangala, Bangalore",
    "status": "ACTIVE",
    "vehicleType": "Motorcycle (Hero Splendor)",
    "vehicleNumber": "KA-05-JK-4412"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "data": {
      "id": "4b689a77-3e11-4a25-8cb5-1205391a329e",
      "fullName": "Priya Nair",
      "phone": "+91 98123 45678",
      "email": "priya.nair@example.com",
      "serviceArea": "Koramangala, Bangalore",
      "status": "ACTIVE",
      "vehicleType": "Motorcycle (Hero Splendor)",
      "vehicleNumber": "KA-05-JK-4412",
      "createdAt": "2026-10-07T14:32:10.000Z",
      "updatedAt": "2026-10-07T14:32:10.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation error (invalid email format, empty fields).
  - `409 Conflict`: An agent with this email already exists.

---

### 5. Get Agent by ID
Retrieves details of an individual agent.

- **Endpoint**: `GET /api/agents/:id`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "id": "4b689a77-3e11-4a25-8cb5-1205391a329e",
      "fullName": "Priya Nair",
      "phone": "+91 98123 45678",
      "email": "priya.nair@example.com",
      "serviceArea": "Koramangala, Bangalore",
      "status": "ACTIVE",
      "vehicleType": "Motorcycle (Hero Splendor)",
      "vehicleNumber": "KA-05-JK-4412",
      "createdAt": "2026-10-07T14:32:10.000Z",
      "updatedAt": "2026-10-07T14:32:10.000Z"
    },
    "cached": true
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid UUID format.
  - `404 Not Found`: Agent not found.

---

### 6. Update Agent Details
Updates profile fields. Automatically evicts the agent's cache key and all list caches.

- **Endpoint**: `PUT /api/agents/:id`
- **Request Body** *(all fields optional)*:
  ```json
  {
    "fullName": "Priya K. Nair",
    "serviceArea": "HSR Layout, Bangalore"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "id": "4b689a77-3e11-4a25-8cb5-1205391a329e",
      "fullName": "Priya K. Nair",
      "phone": "+91 98123 45678",
      "email": "priya.nair@example.com",
      "serviceArea": "HSR Layout, Bangalore",
      "status": "ACTIVE",
      "vehicleType": "Motorcycle (Hero Splendor)",
      "vehicleNumber": "KA-05-JK-4412",
      "createdAt": "2026-10-07T14:32:10.000Z",
      "updatedAt": "2026-10-07T14:35:40.000Z"
    }
  }
  ```

---

### 7. Toggle Agent Status
Quick status modification (`ACTIVE` ↔ `INACTIVE`).

- **Endpoint**: `PATCH /api/agents/:id/status`
- **Request Body**:
  ```json
  {
    "status": "INACTIVE"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "id": "4b689a77-3e11-4a25-8cb5-1205391a329e",
      "status": "INACTIVE"
    }
  }
  ```

---

### 8. Delete Delivery Agent
Permanently removes an agent and purges all relevant cache keys.

- **Endpoint**: `DELETE /api/agents/:id`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "id": "4b689a77-3e11-4a25-8cb5-1205391a329e",
      "message": "Delivery agent successfully deleted"
    }
  }
  ```

---

## 💻 Frontend UI & User Experience

The frontend is crafted for efficiency and clarity:

- **Fleet Overview**: Top KPI cards displaying Total Fleet, Active, Inactive, and 7-day velocity.
- **Debounced Instant Search**: 300ms debounce across Name, Email, Phone, and Service Area.
- **Sorting & Filtering**: Instant filter by status (`ALL`, `ACTIVE`, `INACTIVE`) and sort order.
- **Optimistic Status Toggling**: Click to toggle active state instantly; gracefully rolls back if network fails.
- **Accessible Modals & Drawers**:
  - `AgentModal`: Handles Add and Edit operations with live client validation.
  - `AgentDetailModal`: Slide-over card for full inspection with one-click UUID copy.
  - `DeleteConfirmModal`: Confirmation safeguard with agent name confirmation.
- **Feedback & Feedback States**: Shimmer skeleton table loading states and animated toast alerts.

---

## 🧪 Testing Suite

The backend includes a comprehensive Jest test suite running against real or test database instances and Redis:

```bash
# Run backend test suite
npm run test:backend

# Or directly in backend directory
cd backend && npm test
```

### Key Scenarios Tested
- ✅ `POST /api/agents`: Valid creation, validation rejection (400), duplicate email rejection (409).
- ✅ `GET /api/agents`: Cache miss on initial query, cache hit on immediate repeat query.
- ✅ `GET /api/agents?search=...`: Accurate filter execution.
- ✅ `GET /api/agents/:id`: Individual lookup, cache behavior, 404 for missing IDs, 400 for malformed UUIDs.
- ✅ `PUT /api/agents/:id`: Field update and automatic cache invalidation confirmation.
- ✅ `PATCH /api/agents/:id/status`: Status toggling and cache invalidation.
- ✅ `DELETE /api/agents/:id`: Deletion and removal from cache and database.
- ✅ `GET /api/health`: Health status checks.

---

## 🌐 Deployment Guide

### Architecture for Cloud Production

| Component | Recommended Platform | Alternative |
| :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com/) | Cloudflare Pages, Netlify |
| **Backend API** | [Render](https://render.com/) | Railway, Fly.io, AWS ECS |
| **PostgreSQL** | [Neon](https://neon.tech/) / [Supabase](https://supabase.com/) | Render Managed PostgreSQL |
| **Redis** | [Upstash Redis](https://upstash.com/) | Render Managed Redis |

---

### Step 1: Deploy PostgreSQL & Redis

1. Create a PostgreSQL database on **Neon** or **Render**. Note your `DATABASE_URL`.
2. Create a Redis instance on **Upstash** (free tier available) or **Render**. Note your `REDIS_URL`.

---

### Step 2: Deploy Backend on Render

1. Sign in to [Render](https://dashboard.render.com/) and click **New +** > **Web Service**.
2. Connect your GitHub repository: `vaibhav-z-coder/DeliveryAgentManagementSystem`.
3. Configure the settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start`
4. Add the following **Environment Variables** in Render:
   - `PORT`: `5050`
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: *(Your production PostgreSQL connection string)*
   - `REDIS_URL`: *(Your production Redis connection string)*
   - `REDIS_TTL`: `60`
   - `CORS_ORIGIN`: `https://your-frontend-app.vercel.app` *(or `*` temporarily)*
5. Trigger initial migration & seed (via Render Shell or local connection):
   ```bash
   npx prisma migrate deploy
   ```
6. Your backend will be live at `https://your-backend.onrender.com`. Test health at `https://your-backend.onrender.com/api/health`.

---

### Step 3: Deploy Frontend on Vercel

1. Sign in to [Vercel](https://vercel.com/) and click **Add New...** > **Project**.
2. Import the `DeliveryAgentManagementSystem` repository.
3. In **Project Configuration**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click `Edit` and select `frontend`.
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend.onrender.com/api`
5. Click **Deploy**. Vercel will build and assign your production domain.
6. Remember to update the `CORS_ORIGIN` in Render with your actual Vercel domain!

---

## 📁 Project Directory Structure

```text
DeliveryAgentManagementSystem/
├── docker-compose.yml           # PostgreSQL 16 & Redis 7 Docker configuration
├── package.json                 # Monorepo orchestration scripts
├── README.md                    # Project documentation
├── .gitignore                   # Multi-tier ignore rules
├── .env.example                 # Root environment variable template
│
├── backend/
│   ├── src/
│   │   ├── config/              # Prisma client, Redis client, env validator
│   │   │   ├── env.ts
│   │   │   ├── prisma.ts
│   │   │   └── redis.ts
│   │   ├── cache/               # Redis key generation & SCAN invalidation
│   │   │   └── agentCache.ts
│   │   ├── controllers/         # Request handling & HTTP status codes
│   │   │   └── agentController.ts
│   │   ├── middleware/          # Centralized error handler & Zod validation
│   │   │   ├── errorHandler.ts
│   │   │   └── validateRequest.ts
│   │   ├── routes/              # Express API route bindings
│   │   │   ├── agentRoutes.ts
│   │   │   └── healthRoutes.ts
│   │   ├── services/            # Business logic & DB transactions
│   │   │   └── agentService.ts
│   │   ├── utils/               # Custom AppError & standardized response helper
│   │   │   ├── apiResponse.ts
│   │   │   └── errors.ts
│   │   ├── validators/          # Zod schemas for body, params, query
│   │   │   └── agentValidator.ts
│   │   ├── app.ts               # Express configuration, Helmet, CORS, Morgan
│   │   └── server.ts            # HTTP server startup & graceful shutdown
│   ├── prisma/
│   │   ├── schema.prisma        # Database model and indexes
│   │   ├── migrations/          # Version-controlled migrations
│   │   └── seed.ts              # 12 realistic sample agents
│   ├── tests/
│   │   └── agent.test.ts        # Comprehensive Supertest suite
│   ├── jest.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── app/
    │   ├── globals.css          # Tailwind CSS styles & animations
    │   ├── layout.tsx           # Global HTML shell & meta configuration
    │   └── page.tsx             # Main dashboard controller & state manager
    ├── components/
    │   ├── Header.tsx           # Navigation bar with action buttons
    │   ├── StatsOverview.tsx    # Fleet KPI statistics cards
    │   ├── AgentTable.tsx       # Interactive agent list table
    │   ├── AgentModal.tsx       # Create / Edit modal with real-time validation
    │   ├── AgentDetailModal.tsx # Side drawer for inspecting single agent
    │   ├── DeleteConfirmModal.tsx # Safe two-step deletion confirmation
    │   ├── Pagination.tsx       # Responsive pagination controller
    │   ├── SkeletonTable.tsx    # Shimmer table loader
    │   └── Toast.tsx            # Floating toast notification system
    ├── lib/
    │   └── api.ts               # Strongly typed API client wrapper
    ├── types/
    │   └── agent.ts             # TypeScript definitions
    ├── tailwind.config.js
    ├── next.config.js
    ├── tsconfig.json
    ├── package.json
    └── .env.example
```

---

## ❓ Troubleshooting & FAQs

### 1. `relation "Agent" does not exist`
In the Prisma schema, the model `Agent` is mapped to the table `"agents"` (`@@map("agents")`).
When running direct SQL queries in PostgreSQL:
```sql
-- Correct:
SELECT * FROM "agents" ORDER BY "createdAt" DESC;

-- Avoid:
SELECT * FROM "Agent";
```

### 2. Can the app run without Redis?
Yes! The backend includes a graceful fallback mechanism. If Redis is unavailable or down, read queries automatically bypass the cache and fetch directly from PostgreSQL, and write mutations succeed without crashing.

### 3. Vercel deployment asks for Root Directory
Because this is a monorepo containing both `backend/` and `frontend/`:
- In **Vercel**, set the Root Directory to **`frontend`**.
- In **Render**, create a Web Service and set the Root Directory to **`backend`**.
- Set `NEXT_PUBLIC_API_URL` on Vercel to your deployed Render URL.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
