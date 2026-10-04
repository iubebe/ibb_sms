import type { OrderStatus } from '@/api/types'

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_confirmation: 'Chờ xác nhận',
  confirmed: 'Đang phục vụ',
  paid: 'Đã thanh toán',
  cancelled: 'Đã hủy',
}
