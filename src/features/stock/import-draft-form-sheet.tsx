import { ImagePlus, Loader2, Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useCreateImportDraft, useStockItemOptions, useSuppliers } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { IMAGE_ACCEPT, prepareImage } from '@/features/products/prepare-image'
import { parseDecimal } from './stock-labels'

const NO_SUPPLIER = 'none'

interface LineDraft {
  key: number
  stockItemId: string
  quantity: string
  unitCost: string
}

interface ImportDraftFormSheetProps {
  open: boolean
  onClose: () => void
}

/** Staff: propose an import with a photo of the invoice/goods. An admin confirms it before stock changes. */
export function ImportDraftFormSheet({ open, onClose }: ImportDraftFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        {open && <ImportDraftForm onDone={onClose} />}
      </SheetContent>
    </Sheet>
  )
}

function ImportDraftForm({ onDone }: { onDone: () => void }) {
  const create = useCreateImportDraft()
  const items = useStockItemOptions()
  const suppliers = useSuppliers()
  const inputRef = useRef<HTMLInputElement>(null)
  const [supplierId, setSupplierId] = useState(NO_SUPPLIER)
  const [note, setNote] = useState('')
  const [nextKey, setNextKey] = useState(1)
  const [lines, setLines] = useState<LineDraft[]>([{ key: 0, stockItemId: '', quantity: '', unitCost: '' }])
  const [image, setImage] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [preparing, setPreparing] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)

  // Revoke the preview when it changes or the sheet closes.
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const parsed = lines.map((l) => ({ quantity: parseDecimal(l.quantity), unitCost: l.unitCost.trim() === '' ? 0 : parseDecimal(l.unitCost) }))
  const lineValid = (i: number) =>
    !!lines[i].stockItemId && parsed[i].quantity !== null && parsed[i].quantity > 0 && parsed[i].unitCost !== null && parsed[i].unitCost >= 0
  const allValid = lines.every((_, i) => lineValid(i)) && image !== null

  function patch(key: number, change: Partial<LineDraft>) {
    setLines((current) => current.map((l) => (l.key === key ? { ...l, ...change } : l)))
  }

  async function handlePick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // allow picking the same file again
    if (!file) return
    setImageError(null)
    setPreparing(true)
    try {
      const prepared = await prepareImage(file)
      setImage(prepared)
      setPreviewUrl(URL.createObjectURL(prepared))
    } catch {
      setImageError('Không đọc được ảnh. Chọn ảnh JPEG, PNG hoặc WebP.')
    } finally {
      setPreparing(false)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!allValid || !image) return
    create.mutate(
      {
        image,
        ...(supplierId !== NO_SUPPLIER ? { supplierId } : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
        lines: lines.map((l, i) => ({ stockItemId: l.stockItemId, quantity: parsed[i].quantity!, unitCost: parsed[i].unitCost! })),
      },
      { onSuccess: onDone },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]" noValidate>
      <SheetHeader className="px-0">
        <SheetTitle>Phiếu nhập hàng nháp</SheetTitle>
        <SheetDescription>Chụp ảnh hóa đơn hoặc hàng nhận. Tồn kho chỉ thay đổi sau khi quản lý xác nhận.</SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-2">
        <Label htmlFor="draft-image">Ảnh hóa đơn / hàng nhận</Label>
        <input ref={inputRef} id="draft-image" type="file" accept={IMAGE_ACCEPT} className="sr-only" onChange={handlePick} disabled={preparing || create.isPending} />
        <div className="flex items-center gap-3">
          {previewUrl && <img src={previewUrl} alt="Ảnh phiếu nhập" className="size-24 shrink-0 rounded-lg bg-muted object-cover" />}
          <Button type="button" variant="outline" className="min-h-11 flex-1" disabled={preparing || create.isPending} onClick={() => inputRef.current?.click()}>
            {preparing ? <Loader2 className="animate-spin" /> : <ImagePlus />}
            {image ? 'Đổi ảnh' : 'Chụp / chọn ảnh'}
          </Button>
        </div>
        {imageError && (
          <p role="alert" className="text-sm text-destructive">
            {imageError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="draft-supplier">Nhà cung cấp</Label>
        <Select value={supplierId} onValueChange={setSupplierId}>
          <SelectTrigger id="draft-supplier" className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_SUPPLIER}>Không chọn</SelectItem>
            {suppliers.data?.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Mặt hàng</h3>
        {items.isPending && <p className="text-sm text-muted-foreground">Đang tải danh sách...</p>}
        {items.isError && <p className="text-sm text-destructive">{items.error.message}</p>}
        {items.data?.length === 0 && <p className="text-sm text-muted-foreground">Chưa có mặt hàng nào. Nhờ quản lý thêm mặt hàng ở mục Kho.</p>}
        {lines.map((line, i) => {
          const item = items.data?.find((x) => x.id === line.stockItemId)
          return (
            <div key={line.key} className="flex flex-col gap-2 rounded-xl border p-3">
              <div className="flex items-center gap-1">
                <Select value={line.stockItemId} onValueChange={(v) => patch(line.key, { stockItemId: v })}>
                  <SelectTrigger className="h-11 flex-1" aria-label={`Mặt hàng dòng ${i + 1}`}>
                    <SelectValue placeholder="Chọn mặt hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.data?.map((x) => (
                      <SelectItem key={x.id} value={x.id}>
                        {x.name} ({x.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="min-h-11 min-w-11 text-destructive"
                  aria-label={`Bỏ dòng ${i + 1}`}
                  disabled={lines.length === 1}
                  onClick={() => setLines((current) => current.filter((l) => l.key !== line.key))}
                >
                  <Trash2 />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`draft-qty-${line.key}`} className="text-xs">
                    Số lượng{item && ` (${item.unit})`}
                  </Label>
                  <Input
                    id={`draft-qty-${line.key}`}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0"
                    className="h-11"
                    value={line.quantity}
                    onChange={(e) => patch(line.key, { quantity: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`draft-cost-${line.key}`} className="text-xs">
                    Đơn giá (₫, nếu biết)
                  </Label>
                  <Input
                    id={`draft-cost-${line.key}`}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0"
                    className="h-11"
                    value={line.unitCost}
                    onChange={(e) => patch(line.key, { unitCost: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )
        })}
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={lines.length >= 200}
          onClick={() => {
            setLines((current) => [...current, { key: nextKey, stockItemId: '', quantity: '', unitCost: '' }])
            setNextKey(nextKey + 1)
          }}
        >
          <Plus />
          Thêm dòng
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="draft-note">Ghi chú</Label>
        <Input id="draft-note" maxLength={200} autoComplete="off" className="h-11" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      {create.isError && (
        <p role="alert" className="text-sm text-destructive">
          {create.error.message}
        </p>
      )}
      <Button type="submit" className="min-h-11 w-full" disabled={create.isPending || preparing || !allValid}>
        {create.isPending && <Loader2 className="animate-spin" />}
        Gửi quản lý duyệt
      </Button>
    </form>
  )
}
