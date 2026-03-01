import "./env";
import cors from "cors";
import express from "express";
import { claimsRouter } from "./routes/claims.js";
import { conversationsRouter } from "./routes/conversations.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "truthlens-api" });
});

app.use("/api/claims", claimsRouter);
app.use("/api/conversations", conversationsRouter);

app.listen(PORT, () => {
  console.log(`TruthLens API listening on http://localhost:${PORT}`);
});
