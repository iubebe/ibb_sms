import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAdjustStockItem, useStockMovements } from '@/api/hooks'
import type { StockItem } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime } from '@/lib/format-time'
import { cn } from '@/lib/utils'
import { formatQty, parseDecimal } from './stock-labels'

interface StockAdjustSheetProps {
  /** `null` = closed. */
  item: StockItem | null
  onClose: () => void
}

/** Stocktake / waste correction plus the item's recent stock history. */
export function StockAdjustSheet({ item, onClose }: StockAdjustSheetProps) {
  return (
    <Sheet open={!!item} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        {item && <AdjustForm key={item.id} item={item} onDone={onClose} />}
      </SheetContent>
    </Sheet>
  )
}

function AdjustForm({ item, onDone }: { item: StockItem; onDone: () => void }) {
  const adjust = useAdjustStockItem()
  const movements = useStockMovements(item.id)
  const [mode, setMode] = useState<'set' | 'delta'>('set')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const parsed = parseDecimal(amount)
  // "set" = the counted quantity; the change is what it differs from the book value.
  const change = parsed === null ? null : mode === 'set' ? Math.round((parsed - item.quantity) * 1000) / 1000 : parsed
  const resulting = change === null ? null : Math.round((item.quantity + change) * 1000) / 1000
  const error =
    parsed === null ? null : mode === 'set' && parsed < 0 ? 'Số đếm không thể âm.' : resulting! < 0 ? 'Tồn kho không thể âm.' : null
  const valid = change !== null && change !== 0 && !error && note.trim() !== ''

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!valid || change === null) return
    adjust.mutate({ id: item.id, change, note: note.trim() }, { onSuccess: onDone })
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <SheetHeader className="px-0">
        <SheetTitle>Điều chỉnh: {item.name}</SheetTitle>
        <SheetDescription>
          Tồn hiện tại {formatQty(item.quantity)} {item.unit}. Dùng khi kiểm kê hoặc hao hụt; nhập hàng mới hãy tạo phiếu nhập.
        </SheetDescription>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Cách điều chỉnh">
          <Button type="button" variant={mode === 'set' ? 'default' : 'outline'} className="min-h-11" aria-pressed={mode === 'set'} onClick={() => setMode('set')}>
            Số đếm thực tế
          </Button>
          <Button type="button" variant={mode === 'delta' ? 'default' : 'outline'} className="min-h-11" aria-pressed={mode === 'delta'} onClick={() => setMode('delta')}>
            Cộng / trừ
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="adjust-amount">{mode === 'set' ? `Số lượng thực tế (${item.unit})` : `Thay đổi (${item.unit}, âm để trừ)`}</Label>
          <Input
            id="adjust-amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder={mode === 'set' ? '0' : '-1,5'}
            className="h-11"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={!!error}
          />
          <p className={cn('text-sm', error ? 'text-destructive' : 'text-muted-foreground')}>
            {error ?? (change === null ? 'Nhập số, dùng dấu , hoặc . cho phần lẻ.' : `Thay đổi ${change > 0 ? '+' : ''}${formatQty(change)} → còn ${formatQty(resulting!)} ${item.unit}`)}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="adjust-note">Lý do</Label>
          <Input
            id="adjust-note"
            maxLength={200}
            autoComplete="off"
            placeholder="Kiểm kê cuối tuần, hỏng, đổ vỡ..."
            className="h-11"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {adjust.isError && (
          <p role="alert" className="text-sm text-destructive">
            {adjust.error.message}
          </p>
        )}
        <Button type="submit" className="min-h-11 w-full" disabled={adjust.isPending || !valid}>
          {adjust.isPending && <Loader2 className="animate-spin" />}
          Lưu điều chỉnh
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Lịch sử gần đây</h3>
        {movements.isPending && <Skeleton className="h-12" />}
        {movements.isError && <p className="text-sm text-destructive">{movements.error.message}</p>}
        {movements.data?.length === 0 && <p className="text-sm text-muted-foreground">Chưa có biến động nào.</p>}
        <ul className="flex flex-col divide-y rounded-xl border">
          {movements.data?.map((m) => (
            <li key={m.id} className="flex items-center gap-3 p-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate">
                  {m.reason === 'import'
                    ? `Nhập hàng ${m.receiptCode ?? ''}`
                    : m.reason === 'write_off'
                      ? `Hủy hàng${m.note ? `: ${m.note}` : ''}`
                      : `Điều chỉnh${m.note ? `: ${m.note}` : ''}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(m.createdAt)}
                  {m.createdByName && ` · ${m.createdByName}`}
                </p>
              </div>
              <div className="text-right tabular-nums">
                <p className={cn('font-medium', m.change < 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400')}>
                  {m.change > 0 ? '+' : ''}
                  {formatQty(m.change)}
                </p>
                <p className="text-xs text-muted-foreground">còn {formatQty(m.quantityAfter)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
