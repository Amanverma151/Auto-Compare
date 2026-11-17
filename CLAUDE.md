# CLAUDE.md — Auto Compare

Instructions for Claude (and humans) working in this repository. Read this file and [SKILLS.md](SKILLS.md) before making changes. SKILLS.md says **which** tools to use and **how**; this file says **how the project is organised and what rules apply**.

@AGENTS.md — Next.js 16 ships its own docs in `node_modules/next/dist/docs/`. When unsure about a Next.js API, read them there; this version differs from older training data (async request APIs, `proxy.ts`, Cache Components).

---

## 1. Product overview

**Auto Compare** is a modern car comparison website. Users pick **2–4 car variants** and compare them side by side across:

| Area | What we show | Owning module |
|---|---|---|
| Configurations & variants | Make, model, trims, MSRP, fuel, transmission, drivetrain, seats | `vehicles` |
| Features & specifications | Dimensions, cargo, tank/battery, weight; equipment list by category | `specifications` |
| Engine performance | Engine, displacement, hp, torque, power-to-weight, 0–60, top speed, mpg / EV range & consumption | `performance` |
| Safety | NHTSA-style overall / frontal / side / rollover stars, airbags, AEB / lane-keep / blind-spot / adaptive cruise | `safety` |
| Maintenance & ownership cost | Service interval & cost, insurance, warranty, resale value, annual energy cost, 5-year TCO | `ownership-cost` |
| Pros & cons | Editorial rating, verdict, pros, cons; 3D review wall on the home page | `reviews` |
| Comparison engine | Compare tray, side-by-side table, "only differences", best-in-class, variant pickers, share link | `comparison` |
| Discovery | Autocomplete search (`/api/search`), browse filters | `search` |
| Decision tools | Cost-of-ownership calculator (`/tools/tco`). Future: loan/payment calculator, "which car suits me" quiz | `tools` |

The website is one coherent product; **modularity lives in the codebase**, not in separate sub-sites.

> **Data notice:** the database is seeded with a **sample/illustrative US-market dataset** (18 models, 36 trims, 2025 model year). Figures are approximate. The footer and README label them as such; keep that until a licensed data feed is integrated.

> **Photos:** one representative photo per model, from **Wikimedia Commons** under CC licences (CC BY / BY-SA / CC0). They are self-hosted in `public/images/cars/<model-slug>.(jpg|png)`, with author, licence and source stored on `Model` (`imageUrl`, `imageAuthor`, `imageLicense`, `imageLicenseUrl`, `imageSourceUrl`).
> - Every photo must keep its attribution: `PhotoCredit` under the model hero, plus the `/credits` page linked from the footer.
> - Never hotlink, and never use manufacturer press images or stock photos of the wrong car.
> - When adding a model, pick a current-generation photo matching the body style, and record its credit in the seed JSON.

---

## 2. Architecture

- **Next.js 16 (App Router, Cache Components, Turbopack) + React 19 + TypeScript (strict, `noUncheckedIndexedAccess`).**
- **PostgreSQL** via **Prisma 7** (driver adapter `@prisma/adapter-pg`), server-only.
- **Feature modules** in `src/modules/*`. Routes in `src/app/*` are thin and only *compose* modules.

```
src/
  app/
    layout.tsx                 # Shell: header, footer (data notice), providers, compare tray
    page.tsx                   # Home: hero + live preview, capabilities, popular, review wall, TCO teaser, CTA
    cars/page.tsx              # Browse with filters (?body=&fuel=&maxPrice=)
    cars/[slug]/page.tsx       # Model detail: trims, per-trim tabs (reuses CompareTable), verdict
    compare/page.tsx           # Side-by-side comparison (?ids=a,b,c)
    tools/tco/page.tsx         # Cost-of-ownership calculator (?ids=)
    api/search/route.ts        # GET autocomplete (rate-limited)
    api/compare/route.ts       # GET comparison table JSON (rate-limited)
  modules/
    vehicles/  specifications/  performance/  safety/
    ownership-cost/  reviews/  comparison/  search/  tools/
  components/ui/               # shadcn/ui primitives + marquee.tsx
  components/layout/           # Header, footer, logo, theme, section/eyebrow helpers
  lib/                         # db, env, format (units), compare-row (shared row type), rate-limit, utils (cn)
  generated/prisma/            # Prisma client (generated, git-ignored)
prisma/  schema.prisma  migrations/  seed.ts  seed-data/vehicles.json
tests/e2e/                     # Playwright
```

### 2.1 Module contract

```
src/modules/<name>/
  components/     # React components ("use client" only where needed)
  server/         # queries.ts (+ index.ts barrel). First line: import "server-only"
  rows.ts         # CompareRow<VehicleVariant>[] definitions for the comparison table (domain modules)
  schemas.ts      # Zod schemas
  search-params.ts# nuqs parsers (modules that own URL state)
  types.ts        # Domain types (derive from Prisma/Zod)
  utils.ts        # Pure functions, heavily unit-tested
  index.ts        # PUBLIC API (client-safe: never re-export server/)
  __tests__/      # Vitest
```

