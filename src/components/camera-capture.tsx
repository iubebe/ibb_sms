import { Camera, Loader2, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCamera, type CameraStatus } from '@/hooks/use-camera'
import { cn } from '@/lib/utils'

interface CameraCaptureProps {
  /** Called with the JPEG when the user accepts the photo. */
  onCapture: (photo: Blob) => void
  /** Label of the accept button, e.g. "Check in". */
  confirmLabel: string
  /** The accepted photo is being sent: lock the controls. */
  pending?: boolean
  /** Message of a failed send, shown under the preview. */
  error?: string | null
  disabled?: boolean
}

const STATUS_MESSAGE: Partial<Record<CameraStatus, string>> = {
  denied: 'Chưa được cấp quyền camera. Hãy cho phép camera trong cài đặt trình duyệt rồi thử lại.',
  unsupported: 'Thiết bị hoặc đường dẫn này không dùng được camera (cần HTTPS).',
  error: 'Không mở được camera. Kiểm tra camera có đang được ứng dụng khác dùng không.',
}

/**
 * Selfie capture: open camera -> take photo -> review -> accept or retake.
 * Remount it (change `key`) to reset after a successful send.
 */
export function CameraCapture({ onCapture, confirmLabel, pending = false, error, disabled = false }: CameraCaptureProps) {
  const { videoRef, status, start, stop, capture } = useCamera()
  const [photo, setPhoto] = useState<{ blob: Blob; url: string } | null>(null)
  const live = status === 'live'

  // Release the preview URL when the photo is replaced or the component goes away.
  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo.url)
  }, [photo])

  async function handleTake() {
    const blob = await capture()
    if (!blob) return
    stop()
    setPhoto({ blob, url: URL.createObjectURL(blob) })
  }

  function handleRetake() {
    setPhoto(null)
    void start()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-muted">
        {/* Always mounted so the stream can attach; mirrored like a selfie preview. */}
        <video
          ref={videoRef}
          playsInline
          muted
          aria-label="Xem trước camera"
          className={cn('size-full -scale-x-100 object-cover', !live && 'hidden')}
        />
        {photo && <img src={photo.url} alt="Ảnh vừa chụp" className="size-full object-cover" />}
        {!live && !photo && (
          <div className="flex size-full flex-col items-center justify-center gap-3 p-4 text-center text-sm text-muted-foreground">
            {status === 'starting' ? <Loader2 className="size-6 animate-spin" /> : <Camera className="size-8" />}
            <p role={STATUS_MESSAGE[status] ? 'alert' : undefined}>
              {STATUS_MESSAGE[status] ?? 'Chụp ảnh khuôn mặt để chấm công.'}
            </p>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {photo ? (
        <div className="flex gap-2">
          <Button variant="outline" className="min-h-11 flex-1" disabled={pending} onClick={handleRetake}>
            <RotateCcw />
            Chụp lại
          </Button>
          <Button className="min-h-11 flex-1" disabled={pending || disabled} onClick={() => onCapture(photo.blob)}>
            {pending && <Loader2 className="animate-spin" />}
            {confirmLabel}
          </Button>
        </div>
      ) : live ? (
        <Button className="min-h-11 w-full" onClick={() => void handleTake()}>
          <Camera />
          Chụp ảnh
        </Button>
      ) : (
        <Button className="min-h-11 w-full" disabled={disabled || status === 'starting'} onClick={() => void start()}>
          {status === 'starting' ? <Loader2 className="animate-spin" /> : <Camera />}
          {status === 'denied' || status === 'error' ? 'Thử lại' : 'Mở camera'}
        </Button>
      )}
    </div>
  )
}
