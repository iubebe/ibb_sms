import { Pencil, Phone, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useDeleteSupplier, useSuppliers } from '@/api/hooks'
import type { Supplier } from '@/api/types'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SupplierFormSheet } from './supplier-form-sheet'

export function SuppliersPanel() {
  const suppliers = useSuppliers()
  const remove = useDeleteSupplier()
  const [form, setForm] = useState<{ supplier: Supplier | null } | null>(null)
  const [toDelete, setToDelete] = useState<Supplier | null>(null)

  function closeDelete() {
    setToDelete(null)
    remove.reset()
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button className="min-h-11" onClick={() => setForm({ supplier: null })}>
          <Plus />
          Thêm nhà cung cấp
        </Button>
      </div>

      {suppliers.isPending && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      )}

      {suppliers.isError && (
        <div role="alert" className="flex flex-col items-start gap-2 text-sm">
          <p className="text-destructive">{suppliers.error.message}</p>
          <Button variant="outline" className="min-h-11" onClick={() => void suppliers.refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {suppliers.data?.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Chưa có nhà cung cấp nào.</p>}

      <ul className="grid gap-2 md:grid-cols-2">
        {suppliers.data?.map((supplier) => (
          <li key={supplier.id} className="flex items-center gap-1 rounded-xl border bg-card p-3 text-card-foreground">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{supplier.name}</p>
              {supplier.phone && (
                <a href={`tel:${supplier.phone}`} className="flex min-h-6 items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="size-3.5" />
                  {supplier.phone}
                </a>
              )}
              {supplier.note && <p className="truncate text-xs text-muted-foreground">{supplier.note}</p>}
            </div>
            <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label={`Sửa ${supplier.name}`} onClick={() => setForm({ supplier })}>
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11 text-destructive"
              aria-label={`Xóa ${supplier.name}`}
              onClick={() => setToDelete(supplier)}
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>

      <SupplierFormSheet supplier={form?.supplier ?? null} open={!!form} onClose={() => setForm(null)} />
      <ConfirmDeleteDialog
        open={!!toDelete}
        title={`Xóa "${toDelete?.name ?? ''}"?`}
        description="Các phiếu nhập cũ vẫn được giữ lại, chỉ mất liên kết với nhà cung cấp này."
        pending={remove.isPending}
        error={remove.isError ? remove.error.message : null}
        onClose={closeDelete}
        onConfirm={() => toDelete && remove.mutate(toDelete.id, { onSuccess: closeDelete })}
      />
    </div>
  )
}
