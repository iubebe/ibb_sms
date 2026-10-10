# Checkout for Staff with Payment QR Display

**Date:** 10/10/2026

## Summary

Implemented staff checkout capability and improved payment method handling:
- Staff can now checkout orders (previously cashier-only)
- Cash payment auto-verifies immediately
- Transfer/QR payment displays QR code image with total amount
- Backend endpoint to fetch payment QR codes for a branch

## Changes

### Backend (`ibb_shop_backend`)

**Orders Service (`src/modules/orders/orders.service.ts`)**
- Added `PaymentQrCode` repository injection
- New method `getPaymentQrCodes(branchId)` - fetches active QR codes for a branch

**Orders Controller (`src/modules/orders/orders.controller.ts`)**
- Updated `@Roles` decorator on `/pay` endpoint to include `staff` (was `admin` + `cashier`)
- New endpoint `GET /orders/payment-qr-codes` - returns payment QR codes for the user's branch

### Frontend - SMS App (`ibb_sms`)

**API Types (`src/api/types.ts`)**
- Added `PaymentQrCode` interface

**API Routes (`src/api/routes.ts`)**
- Added `paymentQrCodes: '/orders/payment-qr-codes'`

**Query Keys (`src/api/query-keys.ts`)**
- Added `paymentQrCodes: ['orders', 'paymentQrCodes']`

**Hooks (`src/api/hooks/use-orders.ts`)**
- Added `usePaymentQrCodes()` hook to fetch QR codes

**Checkout Sheet (`src/features/orders/checkout-sheet.tsx`)**
- Integrated `usePaymentQrCodes()` hook
- Cash payment: displays input field + quick amount buttons (unchanged)
- QR/Transfer payment: fetches and displays all active payment QR codes with labels
- Enhanced button text: "Xác nhận thanh toán tiền mặt" (cash) vs "Khách đã thanh toán" (QR)
- Fallback message when no QR codes configured

**Orders Page (`src/features/orders/orders-page.tsx`)**
- Updated permission check: `canCheckout = role === "admin" || role === "staff" || role === "cashier"`

### Frontend - POS App (`ibb_shop_pos`)

Applied same improvements as SMS app:
- Added `PaymentQrCode` type, routes, query keys, and hook
- Updated checkout sheet to display QR codes
- Same cash/QR payment flow

## Payment Flow

### Cash Payment
1. User selects "Tiền mặt" (Cash)
2. Enters amount received
3. System calculates change
4. Click "Xác nhận thanh toán tiền mặt"
5. Order marked as `paid` immediately

### QR/Transfer Payment
1. User selects "Chuyển khoản" (Transfer)
2. System fetches and displays active payment QR codes
3. Customer scans and pays
4. Staff verifies payment received
5. Click "Khách đã thanh toán"
6. Order marked as `paid`

## Files Modified

**Backend:**
- `src/modules/orders/orders.service.ts`
- `src/modules/orders/orders.controller.ts`

**SMS App:**
- `src/features/orders/orders-page.tsx`
- `src/features/orders/checkout-sheet.tsx`
- `src/api/types.ts`
- `src/api/routes.ts`
- `src/api/query-keys.ts`
- `src/api/hooks/use-orders.ts`

**POS App:**
- `src/features/checkout/checkout-sheet.tsx`
- `src/api/types.ts`
- `src/api/routes.ts`
- `src/api/query-keys.ts`
- `src/api/hooks/use-orders.ts`

## Next Steps

1. Configure payment QR codes in the admin panel
2. Test cash and QR payment flows
3. Verify QR code images display correctly
4. Monitor WebSocket updates when available (currently polls every 15s)

## Notes

- QR codes are fetched from `payment_qr_codes` table (created in DB, awaiting admin UI)
- Both cash and QR mark order as `PAID` status
- All role permissions enforced at backend level
- Change calculation is UI-only; backend stores only payment method
