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
  tables: {
    all: ['tables'] as const,
  },
  paymentQrCodes: {
    all: ['paymentQrCodes'] as const,
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
    paymentQrCodes: ['orders', 'paymentQrCodes'] as const,
  },
  staffSchedules: {
    all: ['staffSchedules'] as const,
    byWeek: (weekStartDate: string) => ['staffSchedules', 'byWeek', weekStartDate] as const,
    registrationsByWeek: (weekStartDate: string) => ['staffSchedules', 'registrations', weekStartDate] as const,
    myRegistrations: (weekStartDate: string) => ['staffSchedules', 'myRegistrations', weekStartDate] as const,
    proposalsByWeek: (weekStartDate: string) => ['staffSchedules', 'proposals', weekStartDate] as const,
    myProposals: (weekStartDate: string) => ['staffSchedules', 'myProposals', weekStartDate] as const,
  },
} as const
