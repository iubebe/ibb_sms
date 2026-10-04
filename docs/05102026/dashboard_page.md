# Dashboard page

Date: 05/10/2026

Main doc: `ibb_shop_backend/docs/05102026/dashboard_api.md`.

## Done
- `/` (`src/features/dashboard/dashboard-page.tsx`) is visible to admin, staff and cashier. Sections: "Đơn đang xử lý" (3 counters; pending and unserved items are outlined when above 0), "Doanh thu" (revenue + paid orders) and "Bán chạy hôm nay" (top 5), and "Đơn gần đây" (list with time, item count, total, status badge).
- Role rule (decided with the user): revenue and top products are admin only. The UI shows them only when `sales` is present, and the backend sends `sales: null` to staff and cashier.
- `useDashboard` (`src/api/hooks/use-dashboard.ts`) polls every 15 s (WebSocket events not available yet) and shows a small "updating" hint. Skeleton, error with retry, and empty states are handled.
- Mobile first: counters in a 3-column row, single-column cards, recent orders in two columns from `md`.
- `pnpm build` passes; lint clean apart from the known generated-component warnings.

## Not verified
- Not seen in a browser or with an authenticated session (no credentials used). Check as admin (all sections) and as staff/cashier (no revenue sections), at 390px and desktop.

## Next
- Replace polling with a WebSocket event once the backend emits order events; serving queue on `/orders`.