### 2.2 Dependency rules (enforced by ESLint `no-restricted-imports`)

1. Import another module only via `@/modules/<name>` (public, client-safe) or `@/modules/<name>/server` (server-only). Deep paths are lint errors.
2. `src/app/**` must not import `@/lib/db` or `@/generated/*`; use module server functions.
3. `src/lib/**` must not import from modules. The shared `CompareRow` type lives in `lib/compare-row.ts` for this reason.
4. Allowed module dependencies:
   - `specifications`, `performance`, `safety`, `ownership-cost`, `reviews` → `vehicles` only.
   - `search` → `vehicles`. `tools` → `ownership-cost`, `search`.
   - `comparison` → all domain modules + `search` + `vehicles`.
   - No cycles.

### 2.3 Data model (`prisma/schema.prisma` is the source of truth)

`Make 1─* Model 1─* Variant`. Each `Variant` has 1:1 `Specification`, `Performance`, `SafetyRating`, `OwnershipCost` and 1:* `Feature`. `Review` is 1:1 with `Model`. Slugs are unique; URLs use model slugs (`/cars/toyota-rav4`) and compare URLs use variant slugs.

**Units in the DB are metric**: USD whole dollars, hp, Nm, mm, L, km/l, km, kWh/100km. Display units come from `src/lib/format.ts` (`UNIT_SYSTEM = "imperial"`, `CURRENCY = "USD"`). Never format units anywhere else.

### 2.4 Rendering & data fetching (Cache Components)

- Query functions in `server/queries.ts` use `"use cache"` + `cacheLife("hours")` + `cacheTag("vehicles")`.
- Every data-reading component sits inside `<Suspense>` and calls `await connection()` before querying. The build therefore never needs a database, and pages prerender a static shell that streams in data.
- Client components that read the URL (`usePathname`, `useSearchParams`) also need a `<Suspense>` boundary.
- Don't call `new Date()` / `Math.random()` in server components outside a `connection()` boundary.
- After a data import, invalidate with `revalidateTag("vehicles", "max")` (the single-argument form is deprecated).

---

## 3. Commands

| Task | Command |
|---|---|
| Install | `pnpm install` (runs `prisma generate`) |
| Local DB, option A (Docker) | `docker compose up -d db`, with `.env` from `.env.example` |
| Local DB, option B (no Docker) | `pnpm exec prisma dev --detach --name autocompare`, then put the printed `postgres://…` URL in `.env` with `DATABASE_POOL_MAX=1`, and set `SHADOW_DATABASE_URL` to the same URL on the shadow port (default 51215) so `migrate dev` works |
| Migrate (dev) / deploy | `pnpm db:migrate` / `pnpm db:deploy` |
| Regenerate client | `pnpm db:generate` (Prisma 7 does not auto-generate on migrate) |
| Seed sample data | `pnpm db:seed` |
| Dev server | `pnpm dev` → http://localhost:3000 |
| Lint / format | `pnpm lint` / `pnpm format` |
| Typecheck | `pnpm typecheck` (runs `next typegen` for `PageProps`/`LayoutProps`) |
| Unit tests | `pnpm test` |
| E2E | `pnpm e2e` (builds and starts on :3100; DB must be seeded) |
| Production | `pnpm build && pnpm start` |
| Container | `docker compose --profile app up --build` |

Before saying a task is done: `pnpm lint && pnpm typecheck && pnpm test` (and `pnpm build` for routing/rendering changes).

---

## 4. Coding conventions

- No `any`, no `as` to silence errors, no `!` outside tests (`noUncheckedIndexedAccess` is on).
- Server Components by default; `"use client"` only on interactive leaves.
- **URL is state** for anything shareable (compare ids, filters, TCO cars) via `nuqs`.
- Files are `kebab-case`, components `PascalCase`, Zod schemas `xxxSchema`.
- **Accessibility:** semantic landmarks, labelled controls, visible focus, `<th scope>` in tables, sr-only text wherever colour or icons carry meaning (best-in-class trophy, check/minus), `prefers-reduced-motion` respected (marquee stops).
- No dead code, no commented-out code.

### 4.1 Visual design system

Airy and neutral, following the reference the product owner chose: a near-black "mist" primary, neutral greys, **sky-500 brand accent**, Geist, and "squircle" radii (`--squircle-factor: 1.4`). Tokens live in `src/app/globals.css` (light + derived dark).

- Primary actions are **black pill buttons** (`rounded-full`); secondary are outline pills.
- Section headings: small sky-blue **eyebrow** (`Eyebrow`) + `text-2xl/3xl font-medium tracking-tight` title (`SectionHeading`).
- Hero / page headers use the `bg-sky` utility (CSS-only clouds) inside a `rounded-3xl` inset card.
- Framed sections use the `frame` utility (thin vertical rules). Cards are `rounded-2xl border bg-card`.
- Use semantic tokens (`bg-background`, `text-muted-foreground`, `text-brand-content`, `bg-surface-secondary`, `border-border-surface`). No raw hex colours.

---

## 5. Comparison rules

