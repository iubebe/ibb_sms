# Create order: look up customer by phone

Date: 21-10-2026

Follow-up to `customer_management.md` (same folder).

## What was done

- Backend: `GET /api/customers/lookup?phone=` (admin + staff, `src/modules/customers/customers.controller.ts`). Exact match on the normalized phone within the caller's branch; returns `{ customer: { id, name, phone, address } | null }`. It is declared before `:id`, and the rest of `/customers` stays admin only, so staff cannot list customers or see order counts/spend.
- ibb_sms create-order cart (`src/features/orders/create-order-page.tsx`): a "Tìm" button next to the phone field. It runs only when pressed (a mutation, `useLookupCustomer`), and is disabled until the phone is valid.
- Found: name, phone and address are filled in and stay editable. Not found: a hint says a new customer is created with the order. Changing the phone clears the hint.
- `CustomerFields` got an optional `phoneAction` slot for the button; the edit sheets are unchanged.

## Decisions

- Lookup overwrites whatever was already typed in name/address, since the point is to re-fill; staff can edit afterwards.
- Edited values still go through the normal create flow: same phone updates the customer's name/address, a new phone creates a new customer.

## Pending

- Not checked in a browser at 390px yet; needs the Customers migration applied on the dev DB.
