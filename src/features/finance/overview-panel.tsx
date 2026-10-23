import { TriangleAlert } from 'lucide-react'
import { useFinanceSummary } from '@/api/hooks'
import type { FinanceSummary } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/format-price'
import { formatMonth } from '@/lib/format-time'
import { cn } from '@/lib/utils'
import { BreakEvenSection } from './break-even-section'
import { EXPENSE_CATEGORY_LABEL, PAYMENT_METHOD_LABEL, formatShortDay } from './finance-labels'

/** Month figures: revenue, costs (imports, salary, operating) and profit. */
export function OverviewPanel({ from, to, month }: { from: string; to: string; month: string }) {
  const summary = useFinanceSummary(from, to)

  if (summary.isPending) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-40" />
      </div>
    )
  }
  if (summary.isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-2 text-sm">
        <p className="text-destructive">{summary.error.message}</p>
        <Button variant="outline" className="min-h-11" onClick={() => void summary.refetch()}>
          Thử lại
        </Button>
      </div>
    )
  }
  return <Overview data={summary.data} month={month} from={from} to={to} />
}

function Overview({ data, month, from, to }: { data: FinanceSummary; month: string; from: string; to: string }) {
  const { totals } = data
  const profitable = totals.profit >= 0
  const costRows = [
    { label: 'Nhập hàng', value: totals.importCost },
    { label: 'Lương (ước tính)', value: totals.salaryCost },
    { label: 'Vận hành', value: totals.operatingCost },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        <Tile label="Doanh thu" value={formatPrice(totals.revenue)} hint={`${totals.paidOrders} đơn đã thanh toán`} />
        <Tile label="Tổng chi" value={formatPrice(totals.totalCost)} hint="Nhập hàng + lương + vận hành" />
        <Tile
          label="Lợi nhuận"
          value={formatPrice(totals.profit)}
          hint={totals.revenue > 0 ? `${Math.round((totals.profit / totals.revenue) * 100)}% doanh thu` : undefined}
          valueClassName={profitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}
          className="col-span-2 md:col-span-1"
        />
        {totals.writeOffLoss > 0 && (
          <Tile
            label="Hao hụt / hủy hàng"
            value={formatPrice(totals.writeOffLoss)}
            hint="Hàng hỏng, hết hạn đã hủy; đã nằm trong tiền nhập hàng nên không cộng thêm vào tổng chi"
            valueClassName="text-destructive"
            className="col-span-2 md:col-span-3"
          />
        )}
      </div>

      {data.staffWithoutRate > 0 && (
        <p role="status" className="flex items-start gap-2 rounded-xl border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          {data.staffWithoutRate} nhân viên đã làm việc nhưng chưa có lương theo giờ, nên lương đang bị tính thiếu. Đặt ở Nhân sự → Sửa tài khoản.
        </p>
      )}

      <BreakEvenSection from={from} to={to} />

      <Section title="Chi phí theo nhóm">
        <ul className="flex flex-col gap-3">
          {costRows.map((row) => (
            <Bar key={row.label} label={row.label} value={row.value} max={totals.totalCost} />
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          Nhập hàng tính theo tiền đã chi trong tháng (không phải giá vốn hàng bán). Lương = giờ làm đã check-out × lương giờ.
        </p>
      </Section>

      <Section title={`Theo ngày · ${formatMonth(month)}`}>
        <DailyChart days={data.daily} />
      </Section>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Doanh thu theo hình thức">
          {data.revenueByMethod.length === 0 ? (
            <Empty />
          ) : (
            <ul className="flex flex-col gap-3">
              {data.revenueByMethod.map((row) => (
                <Bar key={row.method ?? 'none'} label={row.method ? PAYMENT_METHOD_LABEL[row.method] : 'Không rõ'} value={row.amount} max={totals.revenue} />
              ))}
            </ul>
          )}
        </Section>

        <Section title="Chi phí vận hành">
          {data.expensesByCategory.length === 0 ? (
            <Empty />
          ) : (
            <ul className="flex flex-col gap-3">
              {data.expensesByCategory.map((row) => (
                <Bar key={row.category} label={EXPENSE_CATEGORY_LABEL[row.category]} value={row.amount} max={totals.operatingCost} />
              ))}
            </ul>
          )}
        </Section>
      </div>

      <Section title="Lương theo nhân viên">
        {data.salary.length === 0 ? (
          <Empty text="Chưa có ca làm đã check-out." />
        ) : (
          <ul className="flex flex-col divide-y">
            {data.salary.map((line) => (
              <li key={line.userId} className="flex items-baseline gap-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{line.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {line.hours} giờ · {line.hourlyRate === null ? 'chưa đặt lương giờ' : `${formatPrice(line.hourlyRate)}/giờ`}
                  </p>
                </div>
                <p className="font-semibold tabular-nums">{line.hourlyRate === null ? '—' : formatPrice(line.amount)}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}

function Tile({
  label,
  value,
  hint,
  valueClassName,
  className,
}: {
  label: string
  value: string
  hint?: string
  valueClassName?: string
  className?: string
}) {
  return (
    <div className={cn('rounded-xl border bg-card p-3 text-card-foreground', className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-lg font-semibold tabular-nums', valueClassName)}>{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 text-card-foreground">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </div>
  )
}

function Empty({ text = 'Chưa có dữ liệu.' }: { text?: string }) {
  return <p className="py-2 text-sm text-muted-foreground">{text}</p>
}

/** One labelled horizontal bar, as a share of `max`. */
function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const share = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span>{label}</span>
        <span className="tabular-nums">
          {formatPrice(value)} <span className="text-xs text-muted-foreground">({share}%)</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted" role="presentation">
        <div className="h-full rounded-full bg-primary" style={{ width: `${share}%` }} />
      </div>
    </li>
  )
}

/** Revenue vs total cost per day; the table below is the accessible/precise view. */
function DailyChart({ days }: { days: FinanceSummary['daily'] }) {
  const costOf = (d: FinanceSummary['daily'][number]) => d.importCost + d.operatingCost + d.salaryCost
  const max = Math.max(1, ...days.map((d) => Math.max(d.revenue, costOf(d))))
  const active = days.filter((d) => d.revenue > 0 || costOf(d) > 0)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-sm bg-primary" /> Doanh thu
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-sm bg-destructive/70" /> Chi
        </span>
      </div>
      <div className="flex h-32 items-end gap-px" role="img" aria-label="Biểu đồ doanh thu và chi phí theo ngày">
        {days.map((d) => (
          <div key={d.date} className="flex h-full min-w-0 flex-1 items-end gap-px" title={`${formatShortDay(d.date)}: thu ${formatPrice(d.revenue)}, chi ${formatPrice(costOf(d))}`}>
            <div className="flex-1 rounded-t-sm bg-primary" style={{ height: `${(d.revenue / max) * 100}%` }} />
            <div className="flex-1 rounded-t-sm bg-destructive/70" style={{ height: `${(costOf(d) / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatShortDay(days[0].date)}</span>
        <span>{formatShortDay(days[days.length - 1].date)}</span>
      </div>

      {active.length > 0 && (
        <details className="text-sm">
          <summary className="flex min-h-11 cursor-pointer items-center font-medium">Chi tiết từng ngày ({active.length})</summary>
          <ul className="flex flex-col divide-y">
            {[...active].reverse().map((d) => (
              <li key={d.date} className="flex items-baseline gap-3 py-2">
                <span className="w-12 shrink-0 text-muted-foreground">{formatShortDay(d.date)}</span>
                <span className="flex-1 tabular-nums">Thu {formatPrice(d.revenue)}</span>
                <span className="flex-1 text-right tabular-nums">Chi {formatPrice(costOf(d))}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
