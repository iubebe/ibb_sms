import { Printer } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useBranch } from '@/api/hooks'
import type { PaymentMethod, StaffOrder } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatPrice } from '@/lib/format-price'
import { isOnlineTableName } from '@/lib/online-order'

export interface ReceiptPayment {
  method: PaymentMethod
  /** Cash handed over by the customer; cash only. */
  received?: number
  paidAt: Date
}

const METHOD_LABEL: Record<PaymentMethod, string> = { cash: 'Tiền mặt', qr_manual: 'Chuyển khoản' }

const dateTime = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' })

/** Thermal-printer friendly bill (80mm). No `payment` = provisional bill, not yet paid. */
export function Receipt({ order, payment }: { order: StaffOrder; payment?: ReceiptPayment }) {
  const branch = useBranch().data
  const shopName = branch?.name ?? 'Iubebe'
  const address = branch?.address
  const isOnline = isOnlineTableName(order.tableName)
  const change = payment?.method === 'cash' && payment.received ? payment.received - order.total : null

  return (
    <div className="mx-auto w-full max-w-[80mm] bg-white p-3 font-mono text-[12px] leading-snug text-black">
      <p className="text-center text-base font-bold">{shopName}</p>
      {address && <p className="text-center">{address}</p>}
      <p className="text-center font-semibold">{payment ? 'HÓA ĐƠN THANH TOÁN' : 'PHIẾU TẠM TÍNH'}</p>
      <hr className="my-2 border-dashed border-black" />
      <div className="flex justify-between">
        <span>{isOnline ? 'Đơn online' : `Bàn: ${order.tableName ?? '—'}`}</span>
        <span>#{order.id.slice(0, 8).toUpperCase()}</span>
      </div>
      {isOnline && (
        <div className="mt-0.5">
          {order.customerName && <p>Khách: {order.customerName}</p>}
          {order.customerPhone && <p>SĐT: {order.customerPhone}</p>}
          {order.customerAddress && <p>Địa chỉ: {order.customerAddress}</p>}
          {order.deliveryAt && <p className="font-semibold">Giao lúc: {dateTime.format(new Date(order.deliveryAt))}</p>}
        </div>
      )}
      <p>Giờ: {dateTime.format(payment?.paidAt ?? new Date(order.createdAt))}</p>
      <hr className="my-2 border-dashed border-black" />
      <ul className="flex flex-col gap-1">
        {order.items.map((item) => (
          <li key={item.id}>
            <p className="font-semibold">{item.name}</p>
            <div className="flex justify-between">
              <span>
                {item.quantity} × {formatPrice(item.unitPrice)}
              </span>
              <span>{formatPrice(item.quantity * item.unitPrice)}</span>
            </div>
            {item.notes && <p className="italic">* {item.notes}</p>}
          </li>
        ))}
      </ul>
      <hr className="my-2 border-dashed border-black" />
      <div className="flex justify-between text-sm font-bold">
        <span>TỔNG CỘNG</span>
        <span>{formatPrice(order.total)}</span>
      </div>
      {payment && (
        <div className="mt-1 flex flex-col gap-0.5">
          <div className="flex justify-between">
            <span>Thanh toán</span>
            <span>{METHOD_LABEL[payment.method]}</span>
          </div>
          {payment.method === 'cash' && payment.received ? (
            <>
              <div className="flex justify-between">
                <span>Khách đưa</span>
                <span>{formatPrice(payment.received)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tiền thừa</span>
                <span>{formatPrice(Math.max(change ?? 0, 0))}</span>
              </div>
            </>
          ) : null}
        </div>
      )}
      <hr className="my-2 border-dashed border-black" />
      <p className="text-center">Cảm ơn quý khách!</p>
    </div>
  )
}

interface ReceiptDialogProps {
  order: StaffOrder
  payment?: ReceiptPayment
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Preview of the bill with a Print button. A second copy lives in `#receipt-print` on <body>;
 * the print stylesheet in index.css hides everything else so only the bill reaches the printer.
 */
export function ReceiptDialog({ order, payment, open, onOpenChange }: ReceiptDialogProps) {
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{payment ? 'Hóa đơn' : 'Xem trước hóa đơn'}</DialogTitle>
            <DialogDescription>Kiểm tra lại trước khi in.</DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <Receipt order={order} payment={payment} />
          </div>
          <Button type="button" className="min-h-12 w-full text-base" onClick={() => window.print()}>
            <Printer /> In hóa đơn
          </Button>
        </DialogContent>
      </Dialog>
      {open && createPortal(
        <div id="receipt-print" className="hidden">
          <Receipt order={order} payment={payment} />
        </div>,
        document.body,
      )}
    </>
  )
}
