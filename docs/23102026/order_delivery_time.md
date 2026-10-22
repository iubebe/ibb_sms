# Online receipt and delivery time

Date: 23/10/2026

Main doc: `ibb_shop_backend/docs/23102026/order_delivery_time.md`.

- Receipt (`src/features/orders/receipt.tsx`): for the "Online" table, shows "Đơn online" instead of the table, plus customer name/phone/address and "Giao lúc".
- Create-order page and edit-customer sheet get a "Giờ giao hàng" `datetime-local` input, shown only for the Online table.
- Helpers in `src/lib/online-order.ts`.
- Pending: browser check at 390px; the receipt print layout was not viewed.
