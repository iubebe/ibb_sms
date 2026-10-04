# Routing, ProtectedRoute and PageNotFound

Date: 05/10/2026

Replaces the conditional auth gate described in `login_page_auth.md` (that file stays as the log of the earlier step).

## Done
- `react-router` added; routes in `src/router.tsx` (`createBrowserRouter`, provided in `main.tsx`). `App.tsx` was removed.
- `src/features/auth/route-guards.tsx`, all driven by `useMe`:
  - `ProtectedRoute` (layout route): logged out -> `/login` (remembers the target in `location.state.from`); `mustChangePassword` -> `/change-password`; otherwise renders `AppShell` and opens the WebSocket (`useRealtimeConnection`), which closes when leaving the protected area.
  - `GuestOnlyRoute` (`/login`): logged-in users are sent to `from` or `/`.
  - `PasswordChangeRoute` (`/change-password`): only while the flag is set.
  - Network/5xx while loading the user shows a retry screen instead of redirecting to login; a 401 means logged out.
- Routes: `/` dashboard, `/orders`, `/products`, `/staff` (skeleton placeholder pages in `src/features/<name>/`), `*` -> `PageNotFound` (`src/features/errors/page-not-found.tsx`, 404 with a link home).
- `AppShell` is now a layout with `<Outlet />`; nav uses `NavLink` (sidebar, drawer, bottom tab bar) from `NAV_ITEMS` paths, so active state follows the URL and deep links/reload work.
- Dev server returns the SPA for `/`, `/login` and unknown paths; build passes, lint only the known `button.tsx` warning. Not clicked through in a browser or against the backend.

## Decisions / pending
- No role-based route restriction yet (cashier is read-only for orders; `/staff` is probably admin-only). Add a `roles` prop to `ProtectedRoute` once the rules are decided.
- No router `errorElement` for render errors.
- After an explicit logout, `from` is the current page, so the next login returns there.
- Production hosting must serve `index.html` for unknown paths (SPA fallback) when the Dockerfile/nginx for this app is written.
