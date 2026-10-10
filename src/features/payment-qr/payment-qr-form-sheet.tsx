import { ImageOff, ImagePlus, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  useCreatePaymentQrCode,
  useReplacePaymentQrImage,
  useUpdatePaymentQrCode,
} from '@/api/hooks/use-payment-qr-codes'
import type { PaymentQrCode } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

/** Backend limit (multipart, field `image`). */
const MAX_BYTES = 5 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,image/webp'
const ACCEPTED_TYPES = ACCEPT.split(',')

interface PaymentQrFormSheetProps {
  /** `null` = adding a new code. */
  code: PaymentQrCode | null
  open: boolean
  onClose: () => void
}

export function PaymentQrFormSheet({ code, open, onClose }: PaymentQrFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        {/* Remount per target so the form starts from the right values. */}
        {open && <PaymentQrForm key={code?.id ?? 'new'} code={code} onDone={onClose} />}
      </SheetContent>
    </Sheet>
  )
}

function PaymentQrForm({ code, onDone }: { code: PaymentQrCode | null; onDone: () => void }) {
  const create = useCreatePaymentQrCode()
  const update = useUpdatePaymentQrCode()
  const replaceImage = useReplacePaymentQrImage()
  const inputRef = useRef<HTMLInputElement>(null)

  const [label, setLabel] = useState(code?.label ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Preview for the picked file; revoked when it changes or the sheet closes.
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const shown = previewUrl ?? code?.imagePath ?? null
  const isCreate = code === null
  const trimmed = label.trim()
  const labelChanged = !isCreate && trimmed !== code.label
  const valid = trimmed !== '' && trimmed.length <= 60 && (!isCreate || file !== null)
  const busy = submitting || create.isPending || update.isPending || replaceImage.isPending

  function handlePick(event: ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0]
    event.target.value = '' // allow picking the same file again
    if (!picked) return
    if (!ACCEPTED_TYPES.includes(picked.type)) {
      setFile(null)
      setFileError('Chọn ảnh JPEG, PNG hoặc WebP.')
      return
    }
    if (picked.size > MAX_BYTES) {
      setFile(null)
      setFileError('Ảnh tối đa 5 MB.')
      return
    }
    setFileError(null)
    setFile(picked)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!valid || busy) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      if (isCreate) {
        await create.mutateAsync({ label: trimmed, image: file! })
      } else {
        if (labelChanged) await update.mutateAsync({ id: code.id, input: { label: trimmed } })
        if (file) await replaceImage.mutateAsync({ id: code.id, image: file })
      }
      onDone()
    } catch (error) {
      // Label may have saved while the image failed (or the reverse); the list refreshes either way.
      setSubmitError(error instanceof Error ? error.message : 'Không lưu được mã QR.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      noValidate
    >
      <SheetHeader className="px-0">
        <SheetTitle>{isCreate ? 'Thêm mã QR thanh toán' : 'Sửa mã QR thanh toán'}</SheetTitle>
        <SheetDescription>
          Ảnh nên là mã QR gốc, không cắt hay nén. Khách sẽ quét mã này khi chọn chuyển khoản.
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-2">
        <Label htmlFor="qr-label">Tên hiển thị</Label>
        <Input
          id="qr-label"
          required
          maxLength={60}
          autoComplete="off"
          placeholder="Ví dụ: Chuyển khoản, MoMo"
          className="h-11 text-base"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          disabled={busy}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Ảnh mã QR</Label>
        <div className="flex items-center gap-4">
          {shown ? (
            <img
              src={shown}
              alt={trimmed || 'Mã QR'}
              className="size-32 shrink-0 rounded-lg bg-white object-contain p-1"
            />
          ) : (
            <div className="flex size-32 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <ImageOff className="size-6" />
            </div>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <input
              ref={inputRef}
              id="qr-image"
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={handlePick}
              disabled={busy}
            />
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus />
              {shown ? 'Chọn ảnh khác' : 'Chọn ảnh'}
            </Button>
            {!isCreate && file === null && <p className="text-xs text-muted-foreground">Giữ ảnh hiện tại nếu không chọn ảnh mới.</p>}
          </div>
        </div>
        {fileError && (
          <p role="alert" className="text-sm text-destructive">
            {fileError}
          </p>
        )}
      </div>

      {submitError && (
        <p role="alert" className="text-sm text-destructive">
          Lỗi: {submitError}
        </p>
      )}

      <Button type="submit" className="min-h-11 w-full" disabled={!valid || busy}>
        {busy && <Loader2 className="size-4 animate-spin" />}
        {busy ? 'Đang lưu...' : isCreate ? 'Thêm mã QR' : 'Lưu thay đổi'}
      </Button>
    </form>
  )
}
