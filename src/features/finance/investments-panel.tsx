import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useDeleteInvestment, useRoi } from '@/api/hooks'
import type { Investment, RoiSummary } from '@/api/types'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/format-price'
import { formatMonth, monthOf } from '@/lib/format-time'
import { cn } from '@/lib/utils'
import { INVESTMENT_CATEGORY_LABEL } from './finance-labels'
import { InvestmentFormSheet } from './investment-form-sheet'

/** Capital investments and the shop's ROI for the selected month. */
export function InvestmentsPanel({ from, to, month }: { from: string; to: string; month: string }) {
  const roi = useRoi(from, to)
  const remove = useDeleteInvestment()
  const [form, setForm] = useState<{ investment: Investment | null; day: string } | null>(null)
  const [toDelete, setToDelete] = useState<Investment | null>(null)

  /** A new investment defaults to today when viewing this month, else the month's first day. */
  function defaultDay() {
    const today = new Date()
    return monthOf(today) === month ? `${month}-${String(today.getDate()).padStart(2, '0')}` : from
  }

  function closeDelete() {
    setToDelete(null)
    remove.reset()
  }

  return (
    <div className="flex flex-col gap-4">
      <Button className="min-h-11 self-start" onClick={() => setForm({ investment: null, day: defaultDay() })}>
        <Plus />
        Thêm khoản đầu tư
      </Button>

      {roi.isPending && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-16" />
        </div>
      )}

      {roi.isError && (
        <div role="alert" className="flex flex-col items-start gap-2 text-sm">
          <p className="text-destructive">{roi.error.message}</p>
          <Button variant="outline" className="min-h-11" onClick={() => void roi.refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {roi.data && (
        <>
          <RoiTiles data={roi.data} month={month} />
          {roi.data.items.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Chưa có khoản đầu tư đến hết {formatMonth(month).toLowerCase()}.</p>}
          <ul className="flex flex-col gap-2">
            {roi.data.items.map((item) => (
              <li key={item.id} className="flex items-center gap-2 rounded-xl border bg-card p-3 text-card-foreground">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {INVESTMENT_CATEGORY_LABEL[item.category]} · {formatDate(item.investedOn)} · {item.sharePercent}% vốn
                    {item.note ? ` · ${item.note}` : ''}
                  </p>
                </div>
                <p className="font-semibold tabular-nums">{formatPrice(item.amount)}</p>
                <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label="Sửa" onClick={() => setForm({ investment: item, day: item.investedOn })}>
                  <Pencil />
                </Button>
                <Button variant="ghost" size="icon" className="min-h-11 min-w-11 text-destructive" aria-label="Xóa" onClick={() => setToDelete(item)}>
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}

      <InvestmentFormSheet investment={form?.investment ?? null} open={!!form} defaultDay={form?.day ?? from} onClose={() => setForm(null)} />
      <ConfirmDeleteDialog
        open={!!toDelete}
        title={`Xóa khoản đầu tư ${toDelete?.name ?? ''}?`}
        description="Khoản đầu tư sẽ bị xóa khỏi vốn và ROI."
        pending={remove.isPending}
        error={remove.isError ? remove.error.message : null}
        onClose={closeDelete}
        onConfirm={() => toDelete && remove.mutate(toDelete.id, { onSuccess: closeDelete })}
      />
    </div>
  )
}

/** "2026-10-17" -> "17/10/2026" */
function formatDate(day: string) {
  return day.split('-').reverse().join('/')
}

function RoiTiles({ data, month }: { data: RoiSummary; month: string }) {
  const positive = (data.roiPercent ?? 0) >= 0
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Tile label="Vốn đầu tư" value={formatPrice(data.totalInvested)} hint={`${formatPrice(data.investedInRange)} trong tháng`} />
        <Tile label={`Lợi nhuận ${formatMonth(month).toLowerCase()}`} value={formatPrice(data.profit)} valueClassName={data.profit >= 0 ? undefined : 'text-destructive'} />
        <Tile
          label="ROI tháng"
          value={data.roiPercent === null ? '—' : `${data.roiPercent}%`}
          hint={data.roiPercent === null ? 'Chưa có vốn đầu tư' : undefined}
          valueClassName={data.roiPercent === null ? undefined : positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}
        />
        <Tile label="Hoàn vốn sau" value={data.paybackMonths === null ? '—' : `${data.paybackMonths} tháng`} hint={data.paybackMonths === null ? 'Chưa có lãi' : undefined} />
      </div>
      <p className="text-xs text-muted-foreground">
        ROI = lợi nhuận của tháng / vốn đã đầu tư đến hết tháng. Lợi nhuận tính cho cả cửa hàng, không chia theo từng hạng mục; hoàn vốn ước tính theo lợi nhuận tháng này quy ra 30 ngày.
      </p>
    </div>
  )
}

function Tile({ label, value, hint, valueClassName }: { label: string; value: string; hint?: string; valueClassName?: string }) {
  return (
    <div className="rounded-xl border bg-card p-3 text-card-foreground">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-lg font-semibold tabular-nums', valueClassName)}>{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
