import { Check, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { useConfirmWriteOff, useRejectWriteOff } from '@/api/hooks'
import type { WriteOff } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDateTime } from '@/lib/format-time'
import { formatQty, parseDecimal, WRITE_OFF_CAUSE_LABEL } from './stock-labels'

/** Admin: a staff proposal; the quantity can be corrected before confirming, or the proposal rejected with a reason. */
export function WriteOffReview({ writeOff }: { writeOff: WriteOff }) {
  const confirm = useConfirmWriteOff()
  const reject = useRejectWriteOff()
  const [amount, setAmount] = useState(String(writeOff.quantity))
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')

  const quantity = parseDecimal(amount)
  const valid = quantity !== null && quantity > 0
  const busy = confirm.isPending || reject.isPending
  const error = confirm.error ?? reject.error
  const { stockItem } = writeOff

  return (
    <li className="flex flex-col gap-3 rounded-xl border bg-card p-3 text-card-foreground">
      <div className="min-w-0">
        <p className="truncate font-medium">{stockItem.name}</p>
        <p className="text-xs text-muted-foreground">
          {WRITE_OFF_CAUSE_LABEL[writeOff.cause]} · {formatDateTime(writeOff.createdAt)}
          {writeOff.createdByName && ` · ${writeOff.createdByName}`}
        </p>
        {writeOff.note && <p className="mt-1 text-sm">{writeOff.note}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor={`wo-review-${writeOff.id}`} className="text-xs">
          Số lượng hủy ({stockItem.unit}), đề xuất {formatQty(writeOff.quantity)}
        </Label>
        <Input
          id={`wo-review-${writeOff.id}`}
          inputMode="decimal"
          autoComplete="off"
          className="h-11"
          value={amount}
          disabled={busy}
          onChange={(e) => setAmount(e.target.value)}
          aria-invalid={quantity !== null && quantity <= 0}
        />
      </div>

      {rejecting ? (
        <div className="flex flex-col gap-2">
          <Input placeholder="Lý do từ chối" maxLength={200} autoComplete="off" className="h-11" value={reason} disabled={busy} onChange={(e) => setReason(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="min-h-11" disabled={busy} onClick={() => setRejecting(false)}>
              Quay lại
            </Button>
            <Button variant="destructive" className="min-h-11" disabled={busy || !reason.trim()} onClick={() => reject.mutate({ id: writeOff.id, reason: reason.trim() })}>
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
          <Button
            className="min-h-11"
            disabled={busy || !valid}
            onClick={() => confirm.mutate({ id: writeOff.id, ...(quantity !== writeOff.quantity && { quantity: quantity! }) })}
          >
            {confirm.isPending ? <Loader2 className="animate-spin" /> : <Check />}
            Duyệt hủy
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error.message}
        </p>
      )}
    </li>
  )
}
