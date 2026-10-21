# Add items to an open order (ibb_sms) — 21/10/2026

Main doc: `ibb_shop_backend/docs/21102026/add_items_to_order.md`.

- "Thêm món" button on `OrderCard` (admin/staff, pending or confirmed orders) opens `src/features/orders/add-items-sheet.tsx`, a bottom sheet with the product list and quantity steppers.
- API: `addOrderItems` / `useAddOrderItems` in `src/api/hooks/use-orders.ts`, route `API_ROUTES.orders.addItems`.
- The product row UI duplicates part of `create-order-page.tsx`; worth proposing a shared picker component (not done, awaiting approval).
- Not yet checked at 390px in a browser.
