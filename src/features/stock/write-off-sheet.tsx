import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useCreateWriteOff, useProposeWriteOff, useStockItemOptions } from '@/api/hooks'
import type { WriteOffCause } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { formatQty, parseDecimal, WRITE_OFF_CAUSE_LABEL } from './stock-labels'

export interface WriteOffTarget {
  id: string
  name: string
  unit: string
  /** On-hand quantity when known (admin), used to cap the amount. */
  quantity?: number
}

interface WriteOffSheetProps {
  open: boolean
  /** `direct` (admin) removes stock at once; `propose` (staff) waits for an admin. */
  mode: 'direct' | 'propose'
  /** Preselected item; `null` lets the user pick one. */
  item: WriteOffTarget | null
  /** Suggested reason, e.g. `expired` from the at-risk list. */
  defaultCause?: WriteOffCause
  onClose: () => void
}

export function WriteOffSheet({ open, mode, item, defaultCause, onClose }: WriteOffSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        {open && <WriteOffForm key={item?.id ?? 'new'} mode={mode} item={item} defaultCause={defaultCause} onDone={onClose} />}
      </SheetContent>
    </Sheet>
  )
}

interface WriteOffFormProps {
  mode: 'direct' | 'propose'
  item: WriteOffTarget | null
  defaultCause?: WriteOffCause
  onDone: () => void
}

function WriteOffForm({ mode, item, defaultCause, onDone }: WriteOffFormProps) {
  const direct = useCreateWriteOff()
  const propose = useProposeWriteOff()
  const mutation = mode === 'direct' ? direct : propose
  const options = useStockItemOptions()
  const [itemId, setItemId] = useState(item?.id ?? '')
  const [amount, setAmount] = useState('')
  const [cause, setCause] = useState<WriteOffCause>(defaultCause ?? 'spoiled')
  const [note, setNote] = useState('')

  const picked = item ?? options.data?.find((o) => o.id === itemId) ?? null
  const unit = picked?.unit ?? ''
  const max = item?.quantity
  const quantity = parseDecimal(amount)
  const error =
    quantity === null
      ? null
      : quantity <= 0
        ? 'Số lượng phải lớn hơn 0.'
        : max !== undefined && quantity > max
          ? `Chỉ còn ${formatQty(max)} ${unit} trong kho.`
          : null
  const valid = !!picked && quantity !== null && !error

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!valid || !picked || quantity === null) return
    mutation.mutate(
      { stockItemId: picked.id, quantity, cause, note: note.trim() || undefined },
      { onSuccess: onDone },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]" noValidate>
      <SheetHeader className="px-0">
        <SheetTitle>{mode === 'direct' ? 'Hủy hàng' : 'Đề xuất hủy hàng'}</SheetTitle>
        <SheetDescription>
          {mode === 'direct'
            ? 'Trừ ngay khỏi kho và ghi nhận thiệt hại theo giá nhập gần nhất.'
            : 'Quản lý sẽ xem và duyệt; kho chỉ đổi khi được duyệt.'}
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-2">
        <Label htmlFor="wo-item">Mặt hàng</Label>
        {item ? (
          <p id="wo-item" className="flex min-h-11 items-center rounded-lg border bg-muted px-3 font-medium">
            {item.name}
            {max !== undefined && <span className="ml-auto text-sm font-normal text-muted-foreground">còn {formatQty(max)} {item.unit}</span>}
          </p>
        ) : (
          <Select value={itemId} onValueChange={setItemId}>
            <SelectTrigger id="wo-item" className="h-11" disabled={options.isPending}>
              <SelectValue placeholder={options.isPending ? 'Đang tải...' : 'Chọn mặt hàng'} />
            </SelectTrigger>
            <SelectContent>
              {options.data?.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name} ({o.unit})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {options.isError && <p className="text-sm text-destructive">{options.error.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="wo-qty">Số lượng hủy{unit && ` (${unit})`}</Label>
        <Input
          id="wo-qty"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          className="h-11"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          aria-invalid={!!error}
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : <p className="text-sm text-muted-foreground">Dùng dấu , hoặc . cho phần lẻ.</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label id="wo-cause-label">Lý do</Label>
        <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="wo-cause-label">
          {(Object.keys(WRITE_OFF_CAUSE_LABEL) as WriteOffCause[]).map((c) => (
            <Button key={c} type="button" variant={cause === c ? 'default' : 'outline'} className="min-h-11" aria-pressed={cause === c} onClick={() => setCause(c)}>
              {WRITE_OFF_CAUSE_LABEL[c]}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="wo-note">Ghi chú (không bắt buộc)</Label>
        <Input id="wo-note" maxLength={200} autoComplete="off" placeholder="Mốc meo, quá hạn ngày..." className="h-11" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {mutation.error.message}
        </p>
      )}
      <Button type="submit" variant={mode === 'direct' ? 'destructive' : 'default'} className="min-h-11 w-full" disabled={mutation.isPending || !valid}>
        {mutation.isPending && <Loader2 className="animate-spin" />}
        {mode === 'direct' ? 'Hủy hàng' : 'Gửi đề xuất'}
      </Button>
    </form>
  )
}
