# AGENTS.md

Vue 3 SPA (Vite + Pinia + Vue Router) in plain JavaScript (no TypeScript). UI labels, variable names, and commit messages are in Spanish. Requires Node `^22.18.0 || >=24.12.0` (see `engines`).

## Commands

- `npm run dev` — Vite dev server
- `npm run build` / `npm run preview` — production build / preview
- `npm run lint` — runs `lint:oxlint` then `lint:eslint`, **both auto-fix with `--fix`**; run it instead of `oxlint`/`eslint` directly. No `test` or `typecheck` scripts exist.

## Gotchas

- A vitest test exists (`src/utils/__tests__/formatters.test.js`) but **vitest is not installed and not in `package.json`** — there is no way to run tests until it's added.
- `src/views/docente/GestionPreguntas.vue` and `Reportes.vue` (dashboard: `src/components/dashboard/*`, `src/composables/useFiltrosDashboard.js`) are **complete but not registered in `src/router/index.js`** — the router only serves `/estudiante/mapa`. Add routes to expose them.
- `src/stores/counter.js` is leftover Vite template boilerplate; ignore it.
- `src/views/estudiante/MapaEtapas.vue` calls the API with a 1.5s `timeout` and silently falls back to `datosSimulados` (prototype mode) on failure — expected behavior, not a bug.

## Architecture

- Entry: `src/main.js` (Pinia + router). Import alias `@` → `src` (configured in both `vite.config.js` and `jsconfig.json`).
- `src/services/api.js`: shared axios instance. `baseURL` from `VITE_API_URL`, defaulting to `http://localhost:8000/api` (Django REST backend; endpoint paths use trailing slashes). A request interceptor calls `useAuthStore()` and adds `Authorization: Bearer <token>` — Pinia must be active before requests run.
- `src/stores/auth.js`: stores `access_token` / `refresh_token` / `rol` in localStorage; `rol` is decoded from the JWT via `jwt-decode`. `logout()` calls `localStorage.clear()`. Note `VITE_API_URL` is used directly here (not the `api` instance).
- Backend endpoints used: `/auth/login/`, `/estudiante/etapas/`, `/estudiante/perfil/`, `/docente/secciones/`, `/docente/temas/`, `/docente/secciones/:id/estudiantes/`, `/docente/preguntas/`, `/docente/preguntas/:id/`, `/docente/dashboard/{resumen,heatmap,evolucion,puntos-debiles}/`.

## Environment

- `.env` and `.env.local` both contain `VITE_API_URL` and are gitignored (`.env` and `*.local`). `dist/` is also gitignored.

## Style

- ESLint flat config (`eslint.config.js`) is generated from `.oxlintrc.json` (eslint + vue + unicorn + oxc plugins, correctness as error). `.editorconfig` enforces 2-space indent, LF, 100-col limit. No Prettier.