# Product and category management (admin only)

Date: 05/10/2026

Main doc: `ibb_shop_backend/docs/05102026/product_category_crud.md` (API, validation, delete rules). Builds on `routing_protected_route.md`.

## Done
- API layer: types, routes, query keys, hooks `useCategories/useCreateCategory/useUpdateCategory/useDeleteCategory` and `useProducts/useCreateProduct/useUpdateProduct/useDeleteProduct`. Mutations invalidate both products and categories (category counts and uncategorized products change together).
- Access control: `RoleRoute` (in `src/features/auth/route-guards.tsx`) wraps `/products` with `roles={['admin']}`; other roles see `ForbiddenPage` inside the shell. `NAV_ITEMS` got an optional `roles`, and the sidebar, drawer and bottom bar hide items the role can't open (the bottom bar now sizes itself to the visible items). This is UX only; the backend enforces admin.
- `/products` page (`src/features/products/`), tabs "Sản phẩm" and "Danh mục":
  - Products: category filter chips (horizontal scroll), cards on mobile and a table from `md`, quick "Đang bán" switch per row, add/edit in a bottom sheet (name, price, category native `<select>`, image URL, active), delete confirm. Price input is digits-only with a formatted preview (max 100.000.000 ₫).
  - Categories: list with product counts, add/edit sheet, delete confirm that tells how many products become uncategorized.
  - Loading skeletons, empty and error states (with retry); backend errors (duplicate name 409, product used by orders 409) are shown inline in the form or dialog.
- shadcn added: `switch`, `badge`, `alert-dialog`, `tabs` (cn import fixed each time; `shadcn add -o` was needed because it prompted to overwrite `button.tsx`, which came back unchanged).
- `pnpm build` passes; lint has only "only-export-components" warnings in generated shadcn files.

## Decisions
- Images are a URL field; real upload needs a backend storage decision.
- Local-to-feature components only (`*-form-sheet`); `formatPrice` was copied from the guest app into `src/lib/format-price.ts`. `confirm-delete-dialog` was later moved to `src/components/` (06/10/2026), shared by products, staff and tables.
- Deleting a product used in orders is blocked by the backend (409); the dialog explains to switch it off instead.

## Not verified
- Not run end to end: no admin credentials were used, so create/edit/delete and the UI at 390px have not been exercised. Check: add category, add product with/without category and image, filter, toggle active, edit, delete unused product, delete a product used by an order (expect the 409 message), delete a category with products, open `/products` as staff/cashier (forbidden, no nav item).

## Next
- Serving queue on `/orders`; image upload; reorder (`sortOrder`) once the backend has it.
