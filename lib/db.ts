import fs from "fs/promises";
import path from "path";
import type { Database } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

let writeQueue: Promise<void> = Promise.resolve();

async function readDbFile(): Promise<Database> {
  const content = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(content) as Database;
}

async function writeDbFile(data: Database): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function readDb(): Promise<Database> {
  return readDbFile();
}

export async function writeDb(updater: (db: Database) => Database): Promise<Database> {
  let result!: Database;

  writeQueue = writeQueue.then(async () => {
    const current = await readDbFile();
    result = updater(structuredClone(current));
    await writeDbFile(result);
  });

  await writeQueue;
  return result;
}

export function formatExpediente(num: number): string {
  return `RH-${String(num).padStart(3, "0")}`;
}

export function formatResolucion(num: number): string {
  return `RES-${String(num).padStart(3, "0")}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function formatFechaHora(iso: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatFechaHoraCorta(iso: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
