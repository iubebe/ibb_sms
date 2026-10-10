import { createBrowserRouter } from 'react-router'
import { ChangePasswordPage } from '@/features/auth/change-password-page'
import { LoginPage } from '@/features/auth/login-page'
import {
  GuestOnlyRoute,
  PasswordChangeRoute,
  ProtectedRoute,
  RoleRoute,
} from '@/features/auth/route-guards'
import { CheckInPage } from '@/features/check-in/check-in-page'
import { DashboardPage } from '@/features/dashboard/dashboard-page'
import { PageNotFound } from '@/features/errors/page-not-found'
import { CreateOrderPage } from '@/features/orders/create-order-page'
import { OrdersPage } from '@/features/orders/orders-page'
import { PaymentQrPage } from '@/features/payment-qr/payment-qr-page'
import { ProductsPage } from '@/features/products/products-page'
import { StaffPage } from '@/features/staff/staff-page'
import { TablesPage } from '@/features/tables/tables-page'
import { StaffRegistrationPage } from '@/features/staff-schedules/staff-registration-page'

export const router = createBrowserRouter([
  {
    element: <GuestOnlyRoute />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <PasswordChangeRoute />,
    children: [{ path: '/change-password', element: <ChangePasswordPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'orders', element: <OrdersPage /> },
      {
        element: <RoleRoute roles={['admin', 'staff']} />,
        children: [{ path: 'orders/create', element: <CreateOrderPage /> }],
      },
      {
        element: <RoleRoute roles={['admin']} />,
        children: [
          { path: 'products', element: <ProductsPage /> },
          { path: 'payment-qr', element: <PaymentQrPage /> },
          { path: 'staff', element: <StaffPage /> },
          { path: 'tables', element: <TablesPage /> },
        ],
      },
      {
        element: <RoleRoute roles={['staff']} />,
        children: [{ path: 'schedules/register', element: <StaffRegistrationPage /> }],
      },
      {
        element: <RoleRoute roles={['staff', 'cashier']} />,
        children: [{ path: 'check-in', element: <CheckInPage /> }],
      },
    ],
  },
  { path: '*', element: <PageNotFound /> },
])
