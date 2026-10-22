# Mobile bottom bar: key items + centre create-order shortcut — 21/10/2026

## Done
- `src/features/shell/nav-items.ts`: new `bottom` flag (and `shortLabel`) picks what is pinned to the mobile bottom bar. Everything else stays in the sheet menu / desktop sidebar.
  - admin: Tổng quan, Đơn hàng, Sản phẩm, Kho
  - staff: Tổng quan, Đơn hàng, Chấm công, Ca làm
  - cashier: Tổng quan, Đơn hàng, Chấm công
- `src/features/shell/app-shell.tsx`: admin/staff (`CREATE_ORDER_ROLES`) get a raised round "Tạo đơn" button in the middle linking to `/orders/create`; the other tabs split evenly around it. Cashiers have no centre button.
- `/orders` tab uses `end` so it is not highlighted on `/orders/create`.

## Pending
- Not checked in a browser at 390px; `pnpm build` passes.
- Prettier flags the two files (they were not prettier-formatted before either).
