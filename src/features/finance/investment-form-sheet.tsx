import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useCreateInvestment, useUpdateInvestment } from '@/api/hooks'
import type { Investment, InvestmentCategory } from '@/api/types'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from '@/components/currency-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { parseDecimal } from '@/features/stock/stock-labels'
import { INVESTMENT_CATEGORY_LABEL, INVESTMENT_CATEGORY_OPTIONS } from './finance-labels'

interface InvestmentFormSheetProps {
  /** `null` = creating a new investment. */
  investment: Investment | null
  open: boolean
  /** Default day for a new investment (`YYYY-MM-DD`). */
  defaultDay: string
  onClose: () => void
}

export function InvestmentFormSheet({ investment, open, defaultDay, onClose }: InvestmentFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        {open && <InvestmentForm key={investment?.id ?? 'new'} investment={investment} defaultDay={defaultDay} onDone={onClose} />}
      </SheetContent>
    </Sheet>
  )
}

function InvestmentForm({ investment, defaultDay, onDone }: { investment: Investment | null; defaultDay: string; onDone: () => void }) {
  const create = useCreateInvestment()
  const update = useUpdateInvestment()
  const mutation = investment ? update : create
  const [name, setName] = useState(investment?.name ?? '')
  const [category, setCategory] = useState<InvestmentCategory>(investment?.category ?? 'equipment')
  const [amount, setAmount] = useState(investment ? String(investment.amount) : '')
  const [investedOn, setInvestedOn] = useState(investment?.investedOn ?? defaultDay)
  const [note, setNote] = useState(investment?.note ?? '')

  const parsed = parseDecimal(amount)
  const valid = name.trim() !== '' && parsed !== null && parsed >= 1 && investedOn !== ''

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!valid) return
    const input = { name: name.trim(), category, amount: parsed, investedOn, note: note.trim() }
    if (investment) update.mutate({ id: investment.id, input }, { onSuccess: onDone })
    else create.mutate(input, { onSuccess: onDone })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]" noValidate>
      <SheetHeader className="px-0">
        <SheetTitle>{investment ? 'Sửa khoản đầu tư' : 'Thêm khoản đầu tư'}</SheetTitle>
      </SheetHeader>

      <div className="flex flex-col gap-2">
        <Label htmlFor="investment-name">Hạng mục</Label>
        <Input id="investment-name" required maxLength={120} autoComplete="off" className="h-11 text-base" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        <Label id="investment-category-label">Nhóm</Label>
        <div role="group" aria-labelledby="investment-category-label" className="grid grid-cols-2 gap-2">
          {INVESTMENT_CATEGORY_OPTIONS.map((option) => (
            <Button
              key={option}
              type="button"
              variant={category === option ? 'default' : 'outline'}
              aria-pressed={category === option}
              className="min-h-11"
              onClick={() => setCategory(option)}
            >
              {INVESTMENT_CATEGORY_LABEL[option]}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="investment-amount">Số tiền (₫)</Label>
        <CurrencyInput id="investment-amount" allowDecimal autoComplete="off" className="h-11 text-base" value={amount} onValueChange={setAmount} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="investment-day">Ngày đầu tư</Label>
        <Input id="investment-day" type="date" required className="h-11 text-base" value={investedOn} onChange={(e) => setInvestedOn(e.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="investment-note">Ghi chú</Label>
        <Input id="investment-note" maxLength={200} autoComplete="off" className="h-11 text-base" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {mutation.error.message}
        </p>
      )}
      <Button type="submit" className="min-h-11 w-full" disabled={mutation.isPending || !valid}>
        {mutation.isPending && <Loader2 className="animate-spin" />}
        {investment ? 'Lưu thay đổi' : 'Thêm khoản đầu tư'}
      </Button>
    </form>
  )
}
