import { useBreakEven } from '@/api/hooks'
import type { BreakEven } from '@/api/types'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/format-price'
import { cn } from '@/lib/utils'

/** Operating break-even and the suggested KPIs of the month. */
export function BreakEvenSection({ from, to }: { from: string; to: string }) {
  const query = useBreakEven(from, to)
  if (query.isPending) return <Skeleton className="h-48" />
  if (query.isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {query.error.message}
      </p>
    )
  }
  return <BreakEvenCards data={query.data} />
}

const dash = '—'
const money = (value: number | null) => (value === null ? dash : formatPrice(value))
const count = (value: number | null) => (value === null ? dash : value.toLocaleString('vi-VN'))

function BreakEvenCards({ data }: { data: BreakEven }) {
  const { kpi } = data
  const reached = data.breakEvenRevenue !== null && data.revenue >= data.breakEvenRevenue
  const progress = Math.min(100, data.breakEvenProgressPercent ?? 0)
  const targetProgress = kpi.targetRevenue ? Math.min(100, Math.round((data.revenue / kpi.targetRevenue) * 100)) : null

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Hòa vốn tháng">
        {data.breakEvenRevenue === null ? (
          <p className="text-sm text-muted-foreground">Chưa tính được: cần có doanh thu và nhập hàng thấp hơn doanh thu.</p>
        ) : (
          <>
            <div>
              <p className="text-xs text-muted-foreground">Doanh thu hòa vốn</p>
              <p className="text-lg font-semibold tabular-nums">{formatPrice(data.breakEvenRevenue)}</p>
            </div>
            <Progress percent={progress} label={`${data.breakEvenProgressPercent}% · đã ${formatPrice(data.revenue)}`} done={reached} />
            <p className={cn('text-sm', reached ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground')}>
              {reached ? 'Đã vượt hòa vốn.' : `Còn thiếu ${formatPrice(data.breakEvenRevenue - data.revenue)} để hòa vốn.`}
            </p>
          </>
        )}
        <Rows
          rows={[
            ['Chi phí cố định (vận hành + lương)', formatPrice(data.fixedCost)],
            ['Tỷ lệ lãi gộp', data.contributionMarginRatio === null ? dash : `${Math.round(data.contributionMarginRatio * 100)}%`],
            ['Hòa vốn / ngày', money(data.breakEvenRevenuePerDay)],
            ['Đơn hòa vốn / ngày', count(data.breakEvenOrdersPerDay)],
            ['Giá trị đơn trung bình', money(data.avgOrderValue)],
          ]}
        />
      </Card>

      <Card title="KPI gợi ý tháng này">
        {kpi.targetRevenue === null ? (
          <p className="text-sm text-muted-foreground">Chưa tính được KPI vì chưa tính được hòa vốn.</p>
        ) : (
          <>
            <div>
              <p className="text-xs text-muted-foreground">Doanh thu mục tiêu</p>
              <p className="text-lg font-semibold tabular-nums">{formatPrice(kpi.targetRevenue)}</p>
            </div>
            {targetProgress !== null && <Progress percent={targetProgress} label={`${targetProgress}% mục tiêu`} done={targetProgress >= 100} />}
          </>
        )}
        <Rows
          rows={[
            ['Doanh thu / ngày', money(kpi.targetRevenuePerDay)],
            ['Số đơn', count(kpi.targetOrders)],
            ['Số đơn / ngày', count(kpi.targetOrdersPerDay)],
            ['Lợi nhuận', formatPrice(kpi.targetProfit)],
            ['Trần chi phí nhập hàng', money(kpi.maxImportCost)],
          ]}
        />
        <p className="text-xs text-muted-foreground">
          {kpi.totalInvested > 0
            ? `Lợi nhuận mục tiêu = vốn đầu tư ${formatPrice(kpi.totalInvested)} / ${kpi.paybackTargetMonths} tháng.`
            : 'Chưa có vốn đầu tư nên lợi nhuận mục tiêu là 0 (mục tiêu = hòa vốn).'}{' '}
          Chi phí cố định tính theo phần đã phát sinh, nên giữa tháng con số còn thấp.
        </p>
      </Card>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 text-card-foreground">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </div>
  )
}

function Rows({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="flex flex-col divide-y text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-baseline justify-between gap-3 py-1.5">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-medium tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Progress({ percent, label, done }: { percent: number; label: string; done: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="h-2 rounded-full bg-muted" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={cn('h-full rounded-full', done ? 'bg-emerald-600' : 'bg-primary')} style={{ width: `${percent}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
