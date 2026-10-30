# Order history search

Date: 24/10/2026

Main doc: `ibb_shop_backend/docs/24102026/order_search_by_number.md`.

- `src/features/orders/order-history-page.tsx`: search input (3-8 hex chars, `#` optional), results across all days, clear button, order number shown on each card.
- `useOrderSearch` / `ORDER_NUMBER_PATTERN` in `src/api/hooks/use-orders.ts`.
- Pending: browser check on mobile width.
