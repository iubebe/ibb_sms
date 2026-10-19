# Product cache check

Date: 19-10-2026

Main doc: `ibb_shop_backend/docs/19102026/product_redis_cache.md`.

## Result: no change needed
Every product mutation in `src/api/hooks/use-products.ts` (create, update, image upload, delete) invalidates `queryKeys.products.all` and the categories, and category mutations in `use-categories.ts` invalidate products too. The backend cache is dropped on the same writes, so the refetch gets fresh data.
