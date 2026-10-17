# Shop name editor (admin) — 17/10/2026

Main doc: `ibb_shop_backend/docs/17102026/shop_name_editor_api.md`.

- `/shop` ("Cửa hàng", admin only, in `NAV_ITEMS` as `hiddenInNav` so it sits in the menu drawer/sidebar, not the bottom bar): form for name + address. `src/features/shop/shop-page.tsx`.
- `src/api/hooks/use-branch.ts`: `useBranch()` / `useUpdateBranch()` (writes result into the query cache).
- The shell brand and the receipt header (name + address) now use the shop name, falling back to "Iubebe SMS" / "Iubebe". See `receipt_preview_print.md`.
- `pnpm build` and lint pass; not checked in a browser at 390px.
