import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Connection precedence: DIRECT_DATABASE_URL (explicit override, e.g. an unpooled URL),
 * then Netlify Database's NETLIFY_DB_URL, then DATABASE_URL (local development).
 */
const url = process.env.DIRECT_DATABASE_URL || process.env.NETLIFY_DB_URL || process.env.DATABASE_URL;

if (!url) {
  throw new Error("Set DATABASE_URL (or NETLIFY_DB_URL) — see .env.example");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url,
    // Only needed with `prisma dev`, whose main database is template1 (a shadow DB cloned from it would collide).
    ...(process.env.SHADOW_DATABASE_URL ? { shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL } : {}),
  },
});
