import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useCreateCategory, useUpdateCategory } from '@/api/hooks'
import type { Category } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

interface CategoryFormSheetProps {
  /** `null` = creating a new category. */
  category: Category | null
  open: boolean
  onClose: () => void
}

export function CategoryFormSheet({ category, open, onClose }: CategoryFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        {/* Remount per target so the form starts from the right values. */}
        {open && <CategoryForm key={category?.id ?? 'new'} category={category} onDone={onClose} />}
      </SheetContent>
    </Sheet>
  )
}

function CategoryForm({ category, onDone }: { category: Category | null; onDone: () => void }) {
  const create = useCreateCategory()
  const update = useUpdateCategory()
  const mutation = category ? update : create
  const [name, setName] = useState(category?.name ?? '')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const input = { name: name.trim() }
    if (category) update.mutate({ id: category.id, input }, { onSuccess: onDone })
    else create.mutate(input, { onSuccess: onDone })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]" noValidate>
      <SheetHeader className="px-0">
        <SheetTitle>{category ? 'Sửa danh mục' : 'Thêm danh mục'}</SheetTitle>
        <SheetDescription>Tên danh mục hiển thị trên thực đơn của khách.</SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-2">
        <Label htmlFor="category-name">Tên danh mục</Label>
        <Input
          id="category-name"
          required
          maxLength={100}
          autoComplete="off"
          className="h-11"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={mutation.isError}
        />
      </div>
      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {mutation.error.message}
        </p>
      )}
      <Button type="submit" className="min-h-11 w-full" disabled={mutation.isPending || !name.trim()}>
        {mutation.isPending && <Loader2 className="animate-spin" />}
        {category ? 'Lưu thay đổi' : 'Thêm danh mục'}
      </Button>
    </form>
  )
}
