import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
if (!process.env.DATABASE_URL?.trim()) {
  process.env.DATABASE_URL = `file:${path.join(__dirname, "..", "prisma", "dev.db")}`;
}
