import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useCreateExpense, useUpdateExpense } from '@/api/hooks'
import type { Expense, ExpenseCategory } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { parseDecimal } from '@/features/stock/stock-labels'
import { EXPENSE_CATEGORY_LABEL, EXPENSE_CATEGORY_OPTIONS } from './finance-labels'

interface ExpenseFormSheetProps {
  /** `null` = creating a new expense. */
  expense: Expense | null
  open: boolean
  /** Default day for a new expense (`YYYY-MM-DD`). */
  defaultDay: string
  onClose: () => void
}

export function ExpenseFormSheet({ expense, open, defaultDay, onClose }: ExpenseFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        {open && <ExpenseForm key={expense?.id ?? 'new'} expense={expense} defaultDay={defaultDay} onDone={onClose} />}
      </SheetContent>
    </Sheet>
  )
}

function ExpenseForm({ expense, defaultDay, onDone }: { expense: Expense | null; defaultDay: string; onDone: () => void }) {
  const create = useCreateExpense()
  const update = useUpdateExpense()
  const mutation = expense ? update : create
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? 'electricity')
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '')
  const [incurredOn, setIncurredOn] = useState(expense?.incurredOn ?? defaultDay)
  const [note, setNote] = useState(expense?.note ?? '')

  const parsed = parseDecimal(amount)
  const valid = parsed !== null && parsed >= 1 && incurredOn !== ''

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!valid) return
    const input = { category, amount: parsed, incurredOn, note: note.trim() }
    if (expense) update.mutate({ id: expense.id, input }, { onSuccess: onDone })
    else create.mutate(input, { onSuccess: onDone })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]" noValidate>
      <SheetHeader className="px-0">
        <SheetTitle>{expense ? 'Sửa khoản chi' : 'Thêm khoản chi'}</SheetTitle>
      </SheetHeader>

      <div className="flex flex-col gap-2">
        <Label id="expense-category-label">Nhóm</Label>
        <div role="group" aria-labelledby="expense-category-label" className="grid grid-cols-2 gap-2">
          {EXPENSE_CATEGORY_OPTIONS.map((option) => (
            <Button
              key={option}
              type="button"
              variant={category === option ? 'default' : 'outline'}
              aria-pressed={category === option}
              className="min-h-11"
              onClick={() => setCategory(option)}
            >
              {EXPENSE_CATEGORY_LABEL[option]}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="expense-amount">Số tiền (₫)</Label>
        <Input id="expense-amount" inputMode="decimal" autoComplete="off" className="h-11 text-base" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="expense-day">Ngày chi</Label>
        <Input id="expense-day" type="date" required className="h-11 text-base" value={incurredOn} onChange={(e) => setIncurredOn(e.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="expense-note">Ghi chú</Label>
        <Input id="expense-note" maxLength={200} autoComplete="off" className="h-11 text-base" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {mutation.error.message}
        </p>
      )}
      <Button type="submit" className="min-h-11 w-full" disabled={mutation.isPending || !valid}>
        {mutation.isPending && <Loader2 className="animate-spin" />}
        {expense ? 'Lưu thay đổi' : 'Thêm khoản chi'}
      </Button>
    </form>
  )
}
