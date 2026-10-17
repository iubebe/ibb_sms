# Finance UI — 17/10/2026

Main doc: `ibb_shop_backend/docs/17102026/finance_monitoring.md`.

- New admin-only page `/finance` (nav "Tài chính", `src/features/finance/`): month switcher, tabs **Tổng quan** (KPI tiles, cost breakdown, daily revenue-vs-cost bars in plain CSS, revenue by method, operating cost by category, salary per staff) and **Chi phí vận hành** (add/edit/delete expenses).
- Staff form (`features/staff/user-form-sheet.tsx`): "Lương theo giờ" field when editing a non-admin user.
- Import creation and user updates invalidate finance queries.
- Checked at 390px against a mock API (no horizontal overflow). Not checked against the real backend; `pnpm build` and lint clean.
- Pending: charts library if richer charts are wanted; forecast view.
