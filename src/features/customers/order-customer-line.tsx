import { MapPin, Phone, User } from 'lucide-react'
import type { StaffOrder } from '@/api/types'

/** Read-only customer info of an order; renders nothing when none was entered. */
export function OrderCustomerLine({ order }: { order: StaffOrder }) {
  const { customerName, customerPhone, customerAddress } = order
  if (!customerName && !customerPhone && !customerAddress) return null
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-muted px-3 py-2 text-sm">
      {(customerName || customerPhone) && (
        <p className="flex min-w-0 items-center gap-2">
          {customerName ? <User className="size-4 shrink-0" /> : <Phone className="size-4 shrink-0" />}
          <span className="min-w-0 wrap-break-word">
            {[customerName, customerPhone].filter(Boolean).join(' · ')}
          </span>
        </p>
      )}
      {customerAddress && (
        <p className="flex min-w-0 items-center gap-2 text-muted-foreground">
          <MapPin className="size-4 shrink-0" />
          <span className="min-w-0 wrap-break-word">{customerAddress}</span>
        </p>
      )}
    </div>
  )
}
