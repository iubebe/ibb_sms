import type { OrderStatus } from '@/api/types'

/** Central query key factory. Add one entry per resource: all/list/detail. */
export const queryKeys = {
  health: ['health'] as const,
  auth: {
    me: ['auth', 'me'] as const,
  },
  dashboard: ['dashboard'] as const,
  categories: {
    all: ['categories'] as const,
  },
  products: {
    all: ['products'] as const,
  },
  users: {
    all: ['users'] as const,
  },
  attendance: {
    all: ['attendance'] as const,
    me: ['attendance', 'me'] as const,
    report: (month: string) => ['attendance', 'report', month] as const,
    list: (month: string, userId?: string) => ['attendance', 'list', month, userId ?? 'all'] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: (status?: OrderStatus) => ['orders', 'list', status ?? 'all'] as const,
  },
} as const
