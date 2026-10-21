import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useCancelWriteOffProposal, useMyWriteOffs } from '@/api/hooks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime } from '@/lib/format-time'
import { formatQty, WRITE_OFF_CAUSE_LABEL, WRITE_OFF_STATUS_LABEL, WRITE_OFF_STATUS_VARIANT } from './stock-labels'
import { WriteOffSheet } from './write-off-sheet'

/** Staff: propose throwing away spoiled stock and follow what the admin decided. Costs stay admin-only. */
export function WriteOffsPage() {
  const [creating, setCreating] = useState(false)
  const mine = useMyWriteOffs()
  const cancel = useCancelWriteOffProposal()

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Hủy hàng</h2>
        <Button className="min-h-11" onClick={() => setCreating(true)}>
          <Plus />
          Đề xuất hủy
        </Button>
      </div>

      {mine.isPending && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      )}

      {mine.isError && (
        <div role="alert" className="flex flex-col items-start gap-2 text-sm">
          <p className="text-destructive">{mine.error.message}</p>
          <Button variant="outline" className="min-h-11" onClick={() => void mine.refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {mine.data?.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Bạn chưa đề xuất hủy hàng nào.</p>}

      <ul className="flex flex-col gap-2">
        {mine.data?.map((w) => (
          <li key={w.id} className="flex flex-col gap-1 rounded-xl border bg-card p-3 text-card-foreground">
            <div className="flex items-start gap-2">
              <p className="min-w-0 flex-1 truncate font-medium">{w.stockItem.name}</p>
              <Badge variant={WRITE_OFF_STATUS_VARIANT[w.status]}>{WRITE_OFF_STATUS_LABEL[w.status]}</Badge>
            </div>
            <p className="text-sm">
              {formatQty(w.quantity)} {w.stockItem.unit} · {WRITE_OFF_CAUSE_LABEL[w.cause]}
            </p>
            <p className="text-xs text-muted-foreground">{formatDateTime(w.createdAt)}</p>
            {w.note && <p className="text-sm text-muted-foreground">{w.note}</p>}
            {w.status === 'rejected' && w.rejectReason && <p className="text-sm text-destructive">Lý do: {w.rejectReason}</p>}
            {w.status === 'pending' && (
              <Button variant="ghost" className="min-h-11 w-fit px-0 text-destructive" disabled={cancel.isPending} onClick={() => cancel.mutate(w.id)}>
                {cancel.isPending && cancel.variables === w.id ? <Loader2 className="animate-spin" /> : <Trash2 />}
                Rút đề xuất
              </Button>
            )}
          </li>
        ))}
      </ul>
      {cancel.isError && (
        <p role="alert" className="text-sm text-destructive">
          {cancel.error.message}
        </p>
      )}

      <WriteOffSheet open={creating} mode="propose" item={null} onClose={() => setCreating(false)} />
    </section>
  )
}
