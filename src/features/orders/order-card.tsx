import { Check, Loader2, Minus, Plus } from 'lucide-react'
import { useConfirmOrder, useSetServed } from '@/api/hooks'
import type { StaffOrder, StaffOrderItem } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/format-price'
import { formatTime, formatTimeAgo } from '@/lib/format-time'
import { ORDER_STATUS_LABEL } from '@/features/dashboard/order-status'

interface OrderCardProps {
  order: StaffOrder
  /** Admin/staff: confirm, cancel and mark items served. */
  canManage: boolean
  /** Admin/cashier: take payment. */
  canCheckout: boolean
  onCancel: (order: StaffOrder) => void
  onCheckout: (order: StaffOrder) => void
}

export function OrderCard({ order, canManage, canCheckout, onCancel, onCheckout }: OrderCardProps) {
  const confirm = useConfirmOrder()
  const isPending = order.status === 'pending_confirmation'
  const isConfirmed = order.status === 'confirmed'
  const unserved = order.items.reduce((sum, i) => sum + i.quantity - i.servedQuantity, 0)

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

      <ul className="flex flex-col gap-2">
        {order.items.map((item) => (
          <OrderLine key={item.id} orderId={order.id} item={item} editable={isConfirmed && canManage} />
        ))}
      </ul>

      <div className="flex items-baseline justify-between border-t pt-3">
        <span className="text-sm text-muted-foreground">
          {isConfirmed && unserved > 0 ? `Còn ${unserved} phần chưa ra` : 'Tổng cộng'}
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
        {canCheckout && isConfirmed && (
          <Button className="min-h-11 flex-1" onClick={() => onCheckout(order)}>
            Thanh toán
          </Button>
        )}
      </div>
    </li>
  )
}

interface OrderLineProps {
  orderId: string
  item: StaffOrderItem
  /** Show the − / + stepper for delivered quantity. */
  editable: boolean
}

function OrderLine({ orderId, item, editable }: OrderLineProps) {
  const setServed = useSetServed()
  const done = item.servedQuantity >= item.quantity

  function step(delta: number) {
    setServed.mutate({ orderId, itemId: item.id, servedQuantity: item.servedQuantity + delta })
  }

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
              disabled={setServed.isPending || item.servedQuantity <= 0}
              onClick={() => step(-1)}
            >
              <Minus />
            </Button>
            <span className="min-w-10 text-center text-sm tabular-nums">
              {item.servedQuantity}/{item.quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="min-h-11 min-w-11"
              aria-label={`Thêm một phần ${item.name} đã ra`}
              disabled={setServed.isPending || done}
              onClick={() => step(1)}
            >
              <Plus />
            </Button>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground tabular-nums">
            {item.servedQuantity}/{item.quantity}
          </span>
        )}
      </div>
      {setServed.isError && (
        <p role="alert" className="text-xs text-destructive">
          {setServed.error.message}
        </p>
      )}
    </li>
  )
}
