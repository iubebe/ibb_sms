# Stock UI (`/stock`) — 17/10/2026

Main doc: `ibb_shop_backend/docs/17102026/stock_imports.md`.

Admin-only page "Kho" (nav item with `Warehouse` icon, `RoleRoute` admin) with three tabs, all in `src/features/stock/`:
- **Tồn kho** (`stock-items-panel.tsx`): cards with quantity, low-stock badge, kind filter, "Sắp hết" filter; add/edit sheet; adjust sheet (set counted quantity or +/-, reason required, shows recent movements); delete with confirm (backend refuses if history exists).
- **Phiếu nhập** (`imports-panel.tsx`): month navigator, total spend, expandable receipts; `import-form-sheet.tsx` creates a receipt (supplier, datetime, lines with unit cost prefilled from the last price, live total).
- **Nhà cung cấp** (`suppliers-panel.tsx`): CRUD.

API layer: `api/hooks/use-stock.ts`, routes/keys/types added. No new shared components; `parseDecimal`/`formatQty` are local to the feature (`stock-labels.ts`).

Verified: `pnpm build`, `pnpm lint` (only pre-existing warnings). **Not checked in a browser at 390px** and not run against the real backend yet.
