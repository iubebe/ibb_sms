# Serving tracking (pointer)

Date: 05/10/2026

Main doc: `ibb_shop_backend/docs/05102026/order_item_served_tracking.md`.

Nothing built here yet (`ibb_sms` has no app). What this project needs when it is started:
- A serving queue from `GET /api/orders?status=confirmed`.
- Per line, staff mark units delivered with `PATCH /api/orders/:orderId/items/:itemId/served` (`{ servedQuantity }`, absolute count, 0..quantity); e.g. "+1" and "served all" buttons.
- Highlight orders that still have unserved items; send the CSRF header on the PATCH.
