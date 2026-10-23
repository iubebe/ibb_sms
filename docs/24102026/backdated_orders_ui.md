# Backdated orders UI (admin)

**Date:** 24/10/2026

Main doc: `ibb_shop_backend/docs/24102026/backdated_orders_and_excel_dates.md`.

## What was done

New admin page `/orders/backdated` ("Nhập đơn cũ"), opened from the "Đơn cũ" button in the Orders page header. Two tabs:

- **Nhập tay** (`features/orders/backdated-manual-form.tsx`): pick a past day on the calendar, pick payment (cash / transfer), add several orders (table, optional time, products with quantity), save all at once. Orders are saved as paid.
- **Từ Excel** (`features/orders/order-import-panel.tsx`): download the template, upload a filled `.xlsx`, see created orders or the list of row errors (nothing is imported when any row is wrong).

API layer: `src/api/hooks/use-orders.ts`, routes and types added. Route registered in `src/router.tsx` (admin only) and `NAV_ITEMS` (hidden from nav).

## Verification

`pnpm build` passes; `pnpm lint` shows no errors (one `Date` purity warning in the new form, same as the history page). **Not checked in a browser at 390px or against a running backend.**

## Next

Browser check with a mock API or the dev stack; confirm the Select lists and the time picker fit at 390px.
