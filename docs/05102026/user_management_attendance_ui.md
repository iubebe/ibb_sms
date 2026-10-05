# User management and attendance UI

Date: 05/10/2026

Main doc (API, queue, decisions): `ibb_shop_backend/docs/05102026/attendance_api.md` and `user_management_api.md`.

## What was done

Admin, `/staff` (now admin only via `RoleRoute`; nav item restricted to admin):
- Tab "Tài khoản" (`src/features/staff/user-panel.tsx`, `user-form-sheet.tsx`, `reset-password-sheet.tsx`): create, edit (name, email, role, allow login), reset password, delete. Temporary passwords can be generated (`generate-password.ts`). Your own row has no reset/delete and no role/active controls (the backend refuses them anyway).
- Tab "Chấm công" (`attendance-panel.tsx`, `attendance-session-sheet.tsx`): month switcher, hours per person (days, sessions, decimal hours, forgotten check-outs), the sessions behind them (tap a person to filter), a session sheet with both photos and a form to correct times, and "Xuất Excel" for the month.

Staff and cashier, `/check-in` (new, nav item "Chấm công"; `src/features/check-in/`): shift status with a live timer, camera capture, one Check in / Check out button, today's and this month's totals, last sessions. Admin gets the forbidden page there.

API layer: `use-users.ts`, `use-attendance.ts`, types, routes, query keys.

## Reusable pieces (approved by the user before building)

- `src/hooks/use-camera.ts`: front camera, `capture()` returns a 640 px JPEG, releases the stream on stop/unmount.
- `src/components/camera-capture.tsx`: open camera -> take photo -> review -> accept or retake. Props beyond the proposal: `confirmLabel`, `pending`, `error`. Remount with a new `key` to reset.
- `src/lib/download-blob.ts` and `src/lib/format-time.ts` (small helpers; the latter was not in the proposal).
- `ConfirmDeleteDialog` is imported from `features/products`; it is now used three times, so moving it to `src/components/` is worth proposing.

## Decisions / notes

- The attendance upload overrides the client's default JSON `Content-Type`; without that axios sent the photo as JSON and the backend answered "Photo is required" (found in the browser test).
- Camera needs a secure context: it works on `localhost` and HTTPS, but not on a phone opening `http://<lan-ip>`. The component shows a message in that case.
- Times are shown in the browser's timezone and the time-correction inputs are read in it too. Month boundaries and the Excel file use the shop timezone (`SHOP_TIMEZONE`); these only differ if the admin's browser is in another timezone.
- Photos are loaded by `<img>` from the backend proxy using the login cookie, so the API and the app must be same-site (true for localhost and for one domain behind a proxy).

## Verified

`pnpm build` and `pnpm lint` pass (remaining lint warnings are in generated `components/ui`). Driven in real Chrome (fake webcam, 390 px and 1200 px) against the built backend on throwaway Postgres/Redis/RustFS: admin login with forced password change, create staff account, staff first login, check-in and check-out with photos, admin report, photos load in the session sheet, time correction (3.02 h), Excel download (contents checked), forbidden pages for the wrong role, no page errors. Not tested: a real phone camera, iOS Safari, the reset-password, edit, delete and disable flows in the UI (only through the API), dark mode.

## Pending

- Face detection worker and a screen for reviewing face results.
- Disabling a user keeps their access token alive up to 15 min.
- Pay rates, manual creation of a missing session.
- `ibb_shop_release` version bump; nothing is committed.
