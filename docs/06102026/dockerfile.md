# Dockerfile (pointer)

Date: 06/10/2026

Added `Dockerfile`, `nginx.conf` and `.dockerignore`: multi-stage pnpm build served by nginx with SPA fallback. `VITE_API_URL` and `VITE_WS_URL` are build args (baked in, one image per domain).
Main doc: `ibb_shop_release/docs/06102026/deploy_manifests.md`.

Pending: CI workflow to build and push the image to ghcr.io/iubebe, and release versioning.
