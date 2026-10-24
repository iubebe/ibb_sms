# ibb_sms: break-even and KPI cards

Date: 24/10/2026. Main doc: `ibb_shop_backend/docs/24102026/break_even_and_kpi.md`.

- `src/features/finance/break-even-section.tsx` (two cards: "Hòa vốn tháng", "KPI gợi ý tháng này") rendered in the overview tab under the tiles; hook `useBreakEven` in `use-finance.ts`. "Xuất Excel" includes the new sheet.
- `pnpm build` and `pnpm lint` pass; not checked in a browser.
