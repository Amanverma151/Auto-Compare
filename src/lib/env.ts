import "server-only";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .refine((v) => /^postgres(ql)?:\/\//.test(v), "DATABASE_URL must be a postgres:// URL"),
  /** Max pooled DB connections per server instance. Use 1 with `prisma dev` (single-connection local server). */
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

/**
 * Validated server environment. Fails fast at startup on invalid configuration.
 * On Netlify, the platform-provided NETLIFY_DB_URL wins over DATABASE_URL so a local
 * .env value can never point production at a developer database.
 */
export const env = envSchema.parse({
  ...process.env,
  DATABASE_URL: process.env.NETLIFY_DB_URL || process.env.DATABASE_URL,
});
