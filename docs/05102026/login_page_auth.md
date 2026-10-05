# Login page and auth flow

Date: 05/10/2026

Builds on `api_websocket_integration.md`; backend contract in `backend_auth_csrf.md` and `backend_first_login_password.md`.

## Done
- `src/features/auth/login-page.tsx`: email + password card, centered, 44px inputs/button, 16px text on mobile, safe-area padding, inline error from the backend, button disabled and spinner while submitting.
- `src/features/auth/change-password-page.tsx`: shown when `user.mustChangePassword`; current/new/confirm, client check for 10-128 chars and matching confirmation (backend still validates), plus a logout button.
- Auth gate in `src/App.tsx` (state comes from `useMe`): pending -> skeleton; 401 or no user -> login; network/5xx error -> "Không kết nối được máy chủ" with retry (not the login form); `mustChangePassword` -> change-password; otherwise the shell.
- Logout: user name + "Đăng xuất" in the sidebar and in the mobile drawer. `useLogout` drops all non-auth cached data and sets `me` to `null` even if the request fails.
- The WebSocket connects only when logged in and no password change is pending.
- shadcn added: `input`, `label`, `card` (cn import fixed again).
- `pnpm build` passes; lint shows only the known `button.tsx` warning.

## Not verified
- Not exercised against the running backend or in a browser (backend not running, see the previous doc). Check: wrong password message, first-login redirect to change-password, reload keeps the session, expired access token refreshes silently, logout returns to login.

## Decisions
- No router yet, so the gate is plain conditional rendering. No "remember me" or forgot-password (backend has neither).
- Role-based nav and a login rate-limit message (backend uses a strict throttle, 429) are not handled specially; the backend message is shown as is.
