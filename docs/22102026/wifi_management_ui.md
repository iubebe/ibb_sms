# WiFi management UI (22-10-2026)

Main doc: `ibb_shop_backend/docs/22102026/wifi_qr_module.md` (API, security decisions).

## What was done
- Admin page `/wifi` (nav item "WiFi", `RoleRoute` admin): `src/features/wifi/` (`wifi-page`, `wifi-card`, `wifi-form-sheet`, `wifi-labels`), hooks `src/api/hooks/use-wifi.ts`, route/key/type entries in `src/router.tsx`, `src/api/{routes,query-keys,types}.ts`, `src/features/shell/nav-items.ts`.
- Add network, change password (re-enter full credentials), toggle "printed on table QR" (one active at a time), delete, QR preview.
- Print-QR sheet text now mentions table name and WiFi QR.

## Security in the UI
- Password lives only in the form's local state (sheet remounts per open), is `type=password` with `autoComplete="new-password"`, and is cleared after submit.
- Credential mutations use `gcTime: 0` so react-query doesn't keep the password in its mutation cache; the list query also has `gcTime: 0`.
- Image URL carries `?v=<updatedAt>`; backend serves it `no-store`.
- Client validation mirrors the backend (WPA 8-63, WEP 5/13, SSID <= 32 bytes); backend is the authority.

## Pending
- Not clicked through in a browser at 390px and not run against the backend (build and lint pass only).
- Backend migration `1792630000000-WifiNetworks` still has to be applied first.
