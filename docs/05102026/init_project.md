# Init frontend project

Date: 05/10/2026

## Done
- Scaffolded by hand (not `create-vite`, because the repo already had `README.md`/`docs/`), mirroring `ibb_shop_guest`: Vite 8, React 19, TypeScript 6, Tailwind v4 (`@tailwindcss/vite`), shadcn `base-nova`, oxlint, pnpm. Config files copied from the guest app; theme tokens are in `src/index.css`.
- shadcn components added: `button`, `sheet`, `separator`, `skeleton` (the stray `cn` import/package was fixed, see `CLAUDE.md`).
- Mobile-first shell in `src/features/shell/`: top bar with drawer menu and bottom tab bar below `md`; sidebar from `md`. Safe-area insets, `min-h-svh`, 44px+ tap targets, `viewport-fit=cover`.
- `CLAUDE.md` added with this app's conventions (extends the guest rules).
- `pnpm build` passes; `pnpm lint` has one warning in generated `button.tsx` (only-export-components). Dev server returns 200; not yet checked visually in a browser.

## Decisions
- No router yet: the shell switches the active section with local state and the content is a skeleton placeholder.
- No API client / auth yet; no `.env` files.

## Next
- Pick a router, then build login (cookie + CSRF flow in `backend_auth_csrf.md`), first-login password change, and the serving queue (`order_served_tracking.md`).
- Add `.env.example` (`VITE_API_URL`, `VITE_WS_URL`) when the API client is written; add `ibb_sms` origin to backend `CORS_ORIGINS`.
- Add Dockerfile and a version entry in `ibb_shop_release` once there is something to deploy.
