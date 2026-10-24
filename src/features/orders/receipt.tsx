import { Printer } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { createPortal } from 'react-dom'
import { useBranch, useOrderPaymentQrs } from '@/api/hooks'
import { paymentQrImageUrl } from '@/api/hooks/use-payment-qr-codes'
import type { PaymentMethod, StaffOrder } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { isOnlineTableName } from '@/lib/online-order'

export interface ReceiptPayment {
  method: PaymentMethod
  /** Cash handed over by the customer; cash only. */
  received?: number
  paidAt: Date
}

const METHOD_LABEL: Record<PaymentMethod, string> = { cash: 'Tiền mặt', qr_manual: 'Chuyển khoản' }

const dateTime = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
const day = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
const clock = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })

/** Amounts in the item table are bare numbers ("55.000"); the unit only shows on totals. */
const amount = (value: number) => new Intl.NumberFormat('vi-VN').format(value)
const money = (value: number) => `${amount(value)}đ`

const CELL = 'border border-dashed border-black px-1 py-0.5 align-top'

/** `DD/MM/YYYY (HH:mm - HH:mm)` once paid, else just the order time. */
function orderTime(order: StaffOrder, paidAt?: Date) {
  const created = new Date(order.createdAt)
  return paidAt
    ? `${day.format(created)} (${clock.format(created)} - ${clock.format(paidAt)})`
    : `${day.format(created)} (${clock.format(created)})`
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p>
      <span className="font-bold">{label}:</span> {children}
    </p>
  )
}

/** Thermal-printer friendly bill (80mm). No `payment` = provisional bill, not yet paid. */
export function Receipt({ order, payment }: { order: StaffOrder; payment?: ReceiptPayment }) {
  const branch = useBranch().data
  const qrs = useOrderPaymentQrs(order.id, order.total).data
  const shopName = branch?.name ?? 'Iubebe'
  const address = branch?.address
  const isOnline = isOnlineTableName(order.tableName)
  const change = payment?.method === 'cash' && payment.received ? payment.received - order.total : null
  // Paid bills only carry a QR that can still be scanned for the exact amount; the static image would be noise.
  const qrList = (qrs ?? []).filter((qr) => qr.dynamicPayload || !payment)

  return (
    <div className="mx-auto w-full max-w-[80mm] bg-white p-3 font-sans text-[12px] leading-snug text-black">
      <div className="text-center">
        <p className="text-base font-bold">{shopName}</p>
        {address && <p>{address}</p>}
        <p className="mt-2 text-sm font-bold">{payment ? 'HÓA ĐƠN THANH TOÁN' : 'PHIẾU TẠM TÍNH'}</p>
        <p className="font-bold">Số: {order.id.slice(0, 8).toUpperCase()}</p>
      </div>

      <div className="mt-3 flex flex-col gap-0.5">
        <InfoRow label="Ngày">{orderTime(order, payment?.paidAt)}</InfoRow>
        <InfoRow label="Đơn">{isOnline ? 'Online' : (order.tableName ?? '—')}</InfoRow>
        {order.customerName && <InfoRow label="KH">{order.customerName}</InfoRow>}
        {order.customerPhone && <InfoRow label="SĐT">{order.customerPhone}</InfoRow>}
        {isOnline && order.customerAddress && <InfoRow label="Địa chỉ">{order.customerAddress}</InfoRow>}
        {isOnline && order.deliveryAt && (
          <InfoRow label="Giao lúc">{dateTime.format(new Date(order.deliveryAt))}</InfoRow>
        )}
      </div>

      <table className="mt-2 w-full border-collapse border border-dashed border-black">
        <thead>
          <tr className="font-bold">
            <th className={`${CELL} text-center`}>#</th>
            <th className={`${CELL} text-center`}>Tên món</th>
            <th className={`${CELL} text-center`}>SL</th>
            <th className={`${CELL} text-center`}>ĐG</th>
            <th className={`${CELL} text-center`}>TT</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={item.id}>
              <td className={`${CELL} text-center`}>{index + 1}</td>
              <td className={CELL}>
                {item.name}
                {item.notes && <span className="block italic">* {item.notes}</span>}
              </td>
              <td className={`${CELL} text-right`}>{item.quantity}</td>
              <td className={`${CELL} text-right`}>{amount(item.unitPrice)}</td>
              <td className={`${CELL} text-right`}>{amount(item.quantity * item.unitPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-2 border-b border-black pb-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-bold">Tổng thanh toán</span>
          <span className="text-base font-bold">{money(order.total)}</span>
        </div>
      </div>
      {payment && (
        <div className="mt-0.5 flex flex-col gap-0.5">
          <div className="flex justify-between">
            <span>{METHOD_LABEL[payment.method]}</span>
            <span>{money(order.total)}</span>
          </div>
          {payment.method === 'cash' && payment.received ? (
            <>
              <div className="flex justify-between">
                <span>Khách đưa</span>
                <span>{money(payment.received)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tiền thừa</span>
                <span>{money(Math.max(change ?? 0, 0))}</span>
              </div>
            </>
          ) : null}
        </div>
      )}

      <p className="mt-3 text-center font-bold">Trân trọng cảm ơn!</p>

      {qrList.length > 0 && (
        <ul className="mt-2 flex flex-col items-center gap-3">
          {qrList.map((qr) => (
            <li key={qr.id} className="flex flex-col items-center gap-1 text-center">
              {qr.dynamicPayload ? (
                <QRCodeSVG value={qr.dynamicPayload} level="M" marginSize={1} className="size-[46mm]" />
              ) : (
                <img src={paymentQrImageUrl(qr.id)} alt={qr.label} className="size-[46mm] object-contain" />
              )}
              <p className="font-bold">
                {qr.bank
                  ? [qr.bank.bankName, qr.bank.accountName, qr.bank.accountNo].filter(Boolean).join(' - ')
                  : qr.label}
              </p>
              {!payment && <p>{qr.dynamicPayload ? `Quét mã để chuyển ${money(order.total)}` : 'Quét mã để thanh toán'}</p>}
            </li>
          ))}
        </ul>
      )}
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
        <DialogContent className="flex max-h-[92svh] flex-col gap-4 overflow-hidden">
          <DialogHeader>
            <DialogTitle>{payment ? 'Hóa đơn' : 'Xem trước hóa đơn'}</DialogTitle>
            <DialogDescription>Kiểm tra lại trước khi in.</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-auto rounded-lg border bg-white">
            <Receipt order={order} payment={payment} />
          </div>
          {/* Outside the scroll area, so it stays pinned at the bottom. */}
          <Button type="button" className="min-h-12 w-full shrink-0 text-base" onClick={() => window.print()}>
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
