import type { StockItemKind } from '@/api/types'

export const STOCK_KIND_LABEL: Record<StockItemKind, string> = {
  goods: 'Hàng hóa',
  material: 'Nguyên liệu',
}

const qty = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 })

/** 2.5 -> "2,5" (up to 3 decimals, no trailing zeros). */
export const formatQty = (value: number) => qty.format(value)

/** Form text ("2,5" or "2.5") -> number; `null` when blank or not a number. */
export function parseDecimal(text: string) {
  const trimmed = text.trim().replace(',', '.')
  if (!trimmed) return null
  const value = Number(trimmed)
  return Number.isFinite(value) ? value : null
}
