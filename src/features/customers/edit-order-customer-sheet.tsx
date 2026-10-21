import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useUpdateOrderCustomer } from '@/api/hooks'
import type { StaffOrder } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CustomerFields } from './customer-fields'
import { isValidPhone, toNullable, type CustomerFormValues } from './customer-form-values'

interface EditOrderCustomerSheetProps {
  order: StaffOrder
  open: boolean
  onClose: () => void
}

/** Edit customer name / phone / address of an order that is not paid yet. */
export function EditOrderCustomerSheet({ order, open, onClose }: EditOrderCustomerSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        {open && <EditForm order={order} onDone={onClose} />}
      </SheetContent>
    </Sheet>
  )
}

function EditForm({ order, onDone }: { order: StaffOrder; onDone: () => void }) {
  const update = useUpdateOrderCustomer()
  const [values, setValues] = useState<CustomerFormValues>({
    name: order.customerName ?? '',
    phone: order.customerPhone ?? '',
    address: order.customerAddress ?? '',
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    update.mutate(
      {
        orderId: order.id,
        input: {
          customerName: toNullable(values.name),
          customerPhone: toNullable(values.phone),
          customerAddress: toNullable(values.address),
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
        <SheetTitle>Thông tin khách · {order.tableName ?? 'Không có bàn'}</SheetTitle>
        <SheetDescription>Chỉ sửa được khi đơn chưa thanh toán.</SheetDescription>
      </SheetHeader>
      <CustomerFields idPrefix="edit-order" values={values} onChange={setValues} />
      {update.isError && (
        <p role="alert" className="text-sm text-destructive">
          {update.error.message}
        </p>
      )}
      <Button type="submit" className="min-h-11 w-full" disabled={update.isPending || !isValidPhone(values.phone)}>
        {update.isPending && <Loader2 className="animate-spin" />}
        Lưu thông tin
      </Button>
    </form>
  )
}
