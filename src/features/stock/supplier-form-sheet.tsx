import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useCreateSupplier, useUpdateSupplier } from '@/api/hooks'
import type { Supplier } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

interface SupplierFormSheetProps {
  /** `null` = creating a new supplier. */
  supplier: Supplier | null
  open: boolean
  onClose: () => void
}

export function SupplierFormSheet({ supplier, open, onClose }: SupplierFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        {open && <SupplierForm key={supplier?.id ?? 'new'} supplier={supplier} onDone={onClose} />}
      </SheetContent>
    </Sheet>
  )
}

function SupplierForm({ supplier, onDone }: { supplier: Supplier | null; onDone: () => void }) {
  const create = useCreateSupplier()
  const update = useUpdateSupplier()
  const mutation = supplier ? update : create
  const [name, setName] = useState(supplier?.name ?? '')
  const [phone, setPhone] = useState(supplier?.phone ?? '')
  const [note, setNote] = useState(supplier?.note ?? '')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const input = { name: name.trim(), phone: phone.trim(), note: note.trim() }
    if (supplier) update.mutate({ id: supplier.id, input }, { onSuccess: onDone })
    else create.mutate(input, { onSuccess: onDone })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]" noValidate>
      <SheetHeader className="px-0">
        <SheetTitle>{supplier ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}</SheetTitle>
      </SheetHeader>
      <div className="flex flex-col gap-2">
        <Label htmlFor="supplier-name">Tên</Label>
        <Input id="supplier-name" required maxLength={150} autoComplete="off" className="h-11" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="supplier-phone">Điện thoại</Label>
        <Input id="supplier-phone" type="tel" inputMode="tel" maxLength={30} autoComplete="off" className="h-11" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="supplier-note">Ghi chú</Label>
        <Input id="supplier-note" maxLength={200} autoComplete="off" className="h-11" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {mutation.error.message}
        </p>
      )}
      <Button type="submit" className="min-h-11 w-full" disabled={mutation.isPending || !name.trim()}>
        {mutation.isPending && <Loader2 className="animate-spin" />}
        {supplier ? 'Lưu thay đổi' : 'Thêm nhà cung cấp'}
      </Button>
    </form>
  )
}
