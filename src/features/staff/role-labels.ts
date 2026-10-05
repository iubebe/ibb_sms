import type { UserRole } from '@/api/types'

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Quản trị',
  staff: 'Nhân viên',
  cashier: 'Thu ngân',
}

export const ROLE_OPTIONS: UserRole[] = ['staff', 'cashier', 'admin']
