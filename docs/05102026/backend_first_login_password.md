# Backend: first-login password change

Date: 05/10/2026

Main doc: `ibb_shop_backend/docs/05102026/seed_admin_change_password.md`. Nothing is implemented in this project yet.

- Login/me responses include `user.mustChangePassword`. When true, show a change-password screen and call `POST /api/auth/change-password` (`currentPassword`, `newPassword` 10-128 chars, `X-CSRF-Token`). Other API calls return 403 until it is done.
- The call replaces the session cookies; no extra login is needed.
