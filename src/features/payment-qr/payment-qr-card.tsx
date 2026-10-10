import { Pencil, Trash2 } from 'lucide-react'
import { useUpdatePaymentQrCode } from '@/api/hooks/use-payment-qr-codes'
import type { PaymentQrCode } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

interface PaymentQrCardProps {
  code: PaymentQrCode
  onEdit: () => void
  onDelete: () => void
}

export function PaymentQrCard({ code, onEdit, onDelete }: PaymentQrCardProps) {
  const toggle = useUpdatePaymentQrCode()

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-lg border p-3">
      <img
        src={code.imagePath}
        alt={code.label}
        loading="lazy"
        className="aspect-square w-full max-w-full rounded-md bg-white object-contain p-2"
      />

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{code.label}</p>
          <Badge variant={code.isActive ? 'default' : 'secondary'} className="mt-1">
            {code.isActive ? 'Đang hiện ở thanh toán' : 'Đang tắt'}
          </Badge>
        </div>
        <label className="flex min-h-11 min-w-11 items-center justify-center gap-2 text-sm">
          <span className="sr-only">Hiện mã {code.label} khi thanh toán</span>
          <Switch
            checked={code.isActive}
            disabled={toggle.isPending}
            onCheckedChange={(next) => toggle.mutate({ id: code.id, input: { isActive: next } })}
          />
        </label>
      </div>

      {toggle.isError && (
        <p role="alert" className="text-xs text-destructive">
          Lỗi: {toggle.error.message}
        </p>
      )}

      <div className="flex gap-2">
        <Button variant="outline" className="min-h-11 flex-1 text-sm" onClick={onEdit}>
          <Pencil className="size-4" />
          Sửa
        </Button>
        <Button variant="outline" className="min-h-11 flex-1 text-sm text-destructive" onClick={onDelete}>
          <Trash2 className="size-4" />
          Xóa
        </Button>
      </div>
    </div>
  )
}
