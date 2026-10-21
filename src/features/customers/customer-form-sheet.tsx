import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useUpdateCustomer } from '@/api/hooks'
import type { Customer } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CustomerFields } from './customer-fields'
import { isValidPhone, toNullable, type CustomerFormValues } from './customer-form-values'

interface CustomerFormSheetProps {
  customer: Customer | null
  onClose: () => void
}

/** Admin edit of a customer record. Orders keep the info they were placed with. */
export function CustomerFormSheet({ customer, onClose }: CustomerFormSheetProps) {
  return (
    <Sheet open={customer !== null} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        {customer && <CustomerForm key={customer.id} customer={customer} onDone={onClose} />}
      </SheetContent>
    </Sheet>
  )
}

function CustomerForm({ customer, onDone }: { customer: Customer; onDone: () => void }) {
  const update = useUpdateCustomer()
  const [values, setValues] = useState<CustomerFormValues>({
    name: customer.name ?? '',
    phone: customer.phone ?? '',
    address: customer.address ?? '',
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    update.mutate(
      {
        id: customer.id,
        input: {
          name: toNullable(values.name),
          phone: toNullable(values.phone),
          address: toNullable(values.address),
        },
      },
      { onSuccess: onDone },
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      noValidate
    >
      <SheetHeader className="px-0">
        <SheetTitle>Sửa khách hàng</SheetTitle>
        <SheetDescription>Các đơn cũ vẫn giữ thông tin khách tại thời điểm đặt.</SheetDescription>
      </SheetHeader>
      <CustomerFields idPrefix="customer" values={values} onChange={setValues} />
      {update.isError && (
        <p role="alert" className="text-sm text-destructive">
          {update.error.message}
        </p>
      )}
      <Button type="submit" className="min-h-11 w-full" disabled={update.isPending || !isValidPhone(values.phone)}>
        {update.isPending && <Loader2 className="animate-spin" />}
        Lưu thay đổi
      </Button>
    </form>
  )
}
