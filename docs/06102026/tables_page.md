# Table management and QR printing (admin only)

Date: 06/10/2026

Backend doc: `ibb_shop_backend/docs/06102026/tables_qr_pdf.md` (API, token and PDF rules). Builds on `routing_protected_route.md`.

## Done
- API layer: `DiningTable` types, `API_ROUTES.tables`, `queryKeys.tables`, hooks `useTables/useCreateTable/useUpdateTable/useRegenerateTableQr/useDeleteTable/useTableQrPdf` in `src/api/hooks/use-tables.ts`.
- `/tables` page (`src/features/tables/`), admin only through `RoleRoute`; new `NAV_ITEMS` entry "Bàn" (QR icon, admin only).
  - List of tables (cards on mobile, two columns from `md`) with edit, regenerate QR and delete buttons; loading skeletons, empty and error (retry) states.
  - Add/rename in a bottom sheet; duplicate name (409) is shown inline.
  - "In mã QR" opens a sheet to choose 6, 12 (default) or 24 codes per page and downloads `ma-qr-ban.pdf` (GET as a blob through `downloadBlob`, same approach as the attendance export). Disabled while there are no tables.
  - Regenerate QR has its own confirm dialog warning that the printed QR stops working; delete reuses `ConfirmDeleteDialog`.
- No new shadcn components. `pnpm build` passes; lint shows only the existing "only-export-components" warnings in generated shadcn files.

## Decisions
- Whole-branch printing only; the backend also accepts `ids` for a subset, not used in the UI yet.
- `ConfirmDeleteDialog` moved from `features/products/` to `src/components/confirm-delete-dialog.tsx` (approved), now shared by products, staff and tables.
- `regenerate-qr-dialog.tsx` is local to the feature because its button label and copy differ from the delete dialog.

## Not verified
- Not run end to end (no admin credentials, backend not started), and not checked at 390px. Check: add a table, duplicate name, rename, regenerate (old QR stops working), delete, download the PDF in all three layouts and scan a printed code, open `/tables` as staff (forbidden, no nav item).
- The backend needs `GUEST_APP_URL` set to the real guest origin before printing.

## Next
- Select specific tables to print; show each table's QR on screen.
