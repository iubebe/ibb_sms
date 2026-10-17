import type { ExpenseCategory, PaymentMethod } from '@/api/types'

export const EXPENSE_CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  rent: 'Mặt bằng',
  electricity: 'Điện',
  water: 'Nước',
  internet: 'Internet',
  gas: 'Gas',
  maintenance: 'Sửa chữa, bảo trì',
  marketing: 'Quảng cáo',
  other: 'Khác',
}

export const EXPENSE_CATEGORY_OPTIONS = Object.keys(EXPENSE_CATEGORY_LABEL) as ExpenseCategory[]

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: 'Tiền mặt',
  qr_manual: 'Chuyển khoản / QR',
}

/** `[from, to)` days (`YYYY-MM-DD`) covering a `YYYY-MM` month. */
export function monthRange(month: string, nextMonth: string) {
  return { from: `${month}-01`, to: `${nextMonth}-01` }
}

/** "2026-10-17" -> "17/10" */
export function formatShortDay(day: string) {
  const [, m, d] = day.split('-')
  return `${Number(d)}/${Number(m)}`
}
