# AGENTS.md

## Cursor Cloud specific instructions

This repo is the **Klimatkollen frontend** only: a React 18 + TypeScript + Vite 7 SPA (Tailwind CSS). There is no backend in this repo — it consumes the external "Unearth"/Garbo API over HTTP. Standard commands live in `README.md` and `package.json` scripts; reference those instead of re-deriving them.

### Environment / running
- Node 20+ is required (CI pins Node 20; Node 22 also works — Vite 7 needs `^20.19 || >=22.12`). Package manager is **npm** (`package-lock.json`).
- Copy the env file before running: `cp .env.example .env.development` (already what dev uses). By default `VITE_API_PROXY` points at the hosted API `https://api.unearthdata.ai/`, so **no local backend/database is needed**.
- Start dev with `npm run dev` (Vite on `http://localhost:5173`). The `/api/*` path is proxied to `VITE_API_PROXY` by the `devApiProxy` plugin in `vite-api-proxy.ts`, which injects the `X-API-Key` header from `GARBO_ALL_ACCESS_API_KEY`.

### API key gotcha (important)
- The hosted prod AND staging APIs both require an API key. Without `GARBO_ALL_ACCESS_API_KEY` set, all `/api/*` requests return **401 "Missing API key"**, so data-driven pages (companies, municipalities, regions, search) render but show "Ingen … data tillgänglig" / empty states. Static/content pages (home, methodology, data guide, blog) work fine without it.
- To exercise the core data-visualization functionality, set `GARBO_ALL_ACCESS_API_KEY` (a secret) in the environment, then restart `npm run dev`. The OpenAPI schema at `/reference/openapi.json` is public (no key needed), so `npm run generate-api` works without the key.

### Optional: running the backend (Garbo) locally instead of the hosted API
The backend is a **separate repo** (`github.com/Klimatbyran/garbo`, Node 22, needs Docker). Its own `README.md` has the canonical steps; the non-obvious gotchas discovered here:
- Bypass the API key locally by setting `ALLOW_ANONYMOUS_CLIENT_API=true` in garbo's `.env` — then no `X-API-Key` / `GARBO_ALL_ACCESS_API_KEY` is needed. This is likely the "run without the API key" flag.
- `.env.example` ships `OPENAPI_PREFIX=api`, which the server **rejects on boot** ("cannot be 'api'"). Change it to `OPENAPI_PREFIX=reference` (matches what the frontend's `generate-api` expects).
- Start only the API (what the frontend needs) with `npm run dev-api` (serves `http://localhost:3000`). `dev-api` runs under `--watch`, so it stays alive and waits after a crash — send Ctrl-C before re-running or your next command goes to its stdin.
- Bring up deps with `docker compose up -d postgres redis chroma`, then `npm run prisma migrate dev` (applies migrations + seed). Seed only loads GICS/users/tags/API-keys — **`/api/companies/` is empty**, but **`/api/municipalities/` returns full real data**, so the Municipalities pages work out of the box. Full company data requires a private DB dump from the team.
- To point the frontend at it, set `VITE_API_PROXY=http://localhost:3000/` in `.env.development` and restart `npm run dev`.

### Checks / build
- Type check: `npx tsc --noEmit` (clean).
- Tests: `npm run test -- --run` (Vitest + jsdom, self-contained, no services needed).
- Format: `npx prettier --check .` (clean). The `pre-push` husky hook runs `npm run format-prettier` (writes formatting).
- Build: `npm run build`. The `postbuild` sitemap step fetches from the API and prints "Missing API key" errors when the key is absent — this is **non-fatal**, the build still succeeds and writes generated files (`public/sitemap.xml`, `src/data-guide/items.ts`, `src/locales/*/dataguideItems.json`). Revert those generated files if you don't intend to commit them.
- Lint (`npm run lint`) currently reports pre-existing errors/warnings and is **disabled in CI** (see `.github/workflows/ci-checks.yml`); do not treat its failure as caused by your change.
