# CI and release workflows

Date: 06/10/2026

## What was done
Added GitHub Actions to `ibb_sms`, mirroring `ibb_shop_backend/.github` (see `ibb_shop_backend/docs/05102026/` and its release-please setup):

- `.github/workflows/ci.yml`: PRs to `main`/`develop` -> `pnpm lint`, `pnpm build` (Node 24, pnpm 12).
- `.github/workflows/develop.yml`: PRs to `develop` -> Docker build without push. No test job: this app has no test script.
- `.github/workflows/release.yml`: push to `main` -> release-please Release PR; when merged, builds and pushes `ghcr.io/iubebe/ibb_sms:<version>` and `:latest`.
- `release-please-config.json`, `.release-please-manifest.json` (starts at 0.0.0, matching `package.json`).

## Decisions
- Vite bakes `VITE_API_URL` / `VITE_WS_URL` into the bundle, so the release job reads them from repository **variables** and fails if unset. One published image therefore targets one environment.
- Image name matches `ibb_shop_release/deployment/docker-compose.yml`.

## Pending
- Create repo variables `VITE_API_URL` (e.g. `https://api.<domain>/api`) and `VITE_WS_URL` (`https://api.<domain>`).
- Never run on GitHub; pnpm `version: 12` is pinned in the workflow (no `packageManager` field).
- First release is 0.0.1 or 0.1.0 depending on commit types; bump `GUEST_VERSION`/`SMS_VERSION` in `ibb_shop_release` afterwards.
- Branch protection / required checks not configured.
