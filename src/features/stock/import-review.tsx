import { Check, Loader2, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { importImageUrl, useConfirmImport, useRejectImport } from '@/api/hooks'
import type { ImportReceipt } from '@/api/types'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from '@/components/currency-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatPrice } from '@/lib/format-price'
import { cn } from '@/lib/utils'
import { parseDecimal } from './stock-labels'

/** Admin: the staff's photo and lines of a pending import; quantities and costs can be corrected and lines removed before confirming. */
export function ImportReview({ receipt }: { receipt: ImportReceipt }) {
  const confirm = useConfirmImport()
  const reject = useRejectImport()
  const [edits, setEdits] = useState(() =>
    receipt.lines.map((l) => ({ quantity: String(l.quantity), unitCost: String(l.unitCost), removed: false })),
  )
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')

  const rows = receipt.lines.map((line, i) => ({
    line,
    index: i,
    edit: edits[i],
    quantity: parseDecimal(edits[i].quantity),
    unitCost: parseDecimal(edits[i].unitCost),
  }))
  const kept = rows.filter((r) => !r.edit.removed)
  const valid = kept.length > 0 && kept.every((r) => r.quantity !== null && r.quantity > 0 && r.unitCost !== null && r.unitCost >= 0)
  const changed =
    valid && (kept.length !== rows.length || kept.some((r) => r.quantity !== r.line.quantity || r.unitCost !== r.line.unitCost))
  const total = kept.reduce((sum, r) => sum + (r.quantity ?? 0) * (r.unitCost ?? 0), 0)

  function patch(index: number, change: Partial<(typeof edits)[number]>) {
    setEdits((current) => current.map((e, i) => (i === index ? { ...e, ...change } : e)))
  }

  const busy = confirm.isPending || reject.isPending
  const error = confirm.error ?? reject.error

  function handleConfirm() {
    confirm.mutate({
      id: receipt.id,
      // Only send lines when something was corrected; otherwise the staff's lines are confirmed as they are.
      ...(changed && {
        lines: kept.map((r) => ({ stockItemId: r.line.stockItemId, quantity: r.quantity!, unitCost: r.unitCost! })),
      }),
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {receipt.hasImage && (
        <a href={importImageUrl(receipt.id)} target="_blank" rel="noreferrer">
          <img src={importImageUrl(receipt.id)} alt={`Ảnh phiếu ${receipt.code}`} className="max-h-72 w-full rounded-lg bg-muted object-contain" />
        </a>
      )}
      <ul className="flex flex-col gap-2">
        {rows.map(({ line, index, edit }) => (
          <li key={`${line.stockItemId}-${index}`} className={cn('flex flex-col gap-2 rounded-lg border p-2', edit.removed && 'opacity-50')}>
            <div className="flex items-center gap-1">
              <span className={cn('min-w-0 flex-1 truncate font-medium', edit.removed && 'line-through')}>{line.name}</span>
              <Button
                type="button"
                variant="ghost"
                className="min-h-11 text-destructive"
                disabled={busy || (!edit.removed && kept.length === 1)}
                onClick={() => patch(index, { removed: !edit.removed })}
              >
                {edit.removed ? 'Khôi phục' : <Trash2 aria-label={`Bỏ dòng ${line.name}`} />}
              </Button>
            </div>
            {!edit.removed && (
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`rv-qty-${receipt.id}-${index}`} className="text-xs">
                    Số lượng ({line.unit})
                  </Label>
                  <Input
                    id={`rv-qty-${receipt.id}-${index}`}
                    inputMode="decimal"
                    autoComplete="off"
                    className="h-11"
                    value={edit.quantity}
                    disabled={busy}
                    onChange={(e) => patch(index, { quantity: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`rv-cost-${receipt.id}-${index}`} className="text-xs">
                    Đơn giá (₫)
                  </Label>
                  <CurrencyInput
                    id={`rv-cost-${receipt.id}-${index}`}
                    allowDecimal
                    autoComplete="off"
                    className="h-11"
                    value={edit.unitCost}
                    disabled={busy}
                    onValueChange={(v) => patch(index, { unitCost: v })}
                  />
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <p className="text-right text-sm text-muted-foreground">
        Tổng tiền <span className="font-semibold text-foreground">{formatPrice(total)}</span>
      </p>

      {rejecting ? (
        <div className="flex flex-col gap-2">
          <Input placeholder="Lý do từ chối" maxLength={200} autoComplete="off" className="h-11" value={reason} disabled={busy} onChange={(e) => setReason(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="min-h-11" disabled={busy} onClick={() => setRejecting(false)}>
              Quay lại
            </Button>
            <Button variant="destructive" className="min-h-11" disabled={busy || !reason.trim()} onClick={() => reject.mutate({ id: receipt.id, reason: reason.trim() })}>
              {reject.isPending && <Loader2 className="animate-spin" />}
              Từ chối
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="min-h-11" disabled={busy} onClick={() => setRejecting(true)}>
            <X />
            Từ chối
          </Button>
          <Button className="min-h-11" disabled={busy || !valid} onClick={handleConfirm}>
            {confirm.isPending ? <Loader2 className="animate-spin" /> : <Check />}
            Xác nhận nhập
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error.message}
        </p>
      )}
    </div>
  )
}
