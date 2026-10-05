import { useState } from 'react'
import { useMe, useOrders } from '@/api/hooks'
import type { OrderStatus, StaffOrder } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CancelOrderDialog } from './cancel-order-dialog'
import { CheckoutSheet } from './checkout-sheet'
import { OrderCard } from './order-card'

/**
 * Order control. Admin/staff confirm, cancel and serve; admin/cashier check out.
 * Cashiers only see confirmed orders (nothing to do on the others).
 */
export function OrdersPage() {
  const { data: me } = useMe()
  const role = me?.role
  const canManage = role === 'admin' || role === 'staff'
  const canCheckout = role === 'admin' || role === 'cashier'

  const [cancelTarget, setCancelTarget] = useState<StaffOrder | null>(null)
  const [checkoutTarget, setCheckoutTarget] = useState<StaffOrder | null>(null)

  const pending = useOrders('pending_confirmation')
  const confirmed = useOrders('confirmed')

  const cardProps = { canManage, canCheckout, onCancel: setCancelTarget, onCheckout: setCheckoutTarget }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Đơn hàng</h2>

      <Tabs defaultValue={canManage ? 'pending_confirmation' : 'confirmed'}>
        <TabsList className="w-full md:w-fit">
          {canManage && (
            <TabsTrigger value="pending_confirmation" className="min-h-5 flex-1 md:px-6">
              Chờ xác nhận{pending.data?.length ? ` (${pending.data.length})` : ''}
            </TabsTrigger>
          )}
          <TabsTrigger value="confirmed" className="min-h-5 flex-1 md:px-6">
            {canManage ? 'Đang phục vụ' : 'Chờ thanh toán'}
            {confirmed.data?.length ? ` (${confirmed.data.length})` : ''}
          </TabsTrigger>
        </TabsList>

        {canManage && (
          <TabsContent value="pending_confirmation" className="pt-3">
            <OrderList query={pending} status="pending_confirmation" {...cardProps} />
          </TabsContent>
        )}
        <TabsContent value="confirmed" className="pt-3">
          <OrderList query={confirmed} status="confirmed" {...cardProps} />
        </TabsContent>
      </Tabs>

      <CancelOrderDialog order={cancelTarget} onClose={() => setCancelTarget(null)} />
      <CheckoutSheet order={checkoutTarget} onClose={() => setCheckoutTarget(null)} />
    </section>
  )
}

const EMPTY_TEXT: Partial<Record<OrderStatus, string>> = {
  pending_confirmation: 'Không có đơn nào đang chờ xác nhận.',
  confirmed: 'Không có đơn nào đang phục vụ.',
}

interface OrderListProps {
  query: ReturnType<typeof useOrders>
  status: OrderStatus
  canManage: boolean
  canCheckout: boolean
  onCancel: (order: StaffOrder) => void
  onCheckout: (order: StaffOrder) => void
}

function OrderList({ query, status, ...cardProps }: OrderListProps) {
  if (query.isPending) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    )
  }
  if (query.isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-2 text-sm">
        <p className="text-destructive">{query.error.message}</p>
        <Button variant="outline" className="min-h-11" onClick={() => void query.refetch()}>
          Thử lại
        </Button>
      </div>
    )
  }
  if (query.data.length === 0) {
    return <p className="text-sm text-muted-foreground">{EMPTY_TEXT[status]}</p>
  }
  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {query.data.map((order) => (
        <OrderCard key={order.id} order={order} {...cardProps} />
      ))}
    </ul>
  )
}
