import { KeyRound, Pencil, Plus, Printer, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useDeleteTable, useRegenerateTableQr, useTables } from '@/api/hooks'
import type { DiningTable } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { PrintQrSheet } from './print-qr-sheet'
import { RegenerateQrDialog } from './regenerate-qr-dialog'
import { TableFormSheet } from './table-form-sheet'

type FormTarget = { table: DiningTable | null } | null

/** Admin only (see `RoleRoute` in `src/router.tsx`). */
export function TablesPage() {
  const tables = useTables()
  const remove = useDeleteTable()
  const regenerate = useRegenerateTableQr()
  const [form, setForm] = useState<FormTarget>(null)
  const [printing, setPrinting] = useState(false)
  const [toDelete, setToDelete] = useState<DiningTable | null>(null)
  const [toRegenerate, setToRegenerate] = useState<DiningTable | null>(null)

  function closeDelete() {
    setToDelete(null)
    remove.reset()
  }

  function closeRegenerate() {
    setToRegenerate(null)
    regenerate.reset()
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Bàn</h2>

      <div className="flex flex-wrap gap-2">
        <Button className="min-h-11" onClick={() => setForm({ table: null })}>
          <Plus />
          Thêm bàn
        </Button>
        <Button
          variant="outline"
          className="min-h-11"
          disabled={!tables.data?.length}
          onClick={() => setPrinting(true)}
        >
          <Printer />
          In mã QR
        </Button>
      </div>

      {tables.isPending && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      )}

      {tables.isError && (
        <div role="alert" className="flex flex-col items-start gap-2 text-sm">
          <p className="text-destructive">{tables.error.message}</p>
          <Button variant="outline" className="min-h-11" onClick={() => void tables.refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {tables.data?.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">Chưa có bàn nào.</p>
      )}

      <ul className="grid gap-2 md:grid-cols-2">
        {tables.data?.map((table) => (
          <li
            key={table.id}
            className="flex items-center gap-1 rounded-xl border bg-card p-3 text-card-foreground"
          >
            <p className="min-w-0 flex-1 truncate font-medium">{table.name}</p>
            <Button
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11"
              aria-label={`Sửa ${table.name}`}
              onClick={() => setForm({ table })}
            >
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11"
              aria-label={`Tạo lại mã QR ${table.name}`}
              onClick={() => setToRegenerate(table)}
            >
              <KeyRound />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11 text-destructive"
              aria-label={`Xóa ${table.name}`}
              onClick={() => setToDelete(table)}
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>

      <TableFormSheet table={form?.table ?? null} open={!!form} onClose={() => setForm(null)} />
      <PrintQrSheet open={printing} onClose={() => setPrinting(false)} />

      <RegenerateQrDialog
        open={!!toRegenerate}
        tableName={toRegenerate?.name ?? ''}
        pending={regenerate.isPending}
        error={regenerate.isError ? regenerate.error.message : null}
        onClose={closeRegenerate}
        onConfirm={() => toRegenerate && regenerate.mutate(toRegenerate.id, { onSuccess: closeRegenerate })}
      />

      <ConfirmDeleteDialog
        open={!!toDelete}
        title={`Xóa "${toDelete?.name ?? ''}"?`}
        description="Mã QR đã in của bàn này sẽ ngừng hoạt động. Các đơn cũ vẫn được giữ lại."
        pending={remove.isPending}
        error={remove.isError ? remove.error.message : null}
        onClose={closeDelete}
        onConfirm={() => toDelete && remove.mutate(toDelete.id, { onSuccess: closeDelete })}
      />
    </section>
  )
}
