# Customer management (ibb_sms)

Date: 21-10-2026

Main doc: `ibb_shop_backend/docs/21102026/customer_management.md` (API, data model, decisions).

## What was done

- Create order page (`src/features/orders/create-order-page.tsx`): optional name/phone/address inside the cart sheet, sent with the order.
- Order card (`src/features/orders/order-card.tsx`): shows the customer line and a "Thêm khách / Sửa khách" button for admin/staff while the order is pending or confirmed; opens `EditOrderCustomerSheet`. Order history shows the customer read-only.
- Admin page `/customers` (nav item "Khách hàng"): search, per-customer order count / total spent / last order, edit sheet, delete confirm. Files are in `src/features/customers/`.
- API layer: `use-customers.ts`, `useUpdateOrderCustomer`, routes, query keys, types.

## Pending

- Not checked in a browser at 390px yet (`pnpm build` and `pnpm lint` are clean for the new files). Needs the backend migration applied first.
- `CustomerFields` (shared by the create-order cart and the two edit sheets) is a feature-local component, not a global one.
