import { Pencil, Plus, SlidersHorizontal, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useDeleteStockItem, useStockItems } from '@/api/hooks'
import type { StockItem, StockItemKind } from '@/api/types'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/format-price'
import { cn } from '@/lib/utils'
import { StockAdjustSheet } from './stock-adjust-sheet'
import { StockItemFormSheet } from './stock-item-form-sheet'
import { STOCK_KIND_LABEL, formatQty } from './stock-labels'

type KindFilter = StockItemKind | 'all'
const FILTERS: KindFilter[] = ['all', 'goods', 'material']

export function StockItemsPanel() {
  const items = useStockItems()
  const remove = useDeleteStockItem()
  const [kind, setKind] = useState<KindFilter>('all')
  const [lowOnly, setLowOnly] = useState(false)
  const [form, setForm] = useState<{ item: StockItem | null } | null>(null)
  const [adjusting, setAdjusting] = useState<StockItem | null>(null)
  const [toDelete, setToDelete] = useState<StockItem | null>(null)

  const all = items.data ?? []
  const lowCount = all.filter((i) => i.isLow && i.isActive).length
  const visible = all.filter((i) => (kind === 'all' || i.kind === kind) && (!lowOnly || (i.isLow && i.isActive)))

  function closeDelete() {
    setToDelete(null)
    remove.reset()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button className="min-h-11" onClick={() => setForm({ item: null })}>
          <Plus />
          Thêm mặt hàng
        </Button>
        <Button
          variant={lowOnly ? 'default' : 'outline'}
          className="min-h-11"
          aria-pressed={lowOnly}
          onClick={() => setLowOnly(!lowOnly)}
        >
          Sắp hết{lowCount > 0 && ` (${lowCount})`}
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto" role="group" aria-label="Lọc theo loại">
        {FILTERS.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={kind === f ? 'secondary' : 'ghost'}
            className={cn('min-h-11 shrink-0', kind === f && 'font-semibold')}
            aria-pressed={kind === f}
            onClick={() => setKind(f)}
          >
            {f === 'all' ? 'Tất cả' : STOCK_KIND_LABEL[f]}
          </Button>
        ))}
      </div>

      {items.isPending && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      )}

      {items.isError && (
        <div role="alert" className="flex flex-col items-start gap-2 text-sm">
          <p className="text-destructive">{items.error.message}</p>
          <Button variant="outline" className="min-h-11" onClick={() => void items.refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {items.data && visible.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {all.length === 0 ? 'Chưa có mặt hàng nào. Thêm hàng hóa hoặc nguyên liệu để bắt đầu.' : 'Không có mặt hàng phù hợp.'}
        </p>
      )}

      <ul className="grid gap-2 md:grid-cols-2">
        {visible.map((item) => (
          <li
            key={item.id}
            className={cn('flex flex-col gap-2 rounded-xl border bg-card p-3 text-card-foreground', !item.isActive && 'opacity-60')}
          >
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.name}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge variant="outline">{STOCK_KIND_LABEL[item.kind]}</Badge>
                  {item.isLow && item.isActive && <Badge variant="destructive">Sắp hết</Badge>}
                  {!item.isActive && <Badge variant="secondary">Ngừng dùng</Badge>}
                </div>
              </div>
              <p className="text-right">
                <span className={cn('text-2xl font-semibold tabular-nums', item.isLow && item.isActive && 'text-destructive')}>
                  {formatQty(item.quantity)}
                </span>{' '}
                <span className="text-sm text-muted-foreground">{item.unit}</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {item.lastUnitCost !== null ? `Giá nhập gần nhất: ${formatPrice(item.lastUnitCost)}/${item.unit}` : 'Chưa nhập lần nào'}
              {item.lowStockThreshold > 0 && ` · Cảnh báo ≤ ${formatQty(item.lowStockThreshold)}`}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" className="min-h-11 flex-1" onClick={() => setAdjusting(item)}>
                <SlidersHorizontal />
                Điều chỉnh
              </Button>
              <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label={`Sửa ${item.name}`} onClick={() => setForm({ item })}>
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="min-h-11 min-w-11 text-destructive"
                aria-label={`Xóa ${item.name}`}
                onClick={() => setToDelete(item)}
              >
                <Trash2 />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <StockItemFormSheet item={form?.item ?? null} open={!!form} onClose={() => setForm(null)} />
      <StockAdjustSheet item={adjusting} onClose={() => setAdjusting(null)} />
      <ConfirmDeleteDialog
        open={!!toDelete}
        title={`Xóa "${toDelete?.name ?? ''}"?`}
        description="Chỉ xóa được mặt hàng chưa từng nhập hoặc điều chỉnh. Nếu đã có lịch sử, hãy chọn Sửa → Ngừng dùng."
        pending={remove.isPending}
        error={remove.isError ? remove.error.message : null}
        onClose={closeDelete}
        onConfirm={() => toDelete && remove.mutate(toDelete.id, { onSuccess: closeDelete })}
      />
    </div>
  )
}
