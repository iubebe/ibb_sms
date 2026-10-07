import { Loader2 } from 'lucide-react'
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

interface RegenerateQrDialogProps {
  open: boolean
  tableName: string
  pending: boolean
  error: string | null
  onConfirm: () => void
  onClose: () => void
}

export function RegenerateQrDialog({ open, tableName, pending, error, onConfirm, onClose }: RegenerateQrDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && !pending && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tạo lại mã QR cho "{tableName}"?</AlertDialogTitle>
          <AlertDialogDescription>
            Mã QR đã in của bàn này sẽ ngừng hoạt động ngay. Bạn cần in và dán mã mới.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel className="min-h-11" disabled={pending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction variant="destructive" className="min-h-11" disabled={pending} onClick={onConfirm}>
            {pending && <Loader2 className="animate-spin" />}
            Tạo lại
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
