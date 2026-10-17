# Receipt preview and print at checkout — 17/10/2026

## Done
- `src/features/orders/receipt.tsx`: `Receipt` (80mm thermal layout: shop, table, order short id, items with qty × unit price, total, payment method, cash received/change) and `ReceiptDialog` (preview + "In hóa đơn" button using `window.print()`).
- `src/index.css`: `@media print` hides everything except `#receipt-print` (portal copy of the bill on `<body>`), `@page` 80mm.
- `checkout-sheet.tsx`: new "Xem hóa đơn" button (provisional bill, "PHIẾU TẠM TÍNH"). After a successful payment the sheet no longer closes immediately: it shows "Đã thanh toán", opens the paid bill, and offers "In hóa đơn" / "Xong".
- `api/types.ts`: `StaffOrderItem.unitPrice`. Backend change: `ibb_shop_backend/docs/17102026/order_item_unit_price.md`.

## Decisions
- Print via browser print dialog (works with any thermal printer driver); no ESC/POS or direct printer integration.
- Per order, not per table. Receipt shows payment info from the client (the order view has no paidAt/paymentMethod), so reprinting an already-paid order later is not possible yet.

## Pending / next
- `pnpm build` passes; NOT verified in a browser or on a real printer (check at 390px and the print preview).
- Same change for `ibb_shop_pos` (its `checkout-sheet.tsx` is a copy) once confirmed here.
- Optional: combined bill per table; reprint from order history (needs paidAt/paymentMethod in the view).
