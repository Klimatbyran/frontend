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

### Checks / build
- Type check: `npx tsc --noEmit` (clean).
- Tests: `npm run test -- --run` (Vitest + jsdom, self-contained, no services needed).
- Format: `npx prettier --check .` (clean). The `pre-push` husky hook runs `npm run format-prettier` (writes formatting).
- Build: `npm run build`. The `postbuild` sitemap step fetches from the API and prints "Missing API key" errors when the key is absent — this is **non-fatal**, the build still succeeds and writes generated files (`public/sitemap.xml`, `src/data-guide/items.ts`, `src/locales/*/dataguideItems.json`). Revert those generated files if you don't intend to commit them.
- Lint (`npm run lint`) currently reports pre-existing errors/warnings and is **disabled in CI** (see `.github/workflows/ci-checks.yml`); do not treat its failure as caused by your change.
