import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useCreateStockItem, useUpdateStockItem } from '@/api/hooks'
import type { StockItem, StockItemKind } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { STOCK_KIND_LABEL, formatQty, parseDecimal } from './stock-labels'

interface StockItemFormSheetProps {
  /** `null` = creating a new item. */
  item: StockItem | null
  open: boolean
  onClose: () => void
}

export function StockItemFormSheet({ item, open, onClose }: StockItemFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        {open && <StockItemForm key={item?.id ?? 'new'} item={item} onDone={onClose} />}
      </SheetContent>
    </Sheet>
  )
}

function StockItemForm({ item, onDone }: { item: StockItem | null; onDone: () => void }) {
  const create = useCreateStockItem()
  const update = useUpdateStockItem()
  const mutation = item ? update : create
  const [name, setName] = useState(item?.name ?? '')
  const [kind, setKind] = useState<StockItemKind>(item?.kind ?? 'material')
  const [unit, setUnit] = useState(item?.unit ?? '')
  const [threshold, setThreshold] = useState(item && item.lowStockThreshold > 0 ? formatQty(item.lowStockThreshold) : '')
  const [shelfLife, setShelfLife] = useState(item?.shelfLifeDays ? String(item.shelfLifeDays) : '')
  const [isActive, setIsActive] = useState(item?.isActive ?? true)

  const thresholdValue = threshold.trim() === '' ? 0 : parseDecimal(threshold)
  const thresholdError = thresholdValue === null || thresholdValue < 0 ? 'Nhập số từ 0 trở lên.' : null
  const shelfLifeValue = shelfLife.trim() === '' ? null : parseDecimal(shelfLife)
  const shelfLifeError =
    shelfLife.trim() !== '' && (shelfLifeValue === null || !Number.isInteger(shelfLifeValue) || shelfLifeValue < 1 || shelfLifeValue > 3650)
      ? 'Nhập số ngày nguyên từ 1 đến 3650.'
      : null
  const valid = name.trim() !== '' && unit.trim() !== '' && !thresholdError && !shelfLifeError

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!valid || thresholdValue === null) return
    const input = { name: name.trim(), kind, unit: unit.trim(), lowStockThreshold: thresholdValue, shelfLifeDays: shelfLifeValue }
    if (item) update.mutate({ id: item.id, input: { ...input, isActive } }, { onSuccess: onDone })
    else create.mutate(input, { onSuccess: onDone })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]" noValidate>
      <SheetHeader className="px-0">
        <SheetTitle>{item ? 'Sửa mặt hàng' : 'Thêm mặt hàng'}</SheetTitle>
        <SheetDescription>
          {item ? 'Số lượng tồn chỉ đổi qua phiếu nhập hoặc điều chỉnh.' : 'Tồn kho bắt đầu từ 0; tạo phiếu nhập để thêm hàng.'}
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-2">
        <Label htmlFor="stock-name">Tên</Label>
        <Input
          id="stock-name"
          required
          maxLength={150}
          autoComplete="off"
          placeholder="Bột mì, ly nhựa, cà phê hạt..."
          className="h-11"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label id="stock-kind-label">Loại</Label>
        <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="stock-kind-label">
          {(Object.keys(STOCK_KIND_LABEL) as StockItemKind[]).map((k) => (
            <Button
              key={k}
              type="button"
              variant={kind === k ? 'default' : 'outline'}
              className={cn('min-h-11')}
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
            >
              {STOCK_KIND_LABEL[k]}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="stock-unit">Đơn vị</Label>
          <Input
            id="stock-unit"
            required
            maxLength={30}
            autoComplete="off"
            placeholder="kg, lít, hộp..."
            className="h-11"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="stock-threshold">Cảnh báo khi ≤</Label>
          <Input
            id="stock-threshold"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0 = tắt"
            className="h-11"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            aria-invalid={!!thresholdError}
          />
        </div>
      </div>
      {thresholdError && <p className="-mt-2 text-sm text-destructive">{thresholdError}</p>}

      <div className="flex flex-col gap-2">
        <Label htmlFor="stock-shelf-life">Hạn dùng sau khi nhập (ngày)</Label>
        <Input
          id="stock-shelf-life"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Để trống nếu không rõ"
          className="h-11"
          value={shelfLife}
          onChange={(e) => setShelfLife(e.target.value)}
          aria-invalid={!!shelfLifeError}
        />
        <p className={cn('text-sm', shelfLifeError ? 'text-destructive' : 'text-muted-foreground')}>
          {shelfLifeError ?? 'Dùng để cảnh báo hàng sắp hết hạn ở tab Tồn dư, tính từ lần nhập gần nhất.'}
        </p>
      </div>

      {item && (
        <div className="flex min-h-11 items-center justify-between gap-3">
          <Label htmlFor="stock-active">Đang sử dụng</Label>
          <Switch id="stock-active" checked={isActive} onCheckedChange={setIsActive} />
        </div>
      )}

      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {mutation.error.message}
        </p>
      )}
      <Button type="submit" className="min-h-11 w-full" disabled={mutation.isPending || !valid}>
        {mutation.isPending && <Loader2 className="animate-spin" />}
        {item ? 'Lưu thay đổi' : 'Thêm mặt hàng'}
      </Button>
    </form>
  )
}
