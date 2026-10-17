# Admin UI: payment QR codes (ibb_sms)

**Date:** 11/10/2026

Front-end for the admin QR management API. The backend contract and decisions are in `ibb_shop_backend/docs/11102026/payment_qr_codes_api.md`.

## What was done

New admin page **Mã QR** at `/payment-qr` (admin only, added to the bottom bar and sidebar).

- List of codes as cards: image, name, status badge, and an on/off switch. Inactive codes are shown with an "off" badge and don't appear at checkout.
- **Thêm mã**: bottom sheet with a name and an image. Image is required.
- **Sửa**: bottom sheet for the name and/or a new image. Leaving the image empty keeps the current one.
- **Xóa**: uses the shared `ConfirmDeleteDialog`.
- Loading skeleton, error with retry, and empty state.

Files:
- `src/features/payment-qr/payment-qr-page.tsx`: page, delete flow.
- `src/features/payment-qr/payment-qr-card.tsx`: card and switch.
- `src/features/payment-qr/payment-qr-form-sheet.tsx`: create/edit sheet.
- `src/api/hooks/use-payment-qr-codes.ts`: list, create, update, replace image, delete.
- `src/api/types.ts`, `src/api/routes.ts`, `src/api/query-keys.ts`: additions.
- `src/router.tsx`, `src/features/shell/nav-items.ts`: route and nav entry.

## Decisions

- **Original image is sent, not re-encoded.** The product image field downsizes to a JPEG, which can add compression artifacts that make a QR code harder to scan. For payment codes the file is sent as picked, after checking type (JPEG/PNG/WebP) and size (5 MB, the backend limit).
- **Changes refresh the checkout list too.** Create, edit, toggle and delete invalidate both the admin list and `orders.paymentQrCodes`, so checkout sees changes without a reload.
- **Edit saves in two steps** when both the name and the image change: rename first, then replace the image. If the second step fails, the error shows and the list refreshes, so the user can see what was saved.
- **No new shared components.** The form and card are local to the feature. The image picker is written locally rather than imported from products, to avoid the downscaling helper.

## Verification

- `pnpm build`: passes.
- `pnpm lint`: exits 0. The 4 warnings are pre-existing and not in these files.
- Layout checked at 390px in Chrome's mobile emulation (DevTools protocol): no element extends past the viewport, and the list, card, and edit sheet render correctly.
- The check used a mock API that returned fixed data. Real create, edit, replace-image and delete calls against the backend were **not** run, since they would write to the dev database.

Note: an earlier 390px screenshot of the staff schedule screen was taken without mobile emulation and looked clipped. That was the capture method, not the layout.

## Pending / next steps

1. End-to-end test against a backend with an admin session: upload, rename, toggle, replace image, delete. Needs a throwaway database or your go-ahead.
2. Check that checkout (`ibb_sms` and `ibb_shop_pos`) shows the updated codes after a change, with real data.
3. Commit and release bump in `ibb_shop_release`.

## Related

- Backend API: `ibb_shop_backend/docs/11102026/payment_qr_codes_api.md`
- Checkout read path: `ibb_shop_backend/docs/10102026/checkout_for_staff_with_qr.md`
