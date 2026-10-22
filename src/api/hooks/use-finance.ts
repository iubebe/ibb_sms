import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { API_ROUTES } from '@/api/routes'
import type { Expense, ExpenseInput, FinanceSummary } from '@/api/types'

export async function getFinanceSummary(from: string, to: string) {
  const { data } = await apiClient.get<FinanceSummary>(API_ROUTES.finance.summary, { params: { from, to } })
  return data
}

/** Excel report (tables and charts) for `[from, to)`. */
export async function exportFinance(range: { from: string; to: string }) {
  const { data } = await apiClient.get<Blob>(API_ROUTES.finance.export, {
    params: range,
    responseType: 'blob',
    timeout: 60_000,
  })
  return data
}

export async function getExpenses(from: string, to: string) {
  const { data } = await apiClient.get<Expense[]>(API_ROUTES.finance.expenses, { params: { from, to } })
  return data
}

export async function createExpense(input: ExpenseInput) {
  const { data } = await apiClient.post<Expense>(API_ROUTES.finance.expenses, input)
  return data
}

export async function updateExpense(id: string, input: Partial<ExpenseInput>) {
  const { data } = await apiClient.patch<Expense>(API_ROUTES.finance.expense(id), input)
  return data
}

export async function deleteExpense(id: string) {
  await apiClient.delete(API_ROUTES.finance.expense(id))
}

/** `from`/`to` are `YYYY-MM-DD`, `[from, to)` in the shop timezone. */
export function useFinanceSummary(from: string, to: string) {
  return useQuery({ queryKey: queryKeys.finance.summary(from, to), queryFn: () => getFinanceSummary(from, to) })
}

export function useExportFinance() {
  return useMutation({ mutationFn: exportFinance })
}

export function useExpenses(from: string, to: string) {
  return useQuery({ queryKey: queryKeys.finance.expenses(from, to), queryFn: () => getExpenses(from, to) })
}

/** Expenses feed the summary too, so every finance query is refreshed. */
function useInvalidateFinance() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.finance.all })
}

export function useCreateExpense() {
  const invalidate = useInvalidateFinance()
  return useMutation({ mutationFn: createExpense, onSuccess: invalidate })
}

export function useUpdateExpense() {
  const invalidate = useInvalidateFinance()
  return useMutation({
    mutationFn: (v: { id: string; input: Partial<ExpenseInput> }) => updateExpense(v.id, v.input),
    onSuccess: invalidate,
  })
}

export function useDeleteExpense() {
  const invalidate = useInvalidateFinance()
  return useMutation({ mutationFn: deleteExpense, onSuccess: invalidate })
}
