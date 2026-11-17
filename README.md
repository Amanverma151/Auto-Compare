# Auto Compare

A modern car comparison website. Pick up to four cars and compare trims, specs, performance, safety ratings, maintenance and ownership costs, and expert pros and cons side by side.

> **Sample data:** the bundled dataset (18 US-market models, 36 trims, 2025 model year) is approximate and for demonstration only.

## Quick start

```bash
pnpm install
cp .env.example .env

# Database: pick one
docker compose up -d db                                   # A) Docker Postgres
pnpm exec prisma dev --detach --name autocompare          # B) no Docker: copy the printed postgres:// URL
                                                          #    into .env and set DATABASE_POOL_MAX=1

pnpm db:migrate && pnpm db:seed
pnpm dev                                                  # http://localhost:3000
```

## Scripts

`pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm e2e` · `pnpm build` · `pnpm start`

## Docs

- [CLAUDE.md](CLAUDE.md): architecture, module rules, conventions, security, deployment
- [SKILLS.md](SKILLS.md): tech stack and how each tool is used
