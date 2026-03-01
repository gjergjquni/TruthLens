# TruthLens – Scientific Consensus Engine

A production-ready web application that analyzes user-submitted scientific claims using an academic-style methodology: misinformation risk assessment, mock literature sourcing, and a mathematical credibility algorithm with rich visualizations.

## Tech stack

- **Frontend:** React (Vite), TypeScript, TailwindCSS, Framer Motion, Recharts  
- **Backend:** Node.js, Express, PostgreSQL, Prisma ORM  

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or a hosted Postgres instance)
- npm or pnpm

## Quick start

### 1. Clone and install

```bash
cd TruthLens
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### 2. Database

Create a PostgreSQL database (e.g. `truthlens`). Then:

```bash
cd backend
cp .env.example .env
# Edit .env and set DATABASE_URL, e.g.:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/truthlens?schema=public"

npx prisma generate
npx prisma db push
```

### 3. Run backend and frontend

**Terminal 1 – API**

```bash
cd backend
npm run dev
```

API runs at `http://localhost:4000`. Health check: `GET /health`.

**Terminal 2 – Frontend**

```bash
cd frontend
npm run dev
```

App runs at `http://localhost:5173` and proxies `/api` to the backend.

App runs at `http://localhost:5173` and proxies `/api` to the backend and `/webhook` to n8n (see below).

### 4. (Optional) n8n integration

Claim analysis can be driven by an **n8n** workflow instead of the backend:

1. Run n8n (e.g. `npx n8n` or Docker) so it listens on `http://localhost:5678`.
2. Create a **Webhook** trigger in n8n with path `truthlens`, method **POST**, and **Respond to Webhook** enabled.
3. The frontend sends each claim as a POST to `/webhook/truthlens` with body:
   - `message` – claim text  
   - `id` – unique id  
   - `timestamp` – ISO timestamp  
4. Your workflow processes the payload and uses **Respond to Webhook** to return an object in the shape `{ "analysis": AnalysisResult }` (or a raw `AnalysisResult`). See `frontend/src/types.ts` for the `AnalysisResult` type.

In development, Vite proxies `/webhook` to `http://localhost:5678`, so no CORS setup is needed. For production, set `VITE_N8N_WEBHOOK_URL` to your n8n webhook URL (e.g. `https://your-n8n.com/webhook/truthlens`).

### 5. Use the app

1. Open `http://localhost:5173`.
2. Enter a scientific claim in the pill-shaped input (e.g. *"Intermittent fasting improves long-term cardiovascular outcomes in adults."*).
3. Click **Analyze Claim**.
4. View the dashboard: misinformation risk, consensus score gauge, sources, study-type distribution, credibility-over-time chart, knowledge gaps, and fact vs opinion breakdown.

## Project structure

```
TruthLens/
├── frontend/                 # React (Vite) app
│   ├── src/
│   │   ├── components/       # LayoutShell, ClaimInputHero, AnalysisDashboard, CircularConsensusGauge
│   │   ├── api.ts            # analyzeClaim() – sends to n8n webhook with message, id, timestamp
│   │   ├── types.ts          # AnalysisResult, Source, etc.
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.cjs
│   └── vite.config.ts        # proxy /api -> localhost:4000, /webhook -> localhost:5678 (n8n)
├── backend/
│   ├── prisma/
│   │   └── schema.prisma     # Claim, Source, Analysis
│   ├── src/
│   │   ├── lib/prisma.ts     # Prisma client
│   │   ├── routes/claims.ts  # POST /api/claims/analyze
│   │   ├── services/
│   │   │   ├── credibility.ts    # Weight formula, consensus, risk, distributions
│   │   │   └── semanticScholar.ts # Mock literature fetch
│   │   └── index.ts          # Express app
│   ├── .env.example
│   └── package.json
├── .env.example
└── README.md
```

## Environment variables

| Variable                 | Where    | Description |
|--------------------------|----------|-------------|
| `DATABASE_URL`           | backend  | PostgreSQL connection string (required) |
| `PORT`                   | backend  | API port (default `4000`) |
| `NODE_ENV`               | backend  | `development` or `production` |
| `VITE_N8N_WEBHOOK_URL`   | frontend | (Optional) n8n webhook URL. Default in dev: `/webhook/truthlens` (proxied to localhost:5678). |

Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`.

## Credibility algorithm

- **Source weight:**  
  `credibilityWeight = (log(citationCount + 1) * studyTypeWeight) / (currentYear - year + 1)`

- **Study type weights:** Meta-analysis 5, RCT 4, Cohort 3, Observational 2, Opinion 1.

- **Consensus score:** Weighted average of synthetic alignment (0–100%) across sources.

- **Misinformation risk:** Inferred from consensus score, number of sources, and share of opinion-type sources (Low / Medium / High).

## API

- **POST /webhook/truthlens** (n8n – used by frontend)  
  Body: `{ "message": "Your claim.", "id": "uuid", "timestamp": "2025-02-28T12:00:00.000Z" }`  
  Returns: `{ "analysis": AnalysisResult }` or a raw `AnalysisResult` (from n8n Respond to Webhook).

- **POST /api/claims/analyze** (backend)  
  Body: `{ "text": "Your scientific claim here." }`  
  Returns: `{ "analysis": AnalysisResult }` (claim, risk, score, sources, distributions, knowledge gaps, fact/opinion breakdown).

- **GET /health**  
  Returns `{ "status": "ok", "service": "truthlens-api" }`.

## License

MIT.
