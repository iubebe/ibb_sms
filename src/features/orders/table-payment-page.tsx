import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useTables } from '@/api/hooks/use-tables'
import { useOrders } from '@/api/hooks/use-orders'
import type { StaffOrder } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/format-price'
import { CheckoutSheet } from './checkout-sheet'
import { OrderCard } from './order-card'

export function TablePaymentPage() {
  const tables = useTables()
  const confirmed = useOrders('confirmed')
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [checkoutTarget, setCheckoutTarget] = useState<StaffOrder | null>(null)

  const selectedTableName = tables.data?.find((t) => t.id === selectedTableId)?.name
  const ordersForTable =
    selectedTableId && confirmed.data
      ? confirmed.data.filter((order) => order.tableId === selectedTableId)
      : []
  const tableTotal = ordersForTable.reduce((sum, order) => sum + order.total, 0)

  const cardProps = {
    canManage: false,
    canCheckout: true,
    onCancel: () => {},
    onCheckout: setCheckoutTarget,
  }

  if (tables.isPending || confirmed.isPending) {
    return (
      <div className="grid grid-cols-1 gap-3">
        <Skeleton className="h-12" />
        <Skeleton className="h-40" />
      </div>
    )
  }

  if (tables.isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-2 text-sm">
        <p className="text-destructive">{tables.error.message}</p>
        <Button variant="outline" className="min-h-11" onClick={() => void tables.refetch()}>
          Thử lại
        </Button>
      </div>
    )
  }

  // Get tables that have confirmed orders
  const tablesWithOrders = confirmed.data ? new Set(confirmed.data.map((o) => o.tableId)) : new Set()
  const availableTables = tables.data?.filter((t) => tablesWithOrders.has(t.id)) ?? []

  if (selectedTableId && selectedTableName) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="min-h-9 w-9 px-0"
            onClick={() => {
              setSelectedTableId(null)
              setCheckoutTarget(null)
            }}
          >
            ←
          </Button>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{selectedTableName}</h3>
            <p className="text-sm text-muted-foreground">{ordersForTable.length} đơn hàng</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Tổng cộng</p>
            <p className="text-2xl font-semibold">{formatPrice(tableTotal)}</p>
          </div>
        </div>

        {ordersForTable.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có đơn hàng cho bàn này.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3">
            {ordersForTable.map((order) => (
              <OrderCard key={order.id} order={order} {...cardProps} />
            ))}
          </ul>
        )}

        <CheckoutSheet order={checkoutTarget} onClose={() => setCheckoutTarget(null)} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {availableTables.length === 0 ? (
        <p className="text-sm text-muted-foreground">Không có bàn nào có đơn hàng chờ thanh toán.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {availableTables.map((table) => {
            const count = confirmed.data?.filter((o) => o.tableId === table.id).length ?? 0
            const total = confirmed.data?.reduce(
              (sum, o) => (o.tableId === table.id ? sum + o.total : sum),
              0,
            ) ?? 0
            return (
              <li key={table.id}>
                <Button
                  variant="outline"
                  className="h-auto w-full justify-between px-4 py-3 text-left"
                  onClick={() => setSelectedTableId(table.id)}
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{table.name}</p>
                    <p className="text-xs text-muted-foreground">{count} đơn hàng</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatPrice(total)}</p>
                    </div>
                    <ChevronRight className="size-4" />
                  </div>
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
