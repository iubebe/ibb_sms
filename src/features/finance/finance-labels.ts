import type { ExpenseCategory, InvestmentCategory, PaymentMethod } from '@/api/types'

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

export const INVESTMENT_CATEGORY_LABEL: Record<InvestmentCategory, string> = {
  renovation: 'Thi công, cải tạo',
  equipment: 'Máy móc, thiết bị',
  furniture: 'Bàn ghế, nội thất',
  technology: 'Công nghệ, phần mềm',
  deposit: 'Đặt cọc',
  other: 'Khác',
}

export const INVESTMENT_CATEGORY_OPTIONS = Object.keys(INVESTMENT_CATEGORY_LABEL) as InvestmentCategory[]

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
