// Mirrors Prisma migrations into Netlify Database's migrations directory.
// Prisma remains the source of truth (`pnpm db:migrate` locally); Netlify applies
// netlify/database/migrations/<timestamp>_<slug>/migration.sql on each deploy.
// Run via `pnpm db:sync-netlify` before deploying a schema change.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

const from = "prisma/migrations";
const to = "netlify/database/migrations";
const valid = /^\d+_[a-z0-9_-]+$/;

mkdirSync(to, { recursive: true });
const source = readdirSync(from).filter((d) => statSync(join(from, d)).isDirectory());

for (const dir of source) {
  if (!valid.test(dir)) throw new Error(`Migration folder "${dir}" doesn't match Netlify's <number>_<slug> format`);
  const sql = join(from, dir, "migration.sql");
  if (!existsSync(sql)) throw new Error(`Missing ${sql}`);
  mkdirSync(join(to, dir), { recursive: true });
  cpSync(sql, join(to, dir, "migration.sql"));
}

// Remove mirrored migrations that no longer exist in Prisma (never edit applied ones by hand).
for (const dir of readdirSync(to)) {
  if (!source.includes(dir)) rmSync(join(to, dir), { recursive: true });
}

console.log(`Synced ${source.length} migration(s) to ${to}`);
