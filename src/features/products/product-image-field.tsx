import { ImageOff, ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { IMAGE_ACCEPT, prepareImage } from './prepare-image'

interface ProductImageFieldProps {
  /** Image already saved on the product (public media URL), if any. */
  currentUrl: string | null
  /** Newly picked image, not uploaded until the form is saved. */
  pending: Blob | null
  /** The saved image will be removed on save. */
  removed: boolean
  disabled?: boolean
  onPick: (image: Blob) => void
  onRemove: () => void
}

export function ProductImageField({ currentUrl, pending, removed, disabled, onPick, onRemove }: ProductImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Revoke the last preview when the field goes away.
  const previewRef = useRef<string | null>(null)
  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
  }, [])

  const shown = (pending ? previewUrl : null) ?? (removed || pending ? null : currentUrl)

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // allow picking the same file again
    if (!file) return
    setError(null)
    setBusy(true)
    try {
      const image = await prepareImage(file)
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
      previewRef.current = URL.createObjectURL(image)
      setPreviewUrl(previewRef.current)
      onPick(image)
    } catch {
      setError('Không đọc được ảnh. Chọn ảnh JPEG, PNG hoặc WebP.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="product-image">Ảnh sản phẩm</Label>
      <div className="flex items-center gap-4">
        {shown ? (
          <img src={shown} alt="Ảnh sản phẩm" className="size-24 shrink-0 rounded-lg bg-muted object-cover" />
        ) : (
          <div className="flex size-24 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <ImageOff className="size-6" />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            ref={inputRef}
            id="product-image"
            type="file"
            accept={IMAGE_ACCEPT}
            className="sr-only"
            onChange={handleChange}
            disabled={disabled || busy}
          />
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full"
            disabled={disabled || busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? <Loader2 className="animate-spin" /> : <ImagePlus />}
            {shown ? 'Đổi ảnh' : 'Chọn ảnh'}
          </Button>
          {shown && (
            <Button type="button" variant="ghost" className="min-h-11 w-full text-destructive" disabled={disabled || busy} onClick={onRemove}>
              <Trash2 />
              Xóa ảnh
            </Button>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
