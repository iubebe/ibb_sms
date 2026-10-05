# REST API and WebSocket integration

Date: 05/10/2026

Follows `init_project.md`; backend contract is in `backend_auth_csrf.md` and `order_served_tracking.md`. Modeled on `ibb_shop_guest/src/api` and `src/ws`.

## Done
- `src/config/env.ts` + `.env.example` (`VITE_API_URL`, `VITE_WS_URL`); `.env.local` is git-ignored.
- `src/api/client.ts`: axios with `withCredentials`, `ApiError`, CSRF header on unsafe methods (retry once on CSRF 403), and one serialized `POST /auth/refresh` then replay on a 401. Login/refresh/logout never trigger a refresh. `onSessionRefreshed` and `setSessionExpiredHandler` are the hooks for the socket and the login fallback (wired in `main.tsx`: expired session sets the `me` query to `null`).
- `src/api/` routes, query keys, types (`StaffOrder`, `AuthUser`...) and hooks: `useMe`, `useLogin`, `useLogout`, `useChangePassword`, `useOrders(status)` (serving queue = `'confirmed'`), `useSetServed` (absolute `servedQuantity`), `useHealth`.
- `src/ws/`: typed `SocketClient` (`withCredentials`, websocket transport, lazy connect, `reconnect()`), `useSocketStatus`, and `useRealtimeConnection(enabled)` which `App.tsx` enables once `useMe` returns a user, and reconnects after every token refresh because the handshake uses the access cookie.
- `pnpm build` passes; `pnpm lint` has only the known `button.tsx` warning.

## Not verified
- Not run against the real backend: it was not running and the infra ports are still taken by other containers. Needs: backend up, `pnpm db:seed`, then log in and call `/orders?status=confirmed`.
- `pnpm dev` uses port 5173, same as the guest app. Backend `CORS_ORIGINS` allows 5173-5175 (and the LAN IP), so run this app on 5174 or 5175 (`pnpm dev --port 5174`) or add the origin you choose.

## Next
- Login and change-password screens (nothing renders `useLogin` yet; with no session the app just shows the placeholder shell).
- Add server events to `src/ws/events.ts` once the backend emits them (`order:updated` is still pending there), then invalidate `queryKeys.orders.all` from the handler.
- Role-based nav (cashier is read-only for orders).
