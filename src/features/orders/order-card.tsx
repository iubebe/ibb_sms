import { Check, CheckCheck, Loader2, Minus, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { useConfirmOrder } from '@/api/hooks'
import type { StaffOrder, StaffOrderItem } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/format-price'
import { formatTime, formatTimeAgo } from '@/lib/format-time'
import { EditOrderCustomerSheet } from '@/features/customers/edit-order-customer-sheet'
import { OrderCustomerLine } from '@/features/customers/order-customer-line'
import { ORDER_STATUS_LABEL } from '@/features/dashboard/order-status'
import { useServedSync } from './use-served-sync'

interface OrderCardProps {
  order: StaffOrder
  /** Admin/staff: confirm, cancel and mark items served. */
  canManage: boolean
  /** Admin/cashier: take payment. */
  canCheckout: boolean
  onCancel: (order: StaffOrder) => void
  onCheckout: (order: StaffOrder) => void
  onAddItems: (order: StaffOrder) => void
}

export function OrderCard({ order, canManage, canCheckout, onCancel, onCheckout, onAddItems }: OrderCardProps) {
  const confirm = useConfirmOrder()
  const [editingCustomer, setEditingCustomer] = useState(false)
  const isPending = order.status === 'pending_confirmation'
  const isConfirmed = order.status === 'confirmed'
  const hasCustomer = !!(order.customerName || order.customerPhone || order.customerAddress)
  const { draft, errors, setServed } = useServedSync(order.id)
  const servedOf = (item: StaffOrderItem) => draft[item.id] ?? item.servedQuantity
  const unserved = order.items.reduce((sum, i) => sum + i.quantity - servedOf(i), 0)
  const syncing = Object.keys(draft).length > 0

  return (
    <li className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{order.tableName ?? 'Không có bàn'}</p>
          <p className="text-xs text-muted-foreground">
            {formatTime(order.createdAt)} · {formatTimeAgo(order.createdAt)}
          </p>
        </div>
        <Badge variant={isPending ? 'default' : 'secondary'}>{ORDER_STATUS_LABEL[order.status]}</Badge>
      </div>

      <div className="flex items-start gap-1">
        <div className="min-w-0 flex-1">
          <OrderCustomerLine order={order} />
        </div>
        {canManage && (isPending || isConfirmed) && (
          <Button
            variant="ghost"
            size="sm"
            className="min-h-11 shrink-0"
            onClick={() => setEditingCustomer(true)}
          >
            <Pencil />
            {hasCustomer ? 'Sửa khách' : 'Thêm khách'}
          </Button>
        )}
      </div>

      <ul className="flex flex-col gap-2">
        {order.items.map((item) => (
          <OrderLine
            key={item.id}
            item={item}
            served={servedOf(item)}
            syncing={item.id in draft}
            error={errors[item.id]}
            editable={isConfirmed && canManage}
            onChange={(value) => setServed(item.id, value)}
          />
        ))}
      </ul>

      {isConfirmed && canManage && unserved > 0 && (
        <Button
          variant="outline"
          className="min-h-11"
          onClick={() => {
            for (const item of order.items) if (servedOf(item) < item.quantity) setServed(item.id, item.quantity, true)
          }}
        >
          <CheckCheck />
          Đã ra hết ({unserved} phần)
        </Button>
      )}

      <div className="flex items-baseline justify-between border-t pt-3">
        <span className="text-sm text-muted-foreground">
          {isConfirmed && unserved > 0 ? `Còn ${unserved} phần chưa ra` : 'Tổng cộng'}
          {syncing && <Loader2 className="ml-2 inline size-3 animate-spin" aria-label="Đang lưu" />}
        </span>
        <span className="text-lg font-semibold tabular-nums">{formatPrice(order.total)}</span>
      </div>

      {confirm.isError && (
        <p role="alert" className="text-sm text-destructive">
          {confirm.error.message}
        </p>
      )}

      <div className="flex gap-2">
        {canManage && (
          <Button variant="outline" className="min-h-11 flex-1" onClick={() => onCancel(order)}>
            {isPending ? 'Từ chối' : 'Hủy đơn'}
          </Button>
        )}
        {canManage && isPending && (
          <Button className="min-h-11 flex-1" disabled={confirm.isPending} onClick={() => confirm.mutate(order.id)}>
            {confirm.isPending ? <Loader2 className="animate-spin" /> : <Check />}
            Xác nhận
          </Button>
        )}
        {canManage && (isPending || isConfirmed) && (
          <Button variant="outline" className="min-h-11 flex-1" onClick={() => onAddItems(order)}>
            <Plus />
            Thêm món
          </Button>
        )}
        {canCheckout && isConfirmed && (
          <Button className="min-h-11 flex-1" onClick={() => onCheckout(order)}>
            Thanh toán
          </Button>
        )}
      </div>

      <EditOrderCustomerSheet order={order} open={editingCustomer} onClose={() => setEditingCustomer(false)} />
    </li>
  )
}

interface OrderLineProps {
  item: StaffOrderItem
  /** Optimistic served count (may be ahead of the server). */
  served: number
  /** A change is waiting to be saved or in flight. */
  syncing: boolean
  error?: string
  /** Show the − / + stepper for delivered quantity. */
  editable: boolean
  onChange: (servedQuantity: number) => void
}

function OrderLine({ item, served, syncing, error, editable, onChange }: OrderLineProps) {
  const done = served >= item.quantity

  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className={done ? 'truncate text-muted-foreground line-through' : 'truncate font-medium'}>
            {item.quantity}× {item.name}
          </p>
          {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
        </div>
        {editable ? (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="min-h-11 min-w-11"
              aria-label={`Bớt một phần ${item.name} đã ra`}
              disabled={served <= 0}
              onClick={() => onChange(served - 1)}
            >
              <Minus />
            </Button>
            <span
              className={`flex min-w-10 items-center justify-center gap-1 text-sm tabular-nums ${syncing ? 'text-muted-foreground' : ''}`}
            >
              {served}/{item.quantity}
              {syncing && <Loader2 className="size-3 animate-spin" aria-label="Đang lưu" />}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="min-h-11 min-w-11"
              aria-label={`Thêm một phần ${item.name} đã ra`}
              disabled={done}
              onClick={() => onChange(served + 1)}
            >
              <Plus />
            </Button>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground tabular-nums">
            {served}/{item.quantity}
          </span>
        )}
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          Không lưu được, đã hoàn lại: {error}
        </p>
      )}
    </li>
  )
}
