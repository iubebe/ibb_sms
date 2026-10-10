import { Banknote, Loader2, QrCode, TriangleAlert } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { usePayOrder, usePaymentQrCodes } from '@/api/hooks'
import type { PaymentMethod, StaffOrder } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { formatPrice } from '@/lib/format-price'

const BILLS = [50_000, 100_000, 200_000, 500_000]

interface CheckoutSheetProps {
  /** `null` = closed. */
  order: StaffOrder | null
  onClose: () => void
}

/** Staff/Cashier checkout: pick cash (with change) or a manual QR transfer, then mark the order paid. */
export function CheckoutSheet({ order, onClose }: CheckoutSheetProps) {
  return (
    <Sheet open={order !== null} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        {/* Remount per order so the form starts clean. */}
        {order && <CheckoutForm key={order.id} order={order} onDone={onClose} />}
      </SheetContent>
    </Sheet>
  )
}

function CheckoutForm({ order, onDone }: { order: StaffOrder; onDone: () => void }) {
  const pay = usePayOrder()
  const { data: qrCodes } = usePaymentQrCodes()
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [received, setReceived] = useState('')
  const [isPending, setIsPending] = useState(false)

  const receivedAmount = Number(received) || 0
  const change = receivedAmount - order.total
  const unserved = order.items.reduce((sum, i) => sum + i.quantity - i.servedQuantity, 0)
  // Offer the bills that cover the total, so the cashier taps instead of typing.
  const quickAmounts = [order.total, ...BILLS.filter((b) => b > order.total).slice(0, 3)]
  const isCash = method === 'cash'
  const validCash = receivedAmount >= order.total
  const valid = !isCash || validCash

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (isCash && validCash) {
      // Cash: auto-verify immediately
      setIsPending(true)
      pay.mutate({ orderId: order.id, paymentMethod: 'cash' }, { onSuccess: onDone })
    } else if (!isCash) {
      // QR: mark as paid and close (customer already paid)
      setIsPending(true)
      pay.mutate({ orderId: order.id, paymentMethod: 'qr_manual' }, { onSuccess: onDone })
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <SheetHeader className="px-0">
        <SheetTitle>Thanh toán · {order.tableName ?? 'Không có bàn'}</SheetTitle>
        <SheetDescription>{order.items.length} món cần thanh toán</SheetDescription>
      </SheetHeader>

      <p className="text-3xl font-semibold tabular-nums">{formatPrice(order.total)}</p>

      {unserved > 0 && (
        <p className="flex items-start gap-2 rounded-lg border p-3 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          Còn {unserved} phần chưa ra bàn. Bạn vẫn có thể thanh toán.
        </p>
      )}

      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Phương thức thanh toán">
        <Button
          type="button"
          variant={method === 'cash' ? 'default' : 'outline'}
          aria-pressed={method === 'cash'}
          className="min-h-11"
          onClick={() => setMethod('cash')}
        >
          <Banknote /> Tiền mặt
        </Button>
        <Button
          type="button"
          variant={method === 'qr_manual' ? 'default' : 'outline'}
          aria-pressed={method === 'qr_manual'}
          className="min-h-11"
          onClick={() => setMethod('qr_manual')}
        >
          <QrCode /> Chuyển khoản
        </Button>
      </div>

      {isCash ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="received">Khách đưa (₫)</Label>
            <Input
              id="received"
              className="min-h-11 text-base"
              inputMode="numeric"
              autoComplete="off"
              placeholder="0"
              value={received}
              onChange={(e) => setReceived(e.target.value.replace(/\D/g, '').slice(0, 10))}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((amount, index) => (
              <Button
                key={amount}
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() => setReceived(String(amount))}
              >
                {index === 0 ? 'Đủ tiền' : formatPrice(amount)}
              </Button>
            ))}
          </div>
          <div className="flex items-baseline justify-between rounded-lg border p-3">
            <span className="text-sm text-muted-foreground">Tiền thừa</span>
            <span className="text-lg font-semibold tabular-nums">
              {receivedAmount > 0 && change >= 0 ? formatPrice(change) : '—'}
            </span>
          </div>
          {receivedAmount > 0 && change < 0 && (
            <p className="text-sm text-destructive">Còn thiếu {formatPrice(-change)}.</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {qrCodes && qrCodes.length > 0 ? (
            <>
              <div className="flex flex-col gap-2">
                {qrCodes.map((qr) => (
                  <div key={qr.id} className="flex flex-col items-center gap-2 rounded-lg border p-3">
                    <img src={qr.imagePath} alt={qr.label} className="h-48 w-48 object-contain" />
                    <p className="text-sm font-medium">{qr.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Thanh toán <strong>{formatPrice(order.total)}</strong> rồi nhấn xác nhận.
              </p>
            </>
          ) : (
            <p className="rounded-lg border p-3 text-center text-sm text-muted-foreground">
              Chưa có mã QR thanh toán. Liên hệ quản lý để thiết lập.
            </p>
          )}
        </div>
      )}

      {pay.isError && (
        <p role="alert" className="text-sm text-destructive">
          {pay.error.message}
        </p>
      )}

      <Button type="submit" className="min-h-12 w-full text-base" disabled={!valid || pay.isPending || isPending}>
        {(pay.isPending || isPending) && <Loader2 className="animate-spin" />}
        {isCash ? 'Xác nhận thanh toán tiền mặt' : 'Khách đã thanh toán'}
      </Button>
    </form>
  )
}
