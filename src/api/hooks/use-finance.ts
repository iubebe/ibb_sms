import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { API_ROUTES } from '@/api/routes'
import type { BreakEven, Expense, ExpenseInput, FinanceSummary, Investment, InvestmentInput, RoiSummary } from '@/api/types'

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

export async function getRoi(from: string, to: string) {
  const { data } = await apiClient.get<RoiSummary>(API_ROUTES.finance.roi, { params: { from, to } })
  return data
}

export async function getInvestments() {
  const { data } = await apiClient.get<Investment[]>(API_ROUTES.finance.investments)
  return data
}

export async function createInvestment(input: InvestmentInput) {
  const { data } = await apiClient.post<Investment>(API_ROUTES.finance.investments, input)
  return data
}

export async function updateInvestment(id: string, input: Partial<InvestmentInput>) {
  const { data } = await apiClient.patch<Investment>(API_ROUTES.finance.investment(id), input)
  return data
}

export async function deleteInvestment(id: string) {
  await apiClient.delete(API_ROUTES.finance.investment(id))
}

/** ROI of `[from, to)` over the capital invested before `to`. */
export function useRoi(from: string, to: string) {
  return useQuery({ queryKey: queryKeys.finance.roi(from, to), queryFn: () => getRoi(from, to) })
}

export function useInvestments() {
  return useQuery({ queryKey: queryKeys.finance.investments, queryFn: getInvestments })
}

export function useCreateInvestment() {
  const invalidate = useInvalidateFinance()
  return useMutation({ mutationFn: createInvestment, onSuccess: invalidate })
}

export function useUpdateInvestment() {
  const invalidate = useInvalidateFinance()
  return useMutation({
    mutationFn: (v: { id: string; input: Partial<InvestmentInput> }) => updateInvestment(v.id, v.input),
    onSuccess: invalidate,
  })
}

export function useDeleteInvestment() {
  const invalidate = useInvalidateFinance()
  return useMutation({ mutationFn: deleteInvestment, onSuccess: invalidate })
}

export async function getBreakEven(from: string, to: string) {
  const { data } = await apiClient.get<BreakEven>(API_ROUTES.finance.breakEven, { params: { from, to } })
  return data
}

/** Break-even and suggested KPIs of `[from, to)`. */
export function useBreakEven(from: string, to: string) {
  return useQuery({ queryKey: queryKeys.finance.breakEven(from, to), queryFn: () => getBreakEven(from, to) })
}
