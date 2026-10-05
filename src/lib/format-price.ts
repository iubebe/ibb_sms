const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

/** 129000 -> "129.000 ₫" */
export function formatPrice(value: number) {
  return vnd.format(value)
}
