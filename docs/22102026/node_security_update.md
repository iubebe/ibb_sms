# Node.js October 2026 security update

Date: 22-10-2026

Main doc: `ibb_shop_backend/docs/22102026/node_security_update.md`

- Volta pin bumped to Node 24.22.1 in `package.json`.
- `Dockerfile` build stage pinned to `node:24.22.1-alpine`. The runtime image is nginx, so only the build toolchain is affected.
- Not run: build was not re-run after the bump.
