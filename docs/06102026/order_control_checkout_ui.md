# Order control and checkout UI

Date: 06-10-2026

Main doc: `ibb_shop_backend/docs/06102026/order_control_checkout_api.md` (endpoints and rules).

## What was done

`/orders` in `ibb_sms` is now the working order screen (`src/features/orders/`), polling every 15 s:

- Tabs: "Chờ xác nhận" (admin, staff) and "Đang phục vụ" (cashier sees it as "Chờ thanh toán").
- `order-card.tsx`: confirm / reject, cancel, and a -/+ stepper for served quantity (admin, staff, confirmed orders only); "Thanh toán" for admin and cashier.
- `cancel-order-dialog.tsx`: confirmation before cancelling.
- `checkout-sheet.tsx`: bottom sheet with cash (amount received, quick bill buttons, change) or manual QR transfer; warns when items are still unserved but allows payment.
- API: `confirmOrder`, `cancelOrder`, `payOrder` and their hooks in `src/api/hooks/use-orders.ts`; mutations also refresh the dashboard.

Decision: cashier checkout lives in `ibb_sms`, not `ibb_shop_pos` (which is still an empty README). All components are local to the feature; none were proposed as shared.

## Verification

`pnpm build` and `pnpm lint` pass (3 existing warnings in shadcn files). The UI was NOT opened in a browser (Chrome tools were unavailable), so the 390px layout, sheet and stepper behaviour are untested. The backend flow behind it was tested with curl.

## Pending

- Click-through at 390px as admin, staff and cashier.
- Receipt/history of paid orders; payment QR image; `order:updated` WebSocket handler; moving checkout to `ibb_shop_pos` if wanted.
- Uncommitted.
