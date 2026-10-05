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
import { OrdersPage } from '@/features/orders/orders-page'
import { ProductsPage } from '@/features/products/products-page'
import { StaffPage } from '@/features/staff/staff-page'

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
        element: <RoleRoute roles={['admin']} />,
        children: [
          { path: 'products', element: <ProductsPage /> },
          { path: 'staff', element: <StaffPage /> },
        ],
      },
      {
        element: <RoleRoute roles={['staff', 'cashier']} />,
        children: [{ path: 'check-in', element: <CheckInPage /> }],
      },
    ],
  },
  { path: '*', element: <PageNotFound /> },
])
