import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useCategories, useDeleteCategory } from '@/api/hooks'
import type { Category } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CategoryFormSheet } from './category-form-sheet'
import { ConfirmDeleteDialog } from './confirm-delete-dialog'

type FormTarget = { category: Category | null } | null

export function CategoryPanel() {
  const categories = useCategories()
  const remove = useDeleteCategory()
  const [form, setForm] = useState<FormTarget>(null)
  const [toDelete, setToDelete] = useState<Category | null>(null)

  function closeDelete() {
    setToDelete(null)
    remove.reset()
  }

  return (
    <div className="flex flex-col gap-3">
      <Button className="min-h-11 self-start" onClick={() => setForm({ category: null })}>
        <Plus />
        Thêm danh mục
      </Button>

      {categories.isPending && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      )}

      {categories.isError && (
        <div role="alert" className="flex flex-col items-start gap-2 text-sm">
          <p className="text-destructive">{categories.error.message}</p>
          <Button variant="outline" className="min-h-11" onClick={() => void categories.refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {categories.data?.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">Chưa có danh mục nào.</p>
      )}

      <ul className="flex flex-col gap-2">
        {categories.data?.map((category) => (
          <li
            key={category.id}
            className="flex items-center gap-2 rounded-xl border bg-card p-3 text-card-foreground"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{category.name}</p>
              <p className="text-sm text-muted-foreground">{category.productCount} sản phẩm</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11"
              aria-label={`Sửa ${category.name}`}
              onClick={() => setForm({ category })}
            >
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11 text-destructive"
              aria-label={`Xóa ${category.name}`}
              onClick={() => setToDelete(category)}
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>

      <CategoryFormSheet category={form?.category ?? null} open={!!form} onClose={() => setForm(null)} />

      <ConfirmDeleteDialog
        open={!!toDelete}
        title={`Xóa danh mục "${toDelete?.name ?? ''}"?`}
        description={
          toDelete && toDelete.productCount > 0
            ? `${toDelete.productCount} sản phẩm trong danh mục sẽ chuyển thành "Chưa phân loại". Sản phẩm không bị xóa.`
            : 'Hành động này không thể hoàn tác.'
        }
        pending={remove.isPending}
        error={remove.isError ? remove.error.message : null}
        onClose={closeDelete}
        onConfirm={() => toDelete && remove.mutate(toDelete.id, { onSuccess: closeDelete })}
      />
    </div>
  )
}
