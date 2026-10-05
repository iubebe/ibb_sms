import { useDashboard } from '@/api/hooks'
import type { Dashboard, DashboardRecentOrder } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/format-price'
import { cn } from '@/lib/utils'
import { ORDER_STATUS_LABEL } from './order-status'

const timeFormat = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' })

/** Visible to every role; the revenue section only appears when the backend sends `sales` (admin). */
export function DashboardPage() {
  const dashboard = useDashboard()

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold">Tổng quan hôm nay</h2>
        {dashboard.isFetching && !dashboard.isPending && (
          <span className="text-xs text-muted-foreground">Đang cập nhật…</span>
        )}
      </div>

      {dashboard.isPending && <DashboardSkeleton />}

      {dashboard.isError && (
        <div role="alert" className="flex flex-col items-start gap-2 text-sm">
          <p className="text-destructive">{dashboard.error.message}</p>
          <Button variant="outline" className="min-h-11" onClick={() => void dashboard.refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {dashboard.data && <DashboardContent data={dashboard.data} />}
    </section>
  )
}

function DashboardContent({ data }: { data: Dashboard }) {
  const { queue, sales, recentOrders } = data

  return (
    <>
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">Đơn đang xử lý</h3>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Chờ xác nhận" value={queue.pendingConfirmation} highlight={queue.pendingConfirmation > 0} />
          <Stat label="Đang phục vụ" value={queue.confirmed} />
          <Stat label="Món chưa ra" value={queue.unservedItems} highlight={queue.unservedItems > 0} />
        </div>
      </div>

      {sales && (
        <>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">Doanh thu</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-xl border bg-card p-4 text-card-foreground">
                <p className="text-sm text-muted-foreground">Doanh thu hôm nay</p>
                <p className="text-2xl font-semibold tabular-nums">{formatPrice(sales.revenue)}</p>
              </div>
              <div className="rounded-xl border bg-card p-4 text-card-foreground">
                <p className="text-sm text-muted-foreground">Đơn đã thanh toán</p>
                <p className="text-2xl font-semibold tabular-nums">{sales.paidOrders}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">Bán chạy hôm nay</h3>
            {sales.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có đơn thanh toán nào.</p>
            ) : (
              <ol className="flex flex-col gap-2">
                {sales.topProducts.map((product, index) => (
                  <li
                    key={product.productId}
                    className="flex items-center gap-3 rounded-xl border bg-card p-3 text-card-foreground"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">{product.name}</span>
                    <div className="text-right text-sm">
                      <p className="font-medium tabular-nums">{product.quantity} phần</p>
                      <p className="text-xs text-muted-foreground tabular-nums">{formatPrice(product.revenue)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">Đơn gần đây</h3>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Hôm nay chưa có đơn nào.</p>
        ) : (
          <ul className="flex flex-col gap-2 md:grid md:grid-cols-2">
            {recentOrders.map((order) => (
              <RecentOrder key={order.id} order={order} />
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

function Stat({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-xl border bg-card p-3 text-card-foreground',
        highlight && 'border-primary',
      )}
    >
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function RecentOrder({ order }: { order: DashboardRecentOrder }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border bg-card p-3 text-card-foreground">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{order.tableName ?? 'Không có bàn'}</p>
        <p className="text-xs text-muted-foreground">
          {timeFormat.format(new Date(order.createdAt))} · {order.itemCount} món
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <p className="text-sm font-medium tabular-nums">{formatPrice(order.total)}</p>
        <Badge variant={order.status === 'cancelled' ? 'destructive' : order.status === 'paid' ? 'secondary' : 'default'}>
          {ORDER_STATUS_LABEL[order.status]}
        </Badge>
      </div>
    </li>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="h-16" />
      <Skeleton className="h-16" />
      <Skeleton className="h-16" />
    </div>
  )
}
