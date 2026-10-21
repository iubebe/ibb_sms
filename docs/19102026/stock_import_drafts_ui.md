# Stock import drafts UI

Date: 19-10-2026. Main doc: `ibb_shop_backend/docs/19102026/stock_import_drafts.md`.

- Staff: nav item "Nhập hàng" -> `/stock/drafts` (`src/features/stock/import-drafts-page.tsx`). List of own drafts with status badge, photo thumbnail, reject reason, "Hủy phiếu" for pending. Form: `import-draft-form-sheet.tsx` (photo via `prepareImage`, supplier, lines, note; cost optional).
- Admin: Kho > Phiếu nhập shows status badges, "N phiếu chờ duyệt", and `import-review.tsx` for pending receipts (photo; admin can edit quantity and unit cost and remove lines, at least one line must remain; confirm/reject with reason). Edited lines are sent as the `lines` replacement on confirm; supplier, note, date and items are not editable. Total spend counts confirmed receipts only.
- API/hook additions in `src/api/hooks/use-stock.ts`, types, routes, query keys.
- The photo picker is local to the draft form; not shared with `ProductImageField` (reuse policy: propose first).

Pending: no browser check at 390px; backend migration must be applied first.
