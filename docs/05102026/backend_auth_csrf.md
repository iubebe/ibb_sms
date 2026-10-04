# Backend auth: what the SMS app needs

Date: 05/10/2026

Main doc: `ibb_shop_backend/docs/05102026/setup_auth.md`. Nothing is implemented in this project yet.

- Same cookie flow as the POS: `GET /api/auth/csrf`, `POST /api/auth/login` with `X-CSRF-Token`, `credentials: 'include'`, refresh once on 401 (serialized), reconnect the WebSocket after refresh.
- Roles `admin` and `staff` are bound in the token. Use `GET /api/auth/me` to show/hide UI; the backend enforces access.
- The backend must list this app's origin in `CORS_ORIGINS`.
