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

### 4. Use the app

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
│   │   ├── api.ts            # analyzeClaim()
│   │   ├── types.ts          # AnalysisResult, Source, etc.
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.cjs
│   └── vite.config.ts        # proxy /api -> localhost:4000
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

| Variable       | Where    | Description |
|----------------|----------|-------------|
| `DATABASE_URL` | backend  | PostgreSQL connection string (required) |
| `PORT`         | backend  | API port (default `4000`) |
| `NODE_ENV`     | backend  | `development` or `production` |

Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`.

## Credibility algorithm

- **Source weight:**  
  `credibilityWeight = (log(citationCount + 1) * studyTypeWeight) / (currentYear - year + 1)`

- **Study type weights:** Meta-analysis 5, RCT 4, Cohort 3, Observational 2, Opinion 1.

- **Consensus score:** Weighted average of synthetic alignment (0–100%) across sources.

- **Misinformation risk:** Inferred from consensus score, number of sources, and share of opinion-type sources (Low / Medium / High).

## API

- **POST /api/claims/analyze**  
  Body: `{ "text": "Your scientific claim here." }`  
  Returns: `{ "analysis": AnalysisResult }` (claim, risk, score, sources, distributions, knowledge gaps, fact/opinion breakdown).

- **GET /health**  
  Returns `{ "status": "ok", "service": "truthlens-api" }`.

## License

MIT.
