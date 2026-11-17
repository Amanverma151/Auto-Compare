# SKILLS.md — Tech skills, libraries & how to use them

This file tells Claude **which** frameworks, libraries and tools to use in Auto Compare and **how** to apply them. Project structure and rules live in [CLAUDE.md](CLAUDE.md). Prefer extending an existing skill over adding a dependency, and add a section here when you do add one.

Each section: **Purpose → Where → Rules → Example → Don't**.

| Skill | Version (installed) |
|---|---|
| Next.js / React | 16.4 / 19.3 |
| TypeScript | 5.9 |
| Tailwind CSS / shadcn (radix-nova) | 4.3 / CLI 4.x |
| Prisma + adapter-pg | 7.10 |
| Zod | 4.x |
| nuqs | 2.x |
| Recharts | 3.x |
| Vitest / Playwright | 5.x / 1.65 |
| Node / pnpm | ≥ 20.19 (Docker uses 24) / 12 |

---

## 1. Next.js 16 (App Router + Cache Components)

**Purpose:** Routing, rendering, API, metadata.
**Where:** `src/app/**`; logic in `src/modules/*`. Version-matched docs are in `node_modules/next/dist/docs/`.
**Rules**
- Server Components by default. `params` and `searchParams` are Promises: pass them into a Suspense child and `await` them there.
- Data-reading components: wrap them in `<Suspense>` and call `await connection()` first (see CLAUDE.md §2.4).
- Type pages with the generated globals `PageProps<"/route">` / `LayoutProps<"/">` (`next typegen`).
- Every page exports `metadata` or `generateMetadata`.
- Middleware is now `proxy.ts`. `next lint` no longer exists (use `pnpm lint`).
- Route handlers return `NextResponse.json`, validate input with Zod, and call module server functions.

**Example**
```tsx
export default function Page({ params }: PageProps<"/cars/[slug]">) {
  return <Suspense fallback={<Skeleton />}><Detail params={params} /></Suspense>;
}
async function Detail({ params }: { params: PageProps<"/cars/[slug]">["params"] }) {
  await connection();
  const { slug } = await params;
  const model = await getModelBySlug(slugSchema.parse(slug));
  if (!model) notFound();
  // …
}
```
**Don't:** call Prisma from `app/`; read the DB outside Suspense; use `new Date()` in prerendered server code; use the `pages/` router.

---

## 2. TypeScript

`strict` + `noUncheckedIndexedAccess`; alias `@/* → src/*`. Derive types from Prisma payloads (`Prisma.VariantGetPayload<{ include: typeof variantFullInclude }>`) and Zod (`z.infer`). Use `satisfies` for config objects. **Don't:** use `any`, `as` casts to silence errors, or `@ts-ignore`.

---

## 3. Styling: Tailwind v4, shadcn/ui, lucide-react, next-themes

**Where:** tokens and utilities in `src/app/globals.css`; primitives in `src/components/ui/*` (add with `pnpm dlx shadcn@latest add <name>`, style `radix-nova`); theme provider in `components/layout/theme-provider.tsx`.
**Rules**
- `cn()` comes from `@/lib/utils`, which re-exports shadcn's `cn` package.
- Use semantic tokens: `bg-background`, `bg-card`, `text-muted-foreground`, `text-brand-content`, `bg-brand`, `bg-surface-secondary`, `border-border-surface`, `bg-sky` (hero), `frame` (ruled section).
- Visual language (CLAUDE.md §4.1): black pill CTAs, sky eyebrows, `rounded-2xl` cards, generous whitespace, `text-xs`/`text-sm` body copy, `font-medium tracking-tight` headings.
- Mobile-first. Wide tables scroll inside a `relative overflow-auto` container (the `relative` keeps sr-only labels from widening the page).
- Icons from `lucide-react`, `aria-hidden` when decorative.
- `Marquee` (`components/ui/marquee.tsx`) powers the 3D review wall. Keyframes are in globals.css, and it stops under reduced motion.

**Don't:** hard-code hex colours, add per-component CSS files, or load remote images or fonts.

---

## 3a. Images (next/image)

