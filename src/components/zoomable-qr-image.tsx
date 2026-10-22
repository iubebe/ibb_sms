import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ZoomableQrImageProps {
  src: string
  alt: string
  className?: string
}

/** QR thumbnail that opens a full-size view on tap, so it can be scanned from a customer's phone. */
export function ZoomableQrImage({ src, alt, className }: ZoomableQrImageProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" aria-label={`Phóng to mã ${alt}`} className="w-full cursor-zoom-in">
          <img src={src} alt={alt} loading="lazy" className={className} />
        </button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-xl p-4">
        <DialogTitle className="pr-6">{alt}</DialogTitle>
        <DialogDescription className="sr-only">Mã QR phóng to</DialogDescription>
        <img src={src} alt={alt} className={cn('mx-auto aspect-square w-full rounded-md bg-white object-contain p-2')} />
      </DialogContent>
    </Dialog>
  )
}
