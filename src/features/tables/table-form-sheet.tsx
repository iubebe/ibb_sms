import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useCreateTable, useUpdateTable } from '@/api/hooks'
import type { DiningTable } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

interface TableFormSheetProps {
  /** `null` = creating a new table. */
  table: DiningTable | null
  open: boolean
  onClose: () => void
}

export function TableFormSheet({ table, open, onClose }: TableFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        {open && <TableForm key={table?.id ?? 'new'} table={table} onDone={onClose} />}
      </SheetContent>
    </Sheet>
  )
}

function TableForm({ table, onDone }: { table: DiningTable | null; onDone: () => void }) {
  const create = useCreateTable()
  const update = useUpdateTable()
  const mutation = table ? update : create
  const [name, setName] = useState(table?.name ?? '')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const input = { name: name.trim() }
    if (table) update.mutate({ id: table.id, input }, { onSuccess: onDone })
    else create.mutate(input, { onSuccess: onDone })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]" noValidate>
      <SheetHeader className="px-0">
        <SheetTitle>{table ? 'Sửa bàn' : 'Thêm bàn'}</SheetTitle>
        <SheetDescription>
          {table ? 'Đổi tên không làm thay đổi mã QR đã in.' : 'Mã QR được tạo tự động cho mỗi bàn.'}
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-2">
        <Label htmlFor="table-name">Tên bàn</Label>
        <Input
          id="table-name"
          required
          maxLength={100}
          autoComplete="off"
          placeholder="Bàn 1"
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
        {table ? 'Lưu thay đổi' : 'Thêm bàn'}
      </Button>
    </form>
  )
}
