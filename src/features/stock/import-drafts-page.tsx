import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { importImageUrl, useCancelImportDraft, useMyImports } from '@/api/hooks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime } from '@/lib/format-time'
import { ImportDraftFormSheet } from './import-draft-form-sheet'
import { formatQty, IMPORT_STATUS_LABEL, IMPORT_STATUS_VARIANT } from './stock-labels'

/** Staff: their import drafts and what the admin decided. Costs and stock levels stay admin-only. */
export function ImportDraftsPage() {
  const [creating, setCreating] = useState(false)
  const mine = useMyImports()
  const cancel = useCancelImportDraft()

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Nhập hàng</h2>
        <Button className="min-h-11" onClick={() => setCreating(true)}>
          <Plus />
          Tạo phiếu nháp
        </Button>
      </div>

      {mine.isPending && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
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

      {mine.data?.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Bạn chưa tạo phiếu nhập nào.</p>}

      <ul className="flex flex-col gap-2">
        {mine.data?.map((receipt) => (
          <li key={receipt.id} className="flex gap-3 rounded-xl border bg-card p-3 text-card-foreground">
            {receipt.hasImage && (
              <a href={importImageUrl(receipt.id)} target="_blank" rel="noreferrer" className="shrink-0">
                <img src={importImageUrl(receipt.id)} alt={`Ảnh phiếu ${receipt.code}`} className="size-20 rounded-lg bg-muted object-cover" />
              </a>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{receipt.code}</p>
                <Badge variant={IMPORT_STATUS_VARIANT[receipt.status]}>{IMPORT_STATUS_LABEL[receipt.status]}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(receipt.importedAt)} · {receipt.supplier?.name ?? 'Không có NCC'}
              </p>
              <p className="truncate text-sm">{receipt.lines.map((l) => `${l.name} ${formatQty(l.quantity)} ${l.unit}`).join(', ')}</p>
              {receipt.status === 'rejected' && receipt.rejectReason && <p className="text-sm text-destructive">Lý do: {receipt.rejectReason}</p>}
              {receipt.status === 'pending' && (
                <Button
                  variant="ghost"
                  className="min-h-11 w-fit px-0 text-destructive"
                  disabled={cancel.isPending}
                  onClick={() => cancel.mutate(receipt.id)}
                >
                  {cancel.isPending && cancel.variables === receipt.id ? <Loader2 className="animate-spin" /> : <Trash2 />}
                  Hủy phiếu
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {cancel.isError && (
        <p role="alert" className="text-sm text-destructive">
          {cancel.error.message}
        </p>
      )}

      <ImportDraftFormSheet open={creating} onClose={() => setCreating(false)} />
    </section>
  )
}
