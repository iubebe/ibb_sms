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
  categories: {
    list: '/categories',
    detail: (id: string) => `/categories/${encodeURIComponent(id)}`,
  },
  products: {
    list: '/products',
    detail: (id: string) => `/products/${encodeURIComponent(id)}`,
  },
  orders: {
    list: '/orders',
    served: (orderId: string, itemId: string) =>
      `/orders/${encodeURIComponent(orderId)}/items/${encodeURIComponent(itemId)}/served`,
  },
} as const
