# Product image uploader

Date: 07/10/2026

## Done

- Product form sheet: the "Ảnh (đường dẫn URL)" input is replaced by `ProductImageField` (`src/features/products/product-image-field.tsx`): 96px preview, "Chọn ảnh / Đổi ảnh" (native file picker, so phones offer camera or gallery) and "Xóa ảnh".
- `prepare-image.ts`: the picked file is decoded and re-encoded as a JPEG, longest side 1280px, quality 0.85. Keeps uploads small on mobile data, stays under the backend's 5 MB limit, and handles HEIC/large camera photos.
- `uploadProductImage` / `useUploadProductImage` in `use-products.ts` (`POST /products/:id/image`, multipart field `image`, 30 s timeout); route `API_ROUTES.products.image`.
- Save flow: create/update the product first, then upload the picked image (the backend sets `imageUrl` to the `https://media.<DOMAIN>/products/...` URL). "Xóa ảnh" sends `imageUrl: null` on save, which also deletes the stored file.
- If a new product is created but the upload fails, the sheet stays open with an error; saving again updates that product (no duplicate).
- ibb_shop_guest needs no change: it already renders `imageUrl` from the menu API, which now points at media.iubebe.vn. The image is public through the nginx/RustFS setup in `ibb_shop_release/docs/07102026/media_host.md`.

## Decisions

- Image work is local to the products feature (no shared component/hook added). Extract `ProductImageField`/`prepareImage` only if another screen needs them.
- Picking an image does not upload immediately; nothing is stored until "Lưu".
- Existing products with an external URL still show it; removing it just clears the field.

## Verified

- `pnpm build`, `pnpm lint` pass (only the pre-existing shadcn warnings).

## Pending

- Not run end to end (needs backend + RustFS + media host) and not checked at 390px.
- Still depends on the media.<DOMAIN> DNS/TLS/policy steps in the release doc.
