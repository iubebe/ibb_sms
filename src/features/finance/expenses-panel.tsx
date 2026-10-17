import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useDeleteExpense, useExpenses } from '@/api/hooks'
import type { Expense } from '@/api/types'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/format-price'
import { formatMonth, monthOf } from '@/lib/format-time'
import { ExpenseFormSheet } from './expense-form-sheet'
import { EXPENSE_CATEGORY_LABEL, formatShortDay } from './finance-labels'

/** Operating costs (rent, water, electricity, ...) entered by hand. */
export function ExpensesPanel({ from, to, month }: { from: string; to: string; month: string }) {
  const expenses = useExpenses(from, to)
  const remove = useDeleteExpense()
  const [form, setForm] = useState<{ expense: Expense | null; day: string } | null>(null)
  const [toDelete, setToDelete] = useState<Expense | null>(null)
  const total = expenses.data?.reduce((sum, e) => sum + e.amount, 0) ?? 0

  /** A new expense defaults to today when viewing this month, else the month's first day. */
  function defaultDay() {
    const today = new Date()
    return monthOf(today) === month ? `${month}-${String(today.getDate()).padStart(2, '0')}` : from
  }

  function closeDelete() {
    setToDelete(null)
    remove.reset()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button className="min-h-11" onClick={() => setForm({ expense: null, day: defaultDay() })}>
          <Plus />
          Thêm khoản chi
        </Button>
        {expenses.data && expenses.data.length > 0 && (
          <p className="text-sm text-muted-foreground sm:ml-auto">
            {expenses.data.length} khoản · tổng <span className="font-semibold text-foreground">{formatPrice(total)}</span>
          </p>
        )}
      </div>

      {expenses.isPending && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      )}

      {expenses.isError && (
        <div role="alert" className="flex flex-col items-start gap-2 text-sm">
          <p className="text-destructive">{expenses.error.message}</p>
          <Button variant="outline" className="min-h-11" onClick={() => void expenses.refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {expenses.data?.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">Chưa có khoản chi trong {formatMonth(month).toLowerCase()}.</p>
      )}

      <ul className="flex flex-col gap-2">
        {expenses.data?.map((expense) => (
          <li key={expense.id} className="flex items-center gap-2 rounded-xl border bg-card p-3 text-card-foreground">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{EXPENSE_CATEGORY_LABEL[expense.category]}</p>
              <p className="truncate text-xs text-muted-foreground">
                {formatShortDay(expense.incurredOn)}
                {expense.note ? ` · ${expense.note}` : ''}
                {expense.createdByName ? ` · ${expense.createdByName}` : ''}
              </p>
            </div>
            <p className="font-semibold tabular-nums">{formatPrice(expense.amount)}</p>
            <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label="Sửa" onClick={() => setForm({ expense, day: expense.incurredOn })}>
              <Pencil />
            </Button>
            <Button variant="ghost" size="icon" className="min-h-11 min-w-11 text-destructive" aria-label="Xóa" onClick={() => setToDelete(expense)}>
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>

      <ExpenseFormSheet expense={form?.expense ?? null} open={!!form} defaultDay={form?.day ?? from} onClose={() => setForm(null)} />
      <ConfirmDeleteDialog
        open={!!toDelete}
        title={`Xóa khoản chi ${toDelete ? EXPENSE_CATEGORY_LABEL[toDelete.category].toLowerCase() : ''}?`}
        description="Khoản chi sẽ bị xóa khỏi báo cáo tài chính."
        pending={remove.isPending}
        error={remove.isError ? remove.error.message : null}
        onClose={closeDelete}
        onConfirm={() => toDelete && remove.mutate(toDelete.id, { onSuccess: closeDelete })}
      />
    </div>
  )
}
