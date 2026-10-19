# ibb_sms runtime env (`window.env`)

Date: 19/10/2026

Follows `ibb_shop_release/docs/19102026/runtime-env.rules.md`. One image now serves any domain; API URLs are set per deployment at container start instead of being baked in by Vite.

## What was done
- `public/assets/environment/env.template.js` is the single key list (`API_BASE_URL`, `WS_URL`); `env.js` is the tracked dev fallback.
- `vite-plugins/local-env-plugin.ts` serves `env.js` from `.env` in dev (full reload on `.env*` change). `index.html` loads `env.js` before the bundle.
- `src/config/env.ts` is the only reader of `window.env`; types in `src/vite-env.d.ts`. `VITE_API_URL` / `VITE_WS_URL` are gone.
- `docker-entrypoint.sh` (installed as `/docker-entrypoint.d/40-runtime-env.sh`) runs `envsubst` with an explicit variable list and fails if the template is missing. `nginx.conf` serves `/assets/environment/` with `no-cache, must-revalidate` (otherwise the `/assets/` immutable rule would cache it for a year).
- CI (`release.yml`, `staging.yml`): removed the build args and the "require URL" steps. Repo variables `VITE_API_URL`, `VITE_WS_URL`, `STAGING_VITE_*` are no longer used and can be deleted.
- Release repo: see `ibb_shop_release/docs/19102026/sms_runtime_env.md`.

## Decisions
- Keys are `API_BASE_URL` / `WS_URL` (no `VITE_` prefix), matching the rules doc.
- No PWA/service worker in this app, so the precache gap does not apply.

## Pending
- Anyone with their own `.env` must rename `VITE_API_URL` -> `API_BASE_URL`, `VITE_WS_URL` -> `WS_URL`.
- guest and pos still bake `VITE_*`.
- No test yet that template, `.env.example`, `vite-env.d.ts` and compose agree.
