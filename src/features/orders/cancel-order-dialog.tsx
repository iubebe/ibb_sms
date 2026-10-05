import { Loader2 } from 'lucide-react'
import { useCancelOrder } from '@/api/hooks'
import type { StaffOrder } from '@/api/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface CancelOrderDialogProps {
  /** `null` = closed. */
  order: StaffOrder | null
  onClose: () => void
}

export function CancelOrderDialog({ order, onClose }: CancelOrderDialogProps) {
  const cancel = useCancelOrder()
  const pending = cancel.isPending

  function close() {
    if (pending) return
    cancel.reset()
    onClose()
  }

  return (
    <AlertDialog open={order !== null} onOpenChange={(next) => !next && close()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hủy đơn {order?.tableName ?? 'không có bàn'}?</AlertDialogTitle>
          <AlertDialogDescription>
            Đơn sẽ chuyển sang trạng thái đã hủy và khách không còn thấy đơn này. Không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {cancel.isError && (
          <p role="alert" className="text-sm text-destructive">
            {cancel.error.message}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel className="min-h-11" disabled={pending}>
            Giữ đơn
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="min-h-11"
            disabled={pending}
            onClick={() => order && cancel.mutate(order.id, { onSuccess: close })}
          >
            {pending && <Loader2 className="animate-spin" />}
            Hủy đơn
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
