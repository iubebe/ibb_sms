import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useCreateImport, useStockItems, useSuppliers } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from '@/components/currency-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { formatPrice } from '@/lib/format-price'
import { fromLocalInput, toLocalInput } from '@/lib/format-time'
import { formatQty, parseDecimal } from './stock-labels'

const NO_SUPPLIER = 'none'

interface LineDraft {
  key: number
  stockItemId: string
  quantity: string
  unitCost: string
}

interface ImportFormSheetProps {
  open: boolean
  onClose: () => void
}

export function ImportFormSheet({ open, onClose }: ImportFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        {open && <ImportForm onDone={onClose} />}
      </SheetContent>
    </Sheet>
  )
}

function ImportForm({ onDone }: { onDone: () => void }) {
  const create = useCreateImport()
  const items = useStockItems()
  const suppliers = useSuppliers()
  const [supplierId, setSupplierId] = useState(NO_SUPPLIER)
  const [importedAt, setImportedAt] = useState(() => toLocalInput(new Date().toISOString()))
  const [note, setNote] = useState('')
  const [nextKey, setNextKey] = useState(1)
  const [lines, setLines] = useState<LineDraft[]>([{ key: 0, stockItemId: '', quantity: '', unitCost: '' }])

  const activeItems = (items.data ?? []).filter((i) => i.isActive)
  const parsed = lines.map((l) => ({ quantity: parseDecimal(l.quantity), unitCost: l.unitCost.trim() === '' ? null : parseDecimal(l.unitCost) }))
  const lineValid = (i: number) =>
    !!lines[i].stockItemId && parsed[i].quantity !== null && parsed[i].quantity > 0 && parsed[i].unitCost !== null && parsed[i].unitCost >= 0
  const allValid = lines.length > 0 && lines.every((_, i) => lineValid(i)) && !!importedAt
  const total = parsed.reduce((sum, p) => sum + (p.quantity ?? 0) * (p.unitCost ?? 0), 0)

  function patch(key: number, change: Partial<LineDraft>) {
    setLines((current) => current.map((l) => (l.key === key ? { ...l, ...change } : l)))
  }

  function pickItem(key: number, stockItemId: string) {
    const last = items.data?.find((i) => i.id === stockItemId)?.lastUnitCost
    const line = lines.find((l) => l.key === key)
    // Prefill the cost with the last price, but never overwrite what was typed.
    patch(key, { stockItemId, ...(line?.unitCost.trim() === '' && last != null ? { unitCost: String(last) } : {}) })
  }

  function addLine() {
    setLines((current) => [...current, { key: nextKey, stockItemId: '', quantity: '', unitCost: '' }])
    setNextKey(nextKey + 1)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!allValid) return
    create.mutate(
      {
        ...(supplierId !== NO_SUPPLIER ? { supplierId } : {}),
        importedAt: fromLocalInput(importedAt),
        ...(note.trim() ? { note: note.trim() } : {}),
        lines: lines.map((l, i) => ({ stockItemId: l.stockItemId, quantity: parsed[i].quantity!, unitCost: parsed[i].unitCost! })),
      },
      { onSuccess: onDone },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]" noValidate>
      <SheetHeader className="px-0">
        <SheetTitle>Phiếu nhập hàng</SheetTitle>
        <SheetDescription>Lưu phiếu sẽ cộng ngay số lượng vào tồn kho.</SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-2">
        <Label htmlFor="import-supplier">Nhà cung cấp</Label>
        <Select value={supplierId} onValueChange={setSupplierId}>
          <SelectTrigger id="import-supplier" className="h-11">
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="import-at">Ngày giờ nhập</Label>
        <Input id="import-at" type="datetime-local" className="h-11" value={importedAt} onChange={(e) => setImportedAt(e.target.value)} />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Mặt hàng</h3>
        {items.isPending && <p className="text-sm text-muted-foreground">Đang tải danh sách...</p>}
        {items.isError && <p className="text-sm text-destructive">{items.error.message}</p>}
        {items.data && activeItems.length === 0 && (
          <p className="text-sm text-muted-foreground">Chưa có mặt hàng nào. Đóng phiếu này và thêm mặt hàng ở tab Tồn kho trước.</p>
        )}
        {lines.map((line, i) => {
          const item = activeItems.find((x) => x.id === line.stockItemId)
          const lineTotal = (parsed[i].quantity ?? 0) * (parsed[i].unitCost ?? 0)
          return (
            <div key={line.key} className="flex flex-col gap-2 rounded-xl border p-3">
              <div className="flex items-center gap-1">
                <Select value={line.stockItemId} onValueChange={(v) => pickItem(line.key, v)}>
                  <SelectTrigger className="h-11 flex-1" aria-label={`Mặt hàng dòng ${i + 1}`}>
                    <SelectValue placeholder="Chọn mặt hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeItems.map((x) => (
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
                  <Label htmlFor={`qty-${line.key}`} className="text-xs">
                    Số lượng{item && ` (${item.unit})`}
                  </Label>
                  <Input
                    id={`qty-${line.key}`}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0"
                    className="h-11"
                    value={line.quantity}
                    onChange={(e) => patch(line.key, { quantity: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`cost-${line.key}`} className="text-xs">
                    Đơn giá (₫)
                  </Label>
                  <CurrencyInput
                    id={`cost-${line.key}`}
                    allowDecimal
                    autoComplete="off"
                    placeholder="0"
                    className="h-11"
                    value={line.unitCost}
                    onValueChange={(v) => patch(line.key, { unitCost: v })}
                  />
                </div>
              </div>
              {item && parsed[i].quantity !== null && (
                <p className="text-xs text-muted-foreground">
                  Thành tiền {formatPrice(lineTotal)} · tồn {formatQty(item.quantity)} → {formatQty(item.quantity + parsed[i].quantity!)} {item.unit}
                </p>
              )}
            </div>
          )
        })}
        <Button type="button" variant="outline" className="min-h-11" onClick={addLine} disabled={lines.length >= 200}>
          <Plus />
          Thêm dòng
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="import-note">Ghi chú</Label>
        <Input id="import-note" maxLength={200} autoComplete="off" className="h-11" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        <span className="text-sm text-muted-foreground">Tổng tiền</span>
        <span className="text-xl font-semibold tabular-nums">{formatPrice(total)}</span>
      </div>

      {create.isError && (
        <p role="alert" className="text-sm text-destructive">
          {create.error.message}
        </p>
      )}
      <Button type="submit" className="min-h-11 w-full" disabled={create.isPending || !allValid}>
        {create.isPending && <Loader2 className="animate-spin" />}
        Lưu phiếu nhập
      </Button>
    </form>
  )
}
