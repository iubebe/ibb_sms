# ibb_sms: investments and ROI tab

Date: 23/10/2026

Main doc: `ibb_shop_backend/docs/23102026/finance_investments_roi.md`.

- New "Đầu tư & ROI" tab on `/finance` (`src/features/finance/investments-panel.tsx`, `investment-form-sheet.tsx`): ROI tiles for the selected month, investment list as cards, add/edit sheet, delete dialog.
- API: types, routes, query keys and hooks added alongside the expense ones (`use-finance.ts`). The existing "Xuất Excel" button now includes the new sheet.
- `pnpm build` and `pnpm lint` pass. Not checked in a browser at 390px and not tried against the real backend.
