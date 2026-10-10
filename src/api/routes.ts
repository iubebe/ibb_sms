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
    image: (id: string) => `/products/${encodeURIComponent(id)}/image`,
  },
  tables: {
    list: '/tables',
    detail: (id: string) => `/tables/${encodeURIComponent(id)}`,
    regenerateQr: (id: string) => `/tables/${encodeURIComponent(id)}/regenerate-qr`,
    qrPdf: '/tables/qr-pdf',
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
    create: '/orders',
    confirm: (orderId: string) => `/orders/${encodeURIComponent(orderId)}/confirm`,
    cancel: (orderId: string) => `/orders/${encodeURIComponent(orderId)}/cancel`,
    pay: (orderId: string) => `/orders/${encodeURIComponent(orderId)}/pay`,
    served: (orderId: string, itemId: string) =>
      `/orders/${encodeURIComponent(orderId)}/items/${encodeURIComponent(itemId)}/served`,
    paymentQrCodes: '/orders/payment-qr-codes',
  },
  staffSchedules: {
    list: (weekStartDate: string) => `/staff-schedules?weekStartDate=${encodeURIComponent(weekStartDate)}`,
    create: '/staff-schedules',
    detail: (id: string) => `/staff-schedules/${encodeURIComponent(id)}`,
    update: (id: string) => `/staff-schedules/${encodeURIComponent(id)}`,
    cancel: (id: string) => `/staff-schedules/${encodeURIComponent(id)}/cancel`,
    register: (id: string) => `/staff-schedules/${encodeURIComponent(id)}/register`,
    registrationsByWeek: (weekStartDate: string) =>
      `/staff-schedules/registrations/by-week/${encodeURIComponent(weekStartDate)}`,
    myRegistrations: (weekStartDate: string) =>
      `/staff-schedules/my-registrations/${encodeURIComponent(weekStartDate)}`,
    approveRegistration: (id: string) => `/staff-schedules/registrations/${encodeURIComponent(id)}/approve`,
    rejectRegistration: (id: string) => `/staff-schedules/registrations/${encodeURIComponent(id)}/reject`,
    proposals: '/staff-schedules/proposals',
    myProposals: (weekStartDate: string) =>
      `/staff-schedules/proposals/mine/${encodeURIComponent(weekStartDate)}`,
    proposalsByWeek: (weekStartDate: string) =>
      `/staff-schedules/proposals/by-week/${encodeURIComponent(weekStartDate)}`,
    approveProposal: (id: string) => `/staff-schedules/proposals/${encodeURIComponent(id)}/approve`,
    rejectProposal: (id: string) => `/staff-schedules/proposals/${encodeURIComponent(id)}/reject`,
    cancelProposal: (id: string) => `/staff-schedules/proposals/${encodeURIComponent(id)}/cancel`,
  },
  paymentQrCodes: {
    list: '/payment-qr-codes',
    create: '/payment-qr-codes',
    update: (id: string) => `/payment-qr-codes/${encodeURIComponent(id)}`,
    image: (id: string) => `/payment-qr-codes/${encodeURIComponent(id)}/image`,
    remove: (id: string) => `/payment-qr-codes/${encodeURIComponent(id)}`,
  },
} as const