**Where:** `public/images/cars/*`, rendered through `CarImage` (`@/modules/vehicles`), which uses `next/image` with `fill`, explicit `sizes`, and a placeholder when there is no photo.
**Rules:** always pass a `sizes` matching the layout; use `priority` only for above-the-fold heroes; use empty `alt` for decorative thumbnails that sit next to the car's name. Show `PhotoCredit` wherever a photo is the main subject. Images are local, so the CSP `img-src 'self'` stays strict.
**Don't:** add `remotePatterns` or hotlink external images.

---

## 4. Prisma 7 + PostgreSQL

**Where:** `prisma/schema.prisma`, `prisma.config.ts` (datasource URL, seed command), client at `src/generated/prisma` (import from `@/generated/prisma/client`), singleton in `src/lib/db.ts`, queries in `src/modules/*/server/queries.ts`.
**Rules**
- Generator `prisma-client` with an explicit `output`. Connect through `new PrismaPg({ connectionString, max })`.
- `migrate dev` does **not** run `generate` in v7; run `pnpm db:generate` after schema changes.
- Queries: `import "server-only"`, `"use cache"` + `cacheLife` + `cacheTag("vehicles")`, and include or select only what's needed (reuse `variantFullInclude`).
- Seeds are idempotent (upsert by slug) and Zod-validated.
- With the `prisma dev` local server, set `DATABASE_POOL_MAX=1`; it accepts a single connection.

**Don't:** import `@/lib/db` in client code or `app/`; build raw SQL with string concatenation.

---

## 5. Zod 4

Validate at every boundary: env, params, search params, API input, seed files. Route handlers use `safeParse` and return 400; env and seed use `parse` and fail fast. Prefer Zod 4 forms (`z.int()`, `z.url()`).

---

## 6. nuqs (URL state)

**Where:** `NuqsAdapter` in the root layout; parsers in `comparison/search-params.ts` and `search/search-params.ts` (imported from `nuqs/server`, which is shared-safe).
**Rules:** define parsers once. On the server use `createLoader(parsers)(searchParams)`; on the client use `useQueryState("ids", parser.withOptions({ shallow: false, startTransition }))` so server data refreshes and pending UI can show. Build filter links with `createSerializer`.
**Don't:** mirror URL state into `useState`.

---

## 7. Compare tray (client state)

`comparison/components/compare-tray-store.ts` is a `useSyncExternalStore` store over `localStorage`, with try/catch and a memory fallback. Max 4 items. The URL is the source of truth on `/compare`. **Don't:** add Redux or Zustand for this.

---

## 8. Recharts 3

Client components only (`PerformanceChart`, `TcoChart`). Wrap in `ResponsiveContainer`, colour from `var(--chart-n)`, style tooltips with popover tokens, and always provide a text alternative (`figcaption.sr-only` or an adjacent table). Keep axis labels short (model names) for mobile.

---

## 9. Testing: Vitest, Testing Library, Playwright

- Vitest (`vitest.config.ts`, jsdom, `vite-tsconfig-paths`). `vitest.setup.ts` registers jest-dom, runs `cleanup()` after each test, and mocks `server-only`.
- Write table-driven tests (`it.each`) for pure utils, and query by role or label in component tests.
- Playwright (`playwright.config.ts`) builds and serves on :3100 with desktop and Pixel 7 projects. Use role-based locators. Next renders an empty `role="alert"` route announcer, so filter alerts by text.

---

## 10. Tooling

- **pnpm** only. `pnpm-workspace.yaml` `allowBuilds` whitelists packages allowed to run install scripts (Prisma, esbuild).
- ESLint flat config enforces module boundaries (CLAUDE.md §2.2). Prettier uses `prettier-plugin-tailwindcss`.
- Once the repo is under git, add Husky + lint-staged (`eslint --fix`, `prettier --write` on staged files).

---

## 11. Docker

Multi-stage `Dockerfile` (deps → migrator / build → runner), Node 24 alpine, standalone output via `BUILD_STANDALONE=1`, non-root user. `docker compose up -d db` gives a local Postgres; `--profile app` runs the full stack.

---

## 12. Formatting & units (`src/lib/format.ts`)

All user-visible numbers go through `formatPrice`, `formatPower`, `formatTorque`, `formatEfficiency`, `formatConsumption`, `formatDistance`, `formatSpeed`, `formatLength`, `formatVolume`, `formatFuelTank`, `formatWeight`, `formatBattery`, `formatYears` and `formatPercent`, plus `units.*` for input conversions. Switching `UNIT_SYSTEM` to `"metric"` changes the whole site.
