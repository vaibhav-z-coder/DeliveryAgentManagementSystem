# 🚚 Delivery Agent Management System (DAMS)

[![CI Pipeline](https://github.com/vaibhav-z-coder/DeliveryAgentManagementSystem/actions/workflows/ci.yml/badge.svg)](https://github.com/vaibhav-z-coder/DeliveryAgentManagementSystem/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg?logo=next.js)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.21-lightgrey.svg?logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.21-2D3748.svg?logo=prisma)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D.svg?logo=redis)](https://redis.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Jest](https://img.shields.io/badge/Jest-29.7-C21325.svg?logo=jest)](https://jestjs.io/)

A modern, production-grade, full-stack **Delivery Agent Management System (DAMS)** designed for logistics operations, courier hubs, and dispatch teams. Built with **Next.js 14**, **Node.js/Express**, **TypeScript**, **PostgreSQL (Prisma ORM)**, and **Redis Cache**.

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Candidate PRD Compliance Matrix](#-candidate-prd-compliance-matrix)
3. [Key Features](#-key-features)
4. [Technology Stack](#-technology-stack)
5. [Database Selection & Rationale (Why PostgreSQL?)](#-database-selection--rationale-why-postgresql)
6. [Redis Caching Architecture & Consistency Strategy](#-redis-caching-architecture--consistency-strategy)
7. [System Architecture](#-system-architecture)
8. [Getting Started & Local Setup](#-getting-started--local-setup)
9. [Environment Variables](#-environment-variables)
10. [REST API Documentation](#-rest-api-documentation)
11. [Step-by-Step Manual cURL Testing Walkthrough](#-step-by-step-manual-curl-testing-walkthrough)
12. [Automated Testing Suite (Jest + Supertest)](#-automated-testing-suite)
13. [Frontend UI & User Experience](#-frontend-ui--user-experience)
14. [Deployment Guide (Vercel & Render)](#-deployment-guide)
15. [Project Directory Structure](#-project-directory-structure)
16. [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🌟 Project Overview

The **Delivery Agent Management System (DAMS)** is a web application providing dispatch managers with a centralized control plane to register, track, update, and manage delivery agent fleets.

It features complete end-to-end CRUD capabilities, centralized error handling, runtime validation with **Zod**, persistent relational storage with **PostgreSQL**, and multi-level response caching powered by **Redis** with automated cache invalidation upon any data mutation.

---

## ✅ Candidate PRD Compliance Matrix

This project was built strictly against the candidate requirements. Here is how each specification is satisfied:

| PRD Requirement | Specification in PRD | Implementation Details in This Project | Status |
| :--- | :--- | :--- | :---: |
| **Backend Technology** | Node.js backend | Express.js 4.21 with Node.js 18+ and TypeScript | ✅ Fulfilled |
| **Frontend Technology** | Any frontend technology (Next.js recommended) | Next.js 14 (App Router) + Tailwind CSS + Lucide React | ✅ Fulfilled |
| **Redis Caching** | Cache suitable API responses | `ioredis` caching for agent listings (`agents:list:*`), profile lookups (`agent:{id}`), and fleet metrics (`agents:stats`) | ✅ Fulfilled |
| **Cache Consistency** | Invalidate/refresh on Create, Update, Delete | Automated non-blocking `SCAN` iteration + pipelined `DEL` eviction upon write mutations | ✅ Fulfilled |
| **Persistent Database** | Choose database and document choice | PostgreSQL 16 with Prisma ORM; documented in [Section 5](#-database-selection--rationale-why-postgresql) | ✅ Fulfilled |
| **Agent Attributes** | ID, Full name, Phone, Email, Service area, Status, Timestamps | All required fields implemented with UUID primary key, `createdAt`, `updatedAt`, plus bonus vehicle fields | ✅ Fulfilled |
| **Core CRUD Flows** | Create, View (list + single), Update, Delete | Full CRUD REST endpoints with Zod validation + interactive UI modal workflows | ✅ Fulfilled |
| **API Design & Status Codes** | Appropriate HTTP methods and status codes | `POST (201)`, `GET (200)`, `PUT (200)`, `PATCH (200)`, `DELETE (200)`, `400`, `404`, `409`, `500` | ✅ Fulfilled |
| **Submission Artifacts** | README with setup, env vars, DB migration, testing steps | Comprehensive README, `.env.example`, Prisma migrations, 17 Jest tests, and cURL walkthrough | ✅ Fulfilled |

---

## ⚡ Key Features

- **Full Delivery Agent Lifecycle (CRUD)**:
  - ➕ **Register**: Add delivery agents with contact details, operational area, and vehicle assignment.
  - 📋 **Directory**: Paginated, filterable, and searchable agent fleet directory.
  - 🔍 **Granular Inspection**: Modal drawer showing complete agent metadata, copyable UUIDs, timestamps, and vehicle specifications.
  - ✏️ **Edit & Update**: Real-time form pre-filling with instant client and server validation.
  - 🔄 **Quick Status Toggle**: Optimistic toggle between `ACTIVE` and `INACTIVE` states with immediate feedback.
  - 🗑️ **Safe Deletion Workflow**: Two-step confirmation modal preventing accidental data destruction.
- **Enterprise-Grade Redis Caching**:
  - High-speed caching on agent listings (`agents:list:*`) and individual lookups (`agent:{id}`).
  - Transparent HTTP response header telemetry (`X-Cache: HIT` / `X-Cache: MISS`).
  - Automatic non-blocking pattern-based cache invalidation (`SCAN` / `DEL`) on agent creation, update, and deletion.
  - Graceful degradation: Continues serving directly from PostgreSQL if Redis is offline.
- **Real-Time Fleet KPI Analytics**:
  - Instant dashboard cards for Total Fleet, Active Agents, Inactive Agents, and New Additions (last 7 days).
- **Centralized Error Handling**:
  - Standardized JSON error envelope (`{ success: false, error: { message, code, details } }`).
  - Strict HTTP status code adherence without leaking internal stack traces.

---

## 🛠️ Technology Stack

| Layer | Technologies | Justification |
| :--- | :--- | :--- |
| **Frontend** | [Next.js 14](https://nextjs.org/) (App Router), [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) | Fast server-side rendering, client component interactivity, modern utility-first styling. |
| **Backend** | [Node.js](https://nodejs.org/) (v18+), [Express.js](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/) | Battle-tested, lightweight HTTP server framework with static typing. |
| **Database** | [PostgreSQL 16](https://www.postgresql.org/), [Prisma ORM 5](https://www.prisma.io/) | Relational consistency, ACID transactions, strict unique constraints, B-tree indexes. |
| **Cache** | [Redis 7](https://redis.io/) (`ioredis`) | In-memory key-value store for sub-millisecond read latency and non-blocking invalidation. |
| **Validation** | [Zod](https://zod.dev/) | Type-safe schema validation on request bodies, query params, and URL route parameters. |
| **Testing** | [Jest 29](https://jestjs.io/), [ts-jest](https://kulshekhar.github.io/ts-jest/), [Supertest](https://github.com/ladjs/supertest) | End-to-end HTTP integration testing and cache verification. |
| **CI/CD** | [GitHub Actions](https://github.com/features/actions) | Automated linting, test suite execution, and frontend build validation on every push. |
| **Containerization** | [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/) | Deterministic local environment provisioning with health checks. |

---

## 🗄️ Database Selection & Rationale (Why PostgreSQL?)

> *PRD Requirement: "Choose a database for persistent storage and document your choice."*

For the Delivery Agent Management System, **PostgreSQL 16** was selected as the persistent relational database, managed via **Prisma ORM**. The rationale for choosing PostgreSQL over alternative databases (such as MongoDB or SQLite) is grounded in domain-specific logistics requirements:

### 1. Relational Integrity & Schema Enforcement
Delivery fleet management systems require strict data hygiene. Delivery agents are bound to specific operational hubs, vehicle specifications, unique contact details, and state machines (`ACTIVE` vs `INACTIVE`). PostgreSQL enforces schema validation at the engine level, eliminating unstructured anomalies that frequently occur in schema-less document stores like MongoDB.

### 2. ACID Concurrency & Uniqueness Guarantees
In dispatch operations, concurrent updates (e.g. multiple dispatchers modifying agent availability or reassigning service areas) require strict ACID guarantees:
- **Unique Email Index**: Prevents duplicate driver profiles under high-concurrency race conditions.
- **Transactional Consistency**: Prisma transactions guarantee that database mutations and state transitions succeed atomically.

### 3. Optimized B-Tree Indexing for Search & Filtering
Logistics dashboards frequently filter by status, service area, and onboarding recency. In PostgreSQL, we created dedicated B-Tree indexes:
- `@@index([status])`: Accelerates fleet filtering (`ACTIVE` vs `INACTIVE`).
- `@@index([serviceArea])`: Speeds up geographic queries.
- `@@index([createdAt])`: Enhances reverse-chronological pagination.

### 4. Prisma ORM Type Safety
Prisma generates strongly typed TypeScript definitions directly from the database schema (`schema.prisma`). Any change in the data model causes compile-time TypeScript errors if controllers or services are out of sync, preventing runtime bugs.

### 5. Why Not SQLite or MongoDB?
- **Why not SQLite?** SQLite uses file-level locking, which can cause concurrency bottlenecks in multi-instance web servers or serverless environments.
- **Why not MongoDB?** Fleet management data is structured and relational; document stores lack built-in relational constraints and require manual application-level checks to prevent orphaned data.

### Database Schema (`backend/prisma/schema.prisma`)
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
  vehicleType   String?     // e.g., Electric Scooter, Bike, Van
  vehicleNumber String?     // e.g., KA-01-AB-1234
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([status])
  @@index([serviceArea])
  @@index([createdAt])
  @@map("agents")
}
```

---

## 🚀 Redis Caching Architecture & Consistency Strategy

> *PRD Requirement: "Cache appropriate read responses, such as the agent list or individual agent details. Keep cached data consistent when agents are created, updated, or deleted. Document what you cache and how you invalidate or refresh it."*

Redis acts as an in-memory acceleration layer in front of PostgreSQL.

### What is Cached?

| Key Pattern | Data Stored | TTL | Purpose |
| :--- | :--- | :--- | :--- |
| `agents:list:*` | Filtered, sorted, and paginated agent lists (e.g., `agents:list:limit=10:page=1:search=rahul:sortBy=createdAt:sortOrder=desc`) | 60 seconds | Eliminates repeat database scans on common dashboard queries. |
| `agent:{id}` | Single agent record by UUID | 60 seconds | Sub-millisecond detail drawer / inspection view loading. |
| `agents:stats` | Fleet analytics (Total, Active, Inactive, 7-day additions) | 60 seconds | Avoids repetitive aggregate count queries (`COUNT(*)`, `COUNT(WHERE status = 'ACTIVE')`). |

### How Cache Consistency is Maintained (Invalidation Strategy)

Whenever write operations occur, we immediately invalidate stale cache entries:

```text
Write Operation Triggered:
  - POST /api/agents        (Create)
  - PUT /api/agents/:id     (Update)
  - PATCH /api/agents/:id/status (Toggle Status)
  - DELETE /api/agents/:id  (Delete)
              │
              ▼
  1. Complete PostgreSQL transaction
              │
              ▼
  2. Non-blocking SCAN iteration: MATCH 'agents:list*'
              │
              ▼
  3. Pipelined DEL of all matching list keys
              │
              ▼
  4. DEL specific entity key: 'agent:{id}'
              │
              ▼
  5. DEL fleet analytics key: 'agents:stats'
              │
              ▼
  6. Return success response to client
```

### High-Performance Non-Blocking Invalidation
Instead of using `redis.keys()` (which blocks the single-threaded Redis event loop and causes production latency spikes), we implemented **`AgentCache.invalidateByPattern()`** using **`redis.scan` with cursor iteration** and pipelined batch deletions.

### Graceful Degradation (Offline Fallback)
If Redis goes down or the connection drops:
1. `isRedisConnected` flag detects the disconnection.
2. The service logs a warning and automatically routes queries directly to PostgreSQL.
3. The API continues serving requests without crashing or returning `500 Internal Server Error`.

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

## ⚙️ Getting Started & Local Setup

### Prerequisites
- **Node.js** v18+ (tested on Node v20/v22)
- **npm** v9+
- **Docker & Docker Compose** (for automated PostgreSQL & Redis spin-up)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/vaibhav-z-coder/DeliveryAgentManagementSystem.git
cd DeliveryAgentManagementSystem
```

### Step 2: Start Infrastructure Containers (PostgreSQL & Redis)
```bash
docker compose up -d
```
Verify containers are healthy:
```bash
docker compose ps
```

### Step 3: Install Dependencies
```bash
npm run install:all
```
*(Installs dependencies for both `backend` and `frontend`)*

### Step 4: Configure Environment Files
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### Step 5: Run Database Migrations & Seed Sample Data
```bash
npm run db:migrate
npm run db:seed
```
*(Populates 12 realistic delivery agents across various regions)*

### Step 6: Start Development Servers
In Terminal 1 (Backend API):
```bash
npm run dev:backend
```
In Terminal 2 (Frontend Dashboard):
```bash
npm run dev:frontend
```

- **Frontend URL**: [http://localhost:3000](http://localhost:3000)
- **Backend API URL**: [http://localhost:5050/api](http://localhost:5050/api)
- **Health Check**: [http://localhost:5050/api/health](http://localhost:5050/api/health)

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5050` | Express HTTP port |
| `NODE_ENV` | `development` | Environment mode (`development` / `production` / `test`) |
| `DATABASE_URL` | `postgresql://dams_user:dams_password@localhost:5432/dams_db?schema=public` | PostgreSQL connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `REDIS_TTL` | `60` | Default cache TTL in seconds |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed origin for frontend requests |

### Frontend (`frontend/.env.local`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5050/api` | API Base URL for HTTP requests |

---

## 📡 REST API Documentation

Base URL: `http://localhost:5050/api`

| Method | Endpoint | Description | Cache Behavior |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Health diagnostic (DB & Redis connection check) | Bypasses Cache |
| `GET` | `/agents/stats` | Aggregated fleet KPI metrics | Cached (`agents:stats`) |
| `GET` | `/agents` | List agents (pagination, search, sort, status filter) | Cached (`agents:list:*`) |
| `POST` | `/agents` | Create new delivery agent | Invalidates list & stats cache |
| `GET` | `/agents/:id` | Get individual agent by UUID | Cached (`agent:{id}`) |
| `PUT` | `/agents/:id` | Update agent details | Invalidates agent, list & stats |
| `PATCH` | `/agents/:id/status`| Toggle active/inactive status | Invalidates agent, list & stats |
| `DELETE` | `/agents/:id` | Permanently delete agent | Invalidates agent, list & stats |

---

## 🧪 Step-by-Step Manual cURL Testing Walkthrough

> *PRD Requirement: "Tests or clear steps for testing the main CRUD flows"*

You can test the entire CRUD lifecycle, Redis caching, and cache invalidation directly in your terminal using `curl`:

### Step 1: Health Diagnostic
```bash
curl -s http://localhost:5050/api/health | jq
```
*Expected response: `"status": "healthy"`, `"database": "connected"`, `"redis": "connected"`.*

---

### Step 2: Create a New Delivery Agent (POST)
```bash
curl -s -X POST http://localhost:5050/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Aman Verma",
    "phone": "+91 98765 11223",
    "email": "aman.verma@example.com",
    "serviceArea": "HSR Layout, Bangalore",
    "status": "ACTIVE",
    "vehicleType": "Electric Scooter (Ather 450X)",
    "vehicleNumber": "KA-01-EQ-9988"
  }' | jq
```
*Note down the returned `"id"` (e.g. `AGENT_ID`).*

---

### Step 3: Verify Redis Cache MISS on First Query (GET)
```bash
curl -i -s "http://localhost:5050/api/agents?page=1&limit=10" | grep -E "(X-Cache|HTTP)"
```
*Expected header: `X-Cache: MISS` (Query was executed against PostgreSQL and cached).*

---

### Step 4: Verify Redis Cache HIT on Repeat Query (GET)
```bash
curl -i -s "http://localhost:5050/api/agents?page=1&limit=10" | grep -E "(X-Cache|HTTP)"
```
*Expected header: `X-Cache: HIT` (Served instantly from Redis cache without database query).*

---

### Step 5: Get Individual Agent Details (GET)
```bash
curl -i -s "http://localhost:5050/api/agents/<AGENT_ID>" | grep -E "(X-Cache|HTTP)"
```
*First request returns `X-Cache: MISS`. Repeating the command immediately returns `X-Cache: HIT`.*

---

### Step 6: Update Agent Information & Verify Cache Invalidation (PUT)
```bash
curl -s -X PUT "http://localhost:5050/api/agents/<AGENT_ID>" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceArea": "Koramangala 4th Block, Bangalore"
  }' | jq
```
Now immediately check the list cache again:
```bash
curl -i -s "http://localhost:5050/api/agents?page=1&limit=10" | grep -E "(X-Cache|HTTP)"
```
*Expected header: `X-Cache: MISS`! This confirms the write operation evicted the cached list.*

---

### Step 7: Toggle Status (PATCH)
```bash
curl -s -X PATCH "http://localhost:5050/api/agents/<AGENT_ID>/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "INACTIVE"}' | jq
```

---

### Step 8: Delete Agent (DELETE)
```bash
curl -s -X DELETE "http://localhost:5050/api/agents/<AGENT_ID>" | jq
```
*Expected response: `"message": "Delivery agent successfully deleted"`.*

---

## 🧪 Automated Testing Suite

The project includes an automated test suite with **17 test cases** covering all CRUD endpoints, Zod schema validation, Redis cache hit/miss behavior, and cache invalidation.

```bash
# Run backend test suite
npm run test:backend

# Or directly in backend folder
cd backend && npm test
```

### Test Results Breakdown:
```text
PASS tests/agent.test.ts
  Delivery Agent Management System - REST API & Cache Tests
    GET /api/health
      ✓ should return 200 and healthy service statuses
    POST /api/agents (Create Agent)
      ✓ should create a new delivery agent with valid payload
      ✓ should reject creation with missing required fields (400)
      ✓ should reject creation with invalid email format (400)
      ✓ should reject creation with duplicate email (409 Conflict)
    GET /api/agents (List & Redis Caching)
      ✓ should fetch list on first call with Cache MISS
      ✓ should serve subsequent call from Redis with Cache HIT
      ✓ should support search query filter
      ✓ should support status filtering
    GET /api/agents/:id (Single Agent)
      ✓ should return agent details and cache on miss then hit on second call
      ✓ should return 404 for non-existent UUID
      ✓ should return 400 for invalid UUID format
    PUT /api/agents/:id (Update Agent & Cache Invalidation)
      ✓ should update agent and invalidate caches
      ✓ should return 404 when updating non-existent agent
    PATCH /api/agents/:id/status (Toggle Status)
      ✓ should update status and invalidate cache
    DELETE /api/agents/:id (Delete Agent & Cache Invalidation)
      ✓ should delete agent and invalidate cache
      ✓ should return 404 when deleting already deleted or non-existent agent

Test Suites: 1 passed, 1 total
Tests:       17 passed, 17 total
```

---

## 💻 Frontend UI & User Experience

- **Fleet Overview**: Top KPI cards displaying Total Fleet, Active, Inactive, and 7-day additions.
- **Debounced Instant Search**: 300ms debounce across Name, Email, Phone, and Service Area.
- **Sorting & Filtering**: Instant filter by status (`ALL`, `ACTIVE`, `INACTIVE`) and sort order.
- **Optimistic Status Toggling**: Click to toggle active state instantly; rolls back if network fails.
- **Accessible Modals & Drawers**:
  - `AgentModal`: Handles Add and Edit operations with live client validation.
  - `AgentDetailModal`: Slide-over card for full inspection with one-click UUID copy.
  - `DeleteConfirmModal`: Confirmation safeguard with agent name confirmation.
- **Loading & Feedback States**: Shimmer skeleton table loading states and animated toast alerts.

---

## 🌐 Deployment Guide

### Cloud Architecture

| Component | Platform | Configuration |
| :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com/) | Root Directory: `frontend` |
| **Backend API** | [Render](https://render.com/) / [Railway](https://railway.app/) | Root Directory: `backend` |
| **PostgreSQL** | [Neon](https://neon.tech/) / [Render PostgreSQL](https://render.com/) | Serverless managed PostgreSQL |
| **Redis Cache**| [Upstash](https://upstash.com/) / [Render Redis](https://render.com/) | Serverless managed Redis |

---

### Step 1: Deploy Backend on Render
1. Create a **Web Service** on Render connected to this repository.
2. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start`
3. Environment Variables:
   - `PORT`: `5050`
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: *(Your PostgreSQL connection string)*
   - `REDIS_URL`: *(Your Redis connection string)*
   - `REDIS_TTL`: `60`
   - `CORS_ORIGIN`: `https://your-frontend-domain.vercel.app`

---

### Step 2: Deploy Frontend on Vercel
1. Import repository into Vercel.
2. In Project Settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Select `frontend`
3. Environment Variable:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend.onrender.com/api`
4. Click **Deploy**.

---

## 📁 Project Directory Structure

```text
DeliveryAgentManagementSystem/
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated CI pipeline (Tests & Build)
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
    │   ├── AgentModal.tsx       # Create / Edit modal with live validation
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
