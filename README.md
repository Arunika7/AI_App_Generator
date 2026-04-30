# Config-Driven Application Generator Platform

This is a production-grade, config-driven platform that dynamically generates backend APIs, database schemas, and frontend React UI purely from a JSON configuration (`app-config.json`).

## Architecture

- **Frontend**: Next.js (App Router), React, Tailwind CSS, TypeScript.
- **Backend**: Node.js, Express, TypeScript, `pg` (PostgreSQL client) for raw SQL dynamic schema sync.
- **Database**: PostgreSQL
- **Shared**: Zod schemas and TypeScript types defining the JSON config structure.

## Folder Structure
- `/frontend` - Next.js application (Dynamic Render Engine)
- `/backend` - Express backend (Schema Sync Engine, Dynamic APIs)
- `/shared` - Shared configurations and Zod definitions
- `app-config.json` - The master configuration file that drives the whole system.

## Setup Instructions (Local)

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Local or remote, e.g., Neon/Supabase)

### 1. Database Setup
Ensure PostgreSQL is running. Create a database for the application (e.g., `appgen`).

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://postgres:password@localhost:5432/appgen
   JWT_SECRET=super_secret_key_123
   ```
4. Run the backend (it will automatically parse `app-config.json` and sync the schema):
   ```bash
   npx ts-node-dev src/index.ts
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the frontend development server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000` to see your dynamic application!

## Deployment Instructions

### Backend (Render / Railway)
1. Set the Root Directory to `backend` (if supported) or push the backend folder as a separate repo.
2. Build Command: `npx tsc`
3. Start Command: `node dist/index.js`
4. Set Environment Variables:
   - `DATABASE_URL` (Your Neon/Supabase Postgres connection string)
   - `JWT_SECRET`
   - `PORT`

### Frontend (Vercel)
1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Set the Root Directory to `frontend`.
4. Framework Preset: Next.js.
5. Set Environment Variable:
   - `NEXT_PUBLIC_API_URL` (The deployed URL of your backend, e.g., `https://my-backend.onrender.com/api`)
6. Deploy!

## Graceful Degradation Strategy
The system is designed with **graceful degradation**—invalid configurations are ignored or gracefully stubbed, never fatal. For example, if a UI configuration requests a non-existent component or an invalid entity, the system renders a secure fallback UI and logs a structured warning, allowing the rest of the application to continue functioning seamlessly.

## Key Features Implemented
- **Schema-Driven Runtime**: This system prioritizes runtime interpretation over code generation, enabling immediate adaptability without rebuild cycles.
- **Config Parser**: Uses Zod to parse, validate, and safely fallback when configs have invalid parts.
- **Non-Destructive Schema Sync**: Translates `entities` in config into Postgres `CREATE TABLE` and `ALTER TABLE` queries automatically at startup, strictly adhering to non-destructive schema evolution (no automatic column drops or unsafe type coercions).
- **Extensible Component Registry**: Next.js catch-all routes mapping components via an object dictionary Registry Pattern. Proving extensibility is as simple as registering a new function in the registry mapping without touching core routing logic.
- **Dynamic API Generation**: Generic Express router serving `GET/POST/PUT/DELETE /api/dynamic/:entity`.
- **Observability**: Built-in structured request and error logging (`[CONFIG WARNING]`, `[API ERROR]`, `[SCHEMA WARNING]`).
- **CSV Import**: Dropzone enabled on table views for bulk data import.
- **i18n Multi-Language**: Built-in translation provider resolving text from config.
- **Event Notifications**: Pluggable trigger system logging mock emails after CRUD ops.
