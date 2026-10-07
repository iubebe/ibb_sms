import { Loader2, Printer } from 'lucide-react'
import { useState } from 'react'
import { useTableQrPdf } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { downloadBlob } from '@/lib/download-blob'

const LAYOUTS = [
  { id: '2x3', columns: 2, rows: 3, label: '6 mã / trang (lớn)' },
  { id: '3x4', columns: 3, rows: 4, label: '12 mã / trang' },
  { id: '4x6', columns: 4, rows: 6, label: '24 mã / trang (nhỏ)' },
] as const

interface PrintQrSheetProps {
  open: boolean
  onClose: () => void
}

export function PrintQrSheet({ open, onClose }: PrintQrSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        {open && <PrintQrForm onDone={onClose} />}
      </SheetContent>
    </Sheet>
  )
}

function PrintQrForm({ onDone }: { onDone: () => void }) {
  const exporter = useTableQrPdf()
  const [layoutId, setLayoutId] = useState<(typeof LAYOUTS)[number]['id']>('3x4')

  function handleDownload() {
    const layout = LAYOUTS.find((l) => l.id === layoutId) ?? LAYOUTS[1]
    exporter.mutate(
      { columns: layout.columns, rows: layout.rows },
      {
        onSuccess: (blob) => {
          downloadBlob(blob, 'ma-qr-ban.pdf')
          onDone()
        },
      },
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <SheetHeader className="px-0">
        <SheetTitle>In mã QR</SheetTitle>
        <SheetDescription>Tải file PDF A4 chứa mã QR của tất cả các bàn, theo thứ tự danh sách.</SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-2">
        <Label htmlFor="qr-layout">Số mã QR trên mỗi trang</Label>
        <select
          id="qr-layout"
          className="h-11 w-full rounded-lg border border-input bg-background px-3 text-base"
          value={layoutId}
          onChange={(e) => setLayoutId(e.target.value as typeof layoutId)}
        >
          {LAYOUTS.map((layout) => (
            <option key={layout.id} value={layout.id}>
              {layout.label}
            </option>
          ))}
        </select>
      </div>
      {exporter.isError && (
        <p role="alert" className="text-sm text-destructive">
          {exporter.error.message}
        </p>
      )}
      <Button className="min-h-11 w-full" disabled={exporter.isPending} onClick={handleDownload}>
        {exporter.isPending ? <Loader2 className="animate-spin" /> : <Printer />}
        Tải PDF
      </Button>
    </div>
  )
}
