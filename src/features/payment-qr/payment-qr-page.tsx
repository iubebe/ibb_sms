import { Loader2, Plus, QrCode } from 'lucide-react'
import { useState } from 'react'
import { useDeletePaymentQrCode, usePaymentQrCodeList } from '@/api/hooks/use-payment-qr-codes'
import type { PaymentQrCode } from '@/api/types'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PaymentQrCard } from './payment-qr-card'
import { PaymentQrFormSheet } from './payment-qr-form-sheet'

type FormTarget = { code: PaymentQrCode | null } | null

export function PaymentQrPage() {
  const codes = usePaymentQrCodeList()
  const remove = useDeletePaymentQrCode()
  const [form, setForm] = useState<FormTarget>(null)
  const [toDelete, setToDelete] = useState<PaymentQrCode | null>(null)

  function closeDelete() {
    setToDelete(null)
    remove.reset()
  }

  const list = codes.data ?? []

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold">Mã QR thanh toán</h2>
          <p className="text-sm text-muted-foreground">Mã đang bật sẽ hiện khi nhân viên chọn chuyển khoản.</p>
        </div>
      </div>

      {codes.isPending ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      ) : codes.isError ? (
        <div role="alert" className="flex flex-col gap-2 text-sm text-destructive">
          <p>Lỗi: {codes.error.message}</p>
          <Button variant="outline" className="min-h-11 w-fit" onClick={() => codes.refetch()}>
            Thử lại
          </Button>
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
          <QrCode className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Chưa có mã QR thanh toán nào.</p>
          <Button className="min-h-11" onClick={() => setForm({ code: null })}>
            Thêm mã QR đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {list.map((code) => (
            <PaymentQrCard
              key={code.id}
              code={code}
              onEdit={() => setForm({ code })}
              onDelete={() => setToDelete(code)}
            />
          ))}
        </div>
      )}

      {codes.isFetching && !codes.isPending && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          Đang cập nhật...
        </p>
      )}

      <PaymentQrFormSheet
        code={form?.code ?? null}
        open={form !== null}
        onClose={() => setForm(null)}
      />

      <ConfirmDeleteDialog
        open={!!toDelete}
        title={`Xóa mã QR "${toDelete?.label ?? ''}"?`}
        description="Ảnh mã QR sẽ bị xóa. Các đơn đã thanh toán không bị ảnh hưởng."
        pending={remove.isPending}
        error={remove.isError ? remove.error.message : null}
        onClose={closeDelete}
        onConfirm={() => toDelete && remove.mutate(toDelete.id, { onSuccess: closeDelete })}
      />
    </section>
  )
}
