import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useAtRiskItems, usePendingWriteOffs, useWriteOffs } from '@/api/hooks'
import type { AtRiskItem, WriteOffCause } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/format-price'
import { formatDateTime } from '@/lib/format-time'
import { formatQty, STOCK_KIND_LABEL, WRITE_OFF_CAUSE_LABEL, WRITE_OFF_STATUS_LABEL, WRITE_OFF_STATUS_VARIANT } from './stock-labels'
import { WriteOffReview } from './write-off-review'
import { WriteOffSheet, type WriteOffTarget } from './write-off-sheet'

const HISTORY_DAYS = 30

/** Last `HISTORY_DAYS` days as ISO bounds `[from, to)` (to = start of tomorrow). */
function historyBounds() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const to = new Date(today)
  to.setDate(to.getDate() + 1)
  const from = new Date(today)
  from.setDate(from.getDate() - HISTORY_DAYS)
  return { from: from.toISOString(), to: to.toISOString() }
}

interface SheetState {
  item: WriteOffTarget | null
  cause?: WriteOffCause
}

/** Admin: staff proposals to review, stock at risk of spoiling, and what was already written off. */
export function WriteOffsPanel() {
  const [{ from, to }] = useState(historyBounds)
  const atRisk = useAtRiskItems()
  const pending = usePendingWriteOffs()
  const history = useWriteOffs(from, to)
  const [sheet, setSheet] = useState<SheetState | null>(null)

  const done = history.data?.filter((w) => w.status === 'confirmed') ?? []
  const loss = done.reduce((sum, w) => sum + (w.totalCost ?? 0), 0)

  function writeOff(item: AtRiskItem) {
    setSheet({
      item: { id: item.id, name: item.name, unit: item.unit, quantity: item.quantity },
      cause: item.expired ? 'expired' : 'spoiled',
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Button className="min-h-11 w-fit" variant="outline" onClick={() => setSheet({ item: null })}>
        <Trash2 />
        Hủy hàng
      </Button>

      {pending.data && pending.data.length > 0 && (
        <section className="flex flex-col gap-2" aria-label="Đề xuất chờ duyệt">
          <h3 className="text-sm font-semibold">Đề xuất chờ duyệt ({pending.data.length})</h3>
          <ul className="grid gap-2 md:grid-cols-2">
            {pending.data.map((w) => (
              <WriteOffReview key={w.id} writeOff={w} />
            ))}
          </ul>
        </section>
      )}
      {pending.isError && <p className="text-sm text-destructive">{pending.error.message}</p>}

      <section className="flex flex-col gap-2" aria-label="Hàng có nguy cơ hỏng hoặc ế">
        <div>
          <h3 className="text-sm font-semibold">Nguy cơ hỏng / ế</h3>
          <p className="text-xs text-muted-foreground">
            Hết hạn tính từ lần nhập gần nhất + hạn dùng của mặt hàng; ế là 14 ngày không xuất hay nhập.
          </p>
        </div>
        {atRisk.isPending && (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        )}
        {atRisk.isError && (
          <div role="alert" className="flex flex-col items-start gap-2 text-sm">
            <p className="text-destructive">{atRisk.error.message}</p>
            <Button variant="outline" className="min-h-11" onClick={() => void atRisk.refetch()}>
              Thử lại
            </Button>
          </div>
        )}
        {atRisk.data?.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Không có mặt hàng nào đáng lo.</p>}
        <ul className="grid gap-2 md:grid-cols-2">
          {atRisk.data?.map((item) => (
            <li key={item.id} className="flex flex-col gap-2 rounded-xl border bg-card p-3 text-card-foreground">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge variant="outline">{STOCK_KIND_LABEL[item.kind]}</Badge>
                    {item.expired && <Badge variant="destructive">Hết hạn</Badge>}
                    {item.expiringSoon && <Badge variant="secondary">Sắp hết hạn</Badge>}
                    {item.stale && <Badge variant="secondary">Ế {item.idleDays} ngày</Badge>}
                  </div>
                </div>
                <p className="text-right">
                  <span className="text-2xl font-semibold tabular-nums">{formatQty(item.quantity)}</span>{' '}
                  <span className="text-sm text-muted-foreground">{item.unit}</span>
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {item.lastUnitCost !== null ? `Giá trị ${formatPrice(item.value)}` : 'Chưa có giá nhập'}
                {item.estimatedExpiryAt && ` · Hạn dự kiến ${formatDateTime(item.estimatedExpiryAt)}`}
                {item.shelfLifeDays === null && ' · Chưa đặt hạn dùng'}
              </p>
              <Button variant="outline" className="min-h-11" onClick={() => writeOff(item)}>
                <Trash2 />
                Hủy hàng
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-2" aria-label="Lịch sử hủy hàng">
        <h3 className="text-sm font-semibold">Đã hủy trong {HISTORY_DAYS} ngày qua</h3>
        {history.data && done.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {done.length} lần hủy · thiệt hại <span className="font-semibold text-foreground">{formatPrice(loss)}</span>
          </p>
        )}
        {history.isPending && <Skeleton className="h-16" />}
        {history.isError && <p className="text-sm text-destructive">{history.error.message}</p>}
        {history.data?.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Chưa có lần hủy hàng nào.</p>}
        <ul className="flex flex-col gap-2">
          {history.data?.map((w) => (
            <li key={w.id} className="flex items-start gap-3 rounded-xl border bg-card p-3 text-card-foreground">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {w.stockItem.name}
                  {w.status !== 'confirmed' && <Badge variant={WRITE_OFF_STATUS_VARIANT[w.status]}>{WRITE_OFF_STATUS_LABEL[w.status]}</Badge>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {WRITE_OFF_CAUSE_LABEL[w.cause]} · {formatDateTime(w.writtenOffAt ?? w.createdAt)}
                  {w.createdByName && ` · ${w.createdByName}`}
                </p>
                {w.note && <p className="text-sm text-muted-foreground">{w.note}</p>}
                {w.status === 'rejected' && w.rejectReason && <p className="text-sm text-destructive">Lý do: {w.rejectReason}</p>}
              </div>
              <div className="text-right tabular-nums">
                <p className="font-medium">
                  −{formatQty(w.quantity)} {w.stockItem.unit}
                </p>
                {w.status === 'confirmed' && w.totalCost !== null && <p className="text-xs text-destructive">{formatPrice(w.totalCost)}</p>}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <WriteOffSheet open={!!sheet} mode="direct" item={sheet?.item ?? null} defaultCause={sheet?.cause} onClose={() => setSheet(null)} />
    </div>
  )
}
