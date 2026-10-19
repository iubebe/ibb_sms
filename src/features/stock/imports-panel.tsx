import { ChevronDown, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useState } from 'react'
import { importImageUrl, useImports } from '@/api/hooks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/format-price'
import { formatDateTime, formatMonth, monthOf, shiftMonth } from '@/lib/format-time'
import { cn } from '@/lib/utils'
import { ImportFormSheet } from './import-form-sheet'
import { ImportReview } from './import-review'
import { formatQty, IMPORT_STATUS_LABEL, IMPORT_STATUS_VARIANT } from './stock-labels'

/** Local-time bounds `[from, to)` of a `YYYY-MM` month, as ISO strings. */
function monthBounds(month: string) {
  const [y, m] = month.split('-').map(Number)
  return { from: new Date(y, m - 1, 1).toISOString(), to: new Date(y, m, 1).toISOString() }
}

/** Import history by month + the "new import" form. */
export function ImportsPanel() {
  const [currentMonth] = useState(() => monthOf(new Date()))
  const [month, setMonth] = useState(currentMonth)
  const [creating, setCreating] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const { from, to } = monthBounds(month)
  const imports = useImports(from, to)
  const confirmed = imports.data?.filter((r) => r.status === 'confirmed') ?? []
  const pendingCount = imports.data?.filter((r) => r.status === 'pending').length ?? 0
  const total = confirmed.reduce((sum, r) => sum + r.totalCost, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button className="min-h-11" onClick={() => setCreating(true)}>
          <Plus />
          Nhập hàng
        </Button>
        <div className="flex items-center gap-1 sm:ml-auto">
          <Button variant="outline" size="icon" className="min-h-11 min-w-11" aria-label="Tháng trước" onClick={() => setMonth(shiftMonth(month, -1))}>
            <ChevronLeft />
          </Button>
          <p className="min-w-32 text-center font-medium" aria-live="polite">
            {formatMonth(month)}
          </p>
          <Button
            variant="outline"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Tháng sau"
            disabled={month >= currentMonth}
            onClick={() => setMonth(shiftMonth(month, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      {imports.data && imports.data.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {confirmed.length} phiếu · tổng chi <span className="font-semibold text-foreground">{formatPrice(total)}</span>
          {pendingCount > 0 && <span className="font-medium text-foreground"> · {pendingCount} phiếu chờ duyệt</span>}
        </p>
      )}

      {imports.isPending && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      )}

      {imports.isError && (
        <div role="alert" className="flex flex-col items-start gap-2 text-sm">
          <p className="text-destructive">{imports.error.message}</p>
          <Button variant="outline" className="min-h-11" onClick={() => void imports.refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {imports.data?.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Chưa có phiếu nhập trong {formatMonth(month).toLowerCase()}.</p>}

      <ul className="flex flex-col gap-2">
        {imports.data?.map((receipt) => {
          const open = openId === receipt.id
          return (
            <li key={receipt.id} className="rounded-xl border bg-card text-card-foreground">
              <button
                type="button"
                className="flex min-h-11 w-full items-center gap-3 p-3 text-left"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : receipt.id)}
              >
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-medium">
                    {receipt.code}
                    {receipt.status !== 'confirmed' && <Badge variant={IMPORT_STATUS_VARIANT[receipt.status]}>{IMPORT_STATUS_LABEL[receipt.status]}</Badge>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatDateTime(receipt.importedAt)} · {receipt.supplier?.name ?? 'Không có NCC'} · {receipt.lines.length} mặt hàng
                  </p>
                </div>
                <p className="font-semibold tabular-nums">{formatPrice(receipt.totalCost)}</p>
                <ChevronDown className={cn('size-4 shrink-0 transition-transform', open && 'rotate-180')} />
              </button>
              {open && (
                <div className="flex flex-col gap-2 border-t p-3 text-sm">
                  {receipt.status === 'pending' ? (
                    <ImportReview receipt={receipt} />
                  ) : (
                    <>
                  {receipt.hasImage && (
                    <a href={importImageUrl(receipt.id)} target="_blank" rel="noreferrer">
                      <img src={importImageUrl(receipt.id)} alt={`Ảnh phiếu ${receipt.code}`} className="max-h-48 rounded-lg bg-muted object-contain" />
                    </a>
                  )}
                  <ul className="flex flex-col gap-1">
                    {receipt.lines.map((line, i) => (
                      <li key={`${line.stockItemId}-${i}`} className="flex items-baseline gap-2">
                        <span className="min-w-0 flex-1 truncate">{line.name}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {formatQty(line.quantity)} {line.unit} × {formatPrice(line.unitCost)}
                        </span>
                        <span className="w-24 text-right tabular-nums">{formatPrice(line.lineTotal)}</span>
                      </li>
                    ))}
                  </ul>
                  {receipt.status === 'rejected' && receipt.rejectReason && <p className="text-destructive">Lý do từ chối: {receipt.rejectReason}</p>}
                    </>
                  )}
                  {receipt.note && <p className="text-muted-foreground">Ghi chú: {receipt.note}</p>}
                  {receipt.createdByName && <p className="text-xs text-muted-foreground">Người lập: {receipt.createdByName}</p>}
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <ImportFormSheet open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}
