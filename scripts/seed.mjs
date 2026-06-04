/**
 * Restaura los datos mock de prueba en data/db.json
 * Uso: npm run seed
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(__dirname, "..", "data", "seed.json");
const dbPath = path.join(__dirname, "..", "data", "db.json");

const seed = fs.readFileSync(seedPath, "utf-8");
fs.writeFileSync(dbPath, seed);
console.log("✓ Datos mock restaurados en data/db.json");
