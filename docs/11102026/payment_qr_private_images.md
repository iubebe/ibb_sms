# Payment QR Images: Frontend Integration

**Date:** 11/10/2026

## Overview

Updated ibb_sms to fetch payment QR code images via authenticated API endpoint (was public S3 URLs). Images are now private and require authentication to access.

**See main doc:** `ibb_shop_backend/docs/11102026/payment_qr_private_images.md`

## Changes in ibb_sms

### New Helper Function

**File:** `src/api/hooks/use-payment-qr-codes.ts`

```typescript
export function paymentQrImageUrl(id: string): string {
  return `${env.apiUrl}${API_ROUTES.paymentQrCodes.image(id)}`
}
```

- Constructs full API URL with correct domain
- Respects `VITE_API_URL` environment variable
- Handles both dev (`http://localhost:3000/api`) and prod (`https://api.iubebe.vn/api`) domains

### Updated Components

All components that display QR code images now use the helper:

| Component | Location | Change |
|-----------|----------|--------|
| Payment QR Card | `payment-qr/payment-qr-card.tsx` | Display in admin page |
| Payment QR Form | `payment-qr/payment-qr-form-sheet.tsx` | Preview when editing |
| Checkout | `orders/checkout-sheet.tsx` | Display during staff checkout |

**Before:**
```typescript
src={code.imagePath}  // Was public S3 URL
```

**After:**
```typescript
src={paymentQrImageUrl(code.id)}  // Authenticated endpoint
```

### Type Update

**File:** `src/api/types.ts`

```typescript
export interface PaymentQrCode {
  // ...
  /** S3 key (private, fetched via GET /payment-qr-codes/:id/image) */
  imagePath: string
  // ...
}
```

Comment clarifies that `imagePath` is now an S3 key, not a public URL.

## How It Works

1. **Frontend requests image:** `GET /api/payment-qr-codes/{id}/image`
2. **Backend authenticates:** Checks auth cookie, verifies user role (ADMIN/STAFF/CASHIER)
3. **Backend redirects:** Returns 302 with presigned S3 URL (1 hour expiration)
4. **Browser follows:** Downloads image from S3 using presigned URL
5. **S3 validates:** Presigned URL is time-limited, single-use

## Testing

### Admin Page

```
1. Navigate to "Mã QR thanh toán" tab
2. Verify QR code images display (via authenticated endpoint)
3. Edit a code: verify image preview shows
4. Upload new image: verify it's stored as private
```

### Staff Checkout

```
1. Open order details
2. Click "Thanh toán"
3. Select "Chuyển khoản" payment method
4. Verify QR code images display (via authenticated endpoint)
5. Images should load with auth cookie
```

### Network Inspection

```
Browser DevTools → Network tab:
- Request: /api/payment-qr-codes/{id}/image (302 Redirect)
  - Headers: Cookie: ... (authenticated)
- Redirect to: presigned S3 URL with timestamp
```

## Deployment Notes

- **No env var changes** — Uses existing `VITE_API_URL`
- **Cookie-based auth** — Same as other API requests, no special setup needed
- **Transparent to users** — Image loading appears normal, but now via authenticated endpoint

## Rollback

If needed, revert commits in this order:
1. Revert `src/api/hooks/use-payment-qr-codes.ts`
2. Revert `src/features/payment-qr/*` component changes
3. Revert `src/features/orders/checkout-sheet.tsx`
4. Backend will serve public URLs again (after separate rollback)

## References

- Backend changes: `ibb_shop_backend/docs/11102026/payment_qr_private_images.md`
- API routes: `src/api/routes.ts` (paymentQrCodes.image)
- Attendance photos (same pattern): `src/api/hooks/use-attendance.ts`
