import cors from "cors";
import express from "express";
import { claimsRouter } from "./routes/claims.js";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL || DATABASE_URL.trim() === "") {
  console.error("FATAL: DATABASE_URL environment variable is not set. Set it in backend/.env (see .env.example).");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "truthlens-api" });
});

app.use("/api/claims", claimsRouter);

app.listen(PORT, () => {
  console.log(`TruthLens API listening on http://localhost:${PORT}`);
});
