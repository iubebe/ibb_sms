import type { OrderStatus } from '@/api/types'

/** Central query key factory. Add one entry per resource: all/list/detail. */
export const queryKeys = {
  health: ['health'] as const,
  auth: {
    me: ['auth', 'me'] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
  products: {
    all: ['products'] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: (status?: OrderStatus) => ['orders', 'list', status ?? 'all'] as const,
  },
} as const
