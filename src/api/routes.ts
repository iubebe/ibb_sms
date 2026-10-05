/** All backend REST paths, relative to `env.apiUrl` (which already includes `/api`). */
export const API_ROUTES = {
  health: '/health',
  auth: {
    csrf: '/auth/csrf',
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
    changePassword: '/auth/change-password',
  },
  dashboard: '/dashboard',
  categories: {
    list: '/categories',
    detail: (id: string) => `/categories/${encodeURIComponent(id)}`,
  },
  products: {
    list: '/products',
    detail: (id: string) => `/products/${encodeURIComponent(id)}`,
  },
  users: {
    list: '/users',
    detail: (id: string) => `/users/${encodeURIComponent(id)}`,
    resetPassword: (id: string) => `/users/${encodeURIComponent(id)}/reset-password`,
  },
  attendance: {
    me: '/attendance/me',
    checkIn: '/attendance/check-in',
    checkOut: '/attendance/check-out',
    list: '/attendance',
    report: '/attendance/report',
    exportReport: '/attendance/report/export',
    detail: (id: string) => `/attendance/${encodeURIComponent(id)}`,
    photo: (id: string, kind: string) => `/attendance/${encodeURIComponent(id)}/photo/${kind}`,
  },
  orders: {
    list: '/orders',
    confirm: (orderId: string) => `/orders/${encodeURIComponent(orderId)}/confirm`,
    cancel: (orderId: string) => `/orders/${encodeURIComponent(orderId)}/cancel`,
    pay: (orderId: string) => `/orders/${encodeURIComponent(orderId)}/pay`,
    served: (orderId: string, itemId: string) =>
      `/orders/${encodeURIComponent(orderId)}/items/${encodeURIComponent(itemId)}/served`,
  },
} as const
