# Surplus stock UI (ibb_sms) — 21/10/2026

Main doc: `ibb_shop_backend/docs/21102026/surplus_stock_write_offs.md`.

- Admin: new "Tồn dư" tab on `/stock` (`src/features/stock/write-offs-panel.tsx`): staff proposals to review (`write-off-review.tsx`, quantity can be corrected, reject needs a reason), items at risk (expired / expiring soon / stale) each with a "Hủy hàng" action, a manual "Hủy hàng" button, and the last 30 days of write-offs with the loss.
- Staff: new page `/stock/write-offs` ("Hủy hàng" in the menu, `write-offs-page.tsx`) to propose, see the outcome and withdraw pending ones; no costs shown.
- Shared form sheet `write-off-sheet.tsx` (`direct` for admin, `propose` for staff).
- Stock item form has a shelf-life field; the item history labels write-offs; Finance overview shows a "Hao hụt / hủy hàng" tile when there is a loss.
- API: `src/api/hooks/use-write-offs.ts`, routes and query keys, types in `src/api/types.ts`.

## Pending
- Not checked in a browser at 390px, and not run against the real backend (dev DB migration not applied).
