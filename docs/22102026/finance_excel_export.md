# Finance Excel export button

Date: 22/10/2026

Main doc: `ibb_shop_backend/docs/22102026/finance_excel_export.md`.

- "Xuất Excel" button in the `/finance` page header (`src/features/finance/finance-page.tsx`) downloads `tai-chinh-<YYYY-MM>.xlsx` for the month on screen.
- API: `exportFinance` / `useExportFinance` in `src/api/hooks/use-finance.ts`, route `API_ROUTES.finance.export`. Same blob-download pattern as the attendance export.
- Pending: not exercised against the real backend in a browser.
