import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Module boundaries (CLAUDE.md §2.2): import other modules only via their public
// index (`@/modules/x`) or server barrel (`@/modules/x/server`).
const moduleBoundaries = {
  group: ["@/modules/*/*", "!@/modules/*/server"],
  message: "Import modules through their public API: '@/modules/<name>' or '@/modules/<name>/server'.",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [moduleBoundaries] }],
    },
  },
  {
    // Routes compose modules; they never talk to the database directly.
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            moduleBoundaries,
            { group: ["@/lib/db", "@/generated/*"], message: "Use module server functions instead of Prisma in routes." },
          ],
        },
      ],
    },
  },
  {
    // lib is the bottom layer and must not depend on feature modules.
    files: ["src/lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group: ["@/modules/*"], message: "lib must not import from modules." }] }],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "src/generated/**", "playwright-report/**", "test-results/**", ".netlify/**"]),
]);

export default eslintConfig;
