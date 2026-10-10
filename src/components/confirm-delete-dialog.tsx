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
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ConfirmDeleteDialogProps {
  open: boolean
  title: string
  description: string
  pending: boolean
  /** Backend message (e.g. "used by existing orders"), shown inside the dialog. */
  error: string | null
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDeleteDialog({
  open,
  title,
  description,
  pending,
  error,
  onConfirm,
  onClose,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && !pending && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
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
          <AlertDialogAction
            className={cn(buttonVariants({ variant: 'destructive' }), 'min-h-11')}
            disabled={pending}
            onClick={onConfirm}
          >
            {pending && <Loader2 className="animate-spin" />}
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