- 2–4 variants per comparison. `parseCompareIds` drops invalid or duplicate slugs and anything past 4; the page reports skipped ids.
- Each row declares `direction`: `higher`, `lower` or `none`. Best-in-class is computed in `comparison/utils.ts` (`findBestIndices`), never in components. Ties are all highlighted. Nothing is highlighted if every car ties or fewer than two cars have a value. `null` never wins and renders as "—".
- "Only show differences" hides rows whose values, including missing ones, are all equal.
- Feature rows only appear if at least one compared car has the feature.
- **TCO** (`ownership-cost/utils.ts`): depreciation + (energy + maintenance + insurance) × years. Depreciation interpolates linearly to the 5-year resale %, floored at 10% retained. Defaults are 12,000 mi/yr, $3.50/gal, $0.16/kWh, 5 years.

---

## 6. Security

- Zod-validate every external input: route params, search params, API query strings, seed files and env (`src/lib/env.ts` fails fast).
- Only `NEXT_PUBLIC_*` reaches the client. Prisma, env and queries are `server-only`.
- Security headers in `next.config.ts`: CSP (`'unsafe-inline'` scripts are needed for Next hydration; move to a nonce via `proxy.ts` if stricter CSP is required), `nosniff`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy`. `poweredByHeader` is off.
- Public API routes are read-only and input-capped (query ≤ 100 chars, ≤ 4 ids), with `src/lib/rate-limit.ts` (in-memory, per instance; replace with the host's limiter).
- No `dangerouslySetInnerHTML`; no third-party scripts, fonts or images at runtime (fonts are self-hosted by `next/font`).
- Run `pnpm audit` before releases.

---

## 7. Testing & definition of done

- **Unit (Vitest):** `utils.ts` and `schemas.ts` of each module, `lib/format.ts`, and seed-data integrity (`vehicles/__tests__/schemas.test.ts`).
- **Component (Testing Library):** `CompareTable` (best-in-class a11y text, differences filter, collapse).
- **E2E (Playwright, desktop + Pixel 7):** search → model page; add 3 trims via tray → compare → toggle differences → open the shared URL in a fresh context; invalid ids reported.
- Done = lint, typecheck, unit tests pass; new logic tested; UI checked at 390px and 1280px in light and dark; no console errors; no horizontal page overflow on mobile.

---

## 8. Deployment: Netlify + Netlify Database

**Live:** https://auto-compare-w6mp.netlify.app (project `auto-compare-w6mp`). Production is public; deploy previews require Netlify team login (`sso_login_context: non_production`).

- **Deploy:** `pnpm deploy` (syncs migrations, then `netlify deploy --build --prod`, building locally). Netlify's Next.js adapter is automatic; config lives in `netlify.toml`.
- **Windows builds:** stop `pnpm dev` first (it locks `.next`). `pnpm-workspace.yaml` sets `nodeLinker: hoisted` because Windows blocks the symlinks the adapter copies.
- **Database:** Netlify Database (Postgres), provisioned because `@netlify/database` is installed. The app reads `NETLIFY_DB_URL`, which takes precedence over `DATABASE_URL` so a local `.env` can't leak into production.
- **Schema and data changes:**
  - Netlify applies `netlify/database/migrations/<ts>_<slug>/migration.sql` just before publishing a deploy. The production connection string available to the CLI is **read-only**, so Prisma can't migrate or seed production directly.
  - Prisma stays the source of truth: `pnpm db:migrate` locally, then `pnpm db:sync-netlify` (run automatically by `pnpm deploy`) mirrors `prisma/migrations` into Netlify's directory.
  - Applied migrations are immutable; always add a new one.
  - Production data changes also ship as migrations. The sample dataset is `*_seed_sample_data`, generated by `pnpm db:seed-sql <name>` from `vehicles.json`; it's idempotent, so a local DB is unaffected.
- **Runtime env** (site settings, not `[build.environment]`): `DATABASE_POOL_MAX=3`. Build env: `NODE_VERSION=24` and `NEXT_PUBLIC_SITE_URL`.
- **Docker** (alternative host): `Dockerfile` targets `migrator` and `runner` (standalone via `BUILD_STANDALONE=1`); `docker-compose.yml` runs `db`, plus `migrate` + `web` under the `app` profile.

---

## 9. Recipes

### Add a comparable attribute (e.g. towing capacity)
1. Add the column to the owning Prisma model → `pnpm db:migrate --name add-towing` → `pnpm db:generate`.
2. Extend the seed JSON and the Zod seed schema in `vehicles/schemas.ts`.
3. Add a formatter in `lib/format.ts` if it has a unit.
4. Add a `CompareRow` to the owning module's `rows.ts` (label, value, format, direction).
5. Add tests and check the compare page and the model detail tabs.

### Add a module
Create `src/modules/<name>/` per §2.1, export from `index.ts` (and `server/index.ts`), update §1 and §2.2, and register any rows in `comparison/utils.ts`.

### Replace sample data with a real feed
Add `src/modules/vehicles/server/import/` with a provider interface, map the payload into the seed Zod shapes, upsert by slug, then call `revalidateTag("vehicles", "max")`. Remove the sample-data notice once licensed data covers every field.
