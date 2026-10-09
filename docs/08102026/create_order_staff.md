# Staff-side Order Creation UI

**Date:** 08/10/2026

**Main doc:** [Backend changes](../../ibb_shop_backend/docs/08102026/create_order_staff.md)

## SMS App Changes

### New Page
- **Path:** `/orders/create`
- **Roles:** `ADMIN`, `STAFF`
- **Location:** Accessible from the "Orders" page via "Tạo đơn" (Create Order) button

### Files Changed

1. **`src/features/orders/create-order-page.tsx`** (new)
   - Two-step interface:
     1. Select a table from branch's active tables
     2. Add products from the menu, adjust quantities
   - Shows order total live
   - Displays added items with quantities and unit prices
   - Submits to `/api/orders` via `useCreateOrder()` hook
   - Redirects to `/orders` on success

2. **`src/api/types.ts`**
   - Added `CreateOrderItemInput` interface (productId, quantity, notes?)
   - Added `CreateOrderStaffInput` interface (tableId, items)

3. **`src/api/routes.ts`**
   - Added `create: '/orders'` route for POST

4. **`src/api/hooks/use-orders.ts`**
   - Added `createOrderForStaff()` async function
   - Added `useCreateOrder()` hook (invalidates orders and dashboard on success)

5. **`src/features/orders/orders-page.tsx`**
   - Added "Tạo đơn" button (visible only for ADMIN and STAFF)
   - Navigates to `/orders/create`

6. **`src/router.tsx`**
   - Added route: `path: 'orders/create'` under `RoleRoute roles={['admin', 'staff']}`

### UI Details

- **Mobile-first** (390px target width per SMS conventions)
- Tables list displays as 2-column grid on mobile, 3-column on md breakpoint
- Product list shows name, price, add button
- Added items appear in a sticky footer with running total
- Quantities managed via +/- buttons
- Responsive layout shifts to bottom sheet context on mobile per `ibb_sms/CLAUDE.md`

### Validation

- Table must exist and belong to the branch (backend)
- All products must be active (backend)
- At least 1 item required before submission
- Quantities 1-99 (enforced in DTO)

### Next Steps

- Add notes/special instructions input field per product
- Implement checkout flow on POS for table orders
