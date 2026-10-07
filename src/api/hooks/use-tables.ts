import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { API_ROUTES } from '@/api/routes'
import type { DiningTable, TableInput, TableQrPdfOptions } from '@/api/types'

export async function getTables() {
  const { data } = await apiClient.get<DiningTable[]>(API_ROUTES.tables.list)
  return data
}

export async function createTable(input: TableInput) {
  const { data } = await apiClient.post<DiningTable>(API_ROUTES.tables.list, input)
  return data
}

export async function updateTable(id: string, input: TableInput) {
  const { data } = await apiClient.patch<DiningTable>(API_ROUTES.tables.detail(id), input)
  return data
}

export async function regenerateTableQr(id: string) {
  const { data } = await apiClient.post<DiningTable>(API_ROUTES.tables.regenerateQr(id))
  return data
}

export async function deleteTable(id: string) {
  await apiClient.delete(API_ROUTES.tables.detail(id))
}

export async function getTableQrPdf(options: TableQrPdfOptions) {
  const { data } = await apiClient.get<Blob>(API_ROUTES.tables.qrPdf, {
    params: options,
    responseType: 'blob',
    timeout: 60_000,
  })
  return data
}

export function useTables() {
  return useQuery({ queryKey: queryKeys.tables.all, queryFn: getTables })
}

function useInvalidateTables() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.tables.all })
}

export function useCreateTable() {
  const invalidate = useInvalidateTables()
  return useMutation({ mutationFn: createTable, onSuccess: invalidate })
}

export function useUpdateTable() {
  const invalidate = useInvalidateTables()
  return useMutation({
    mutationFn: (v: { id: string; input: TableInput }) => updateTable(v.id, v.input),
    onSuccess: invalidate,
  })
}

export function useRegenerateTableQr() {
  const invalidate = useInvalidateTables()
  return useMutation({ mutationFn: regenerateTableQr, onSuccess: invalidate })
}

export function useDeleteTable() {
  const invalidate = useInvalidateTables()
  return useMutation({ mutationFn: deleteTable, onSuccess: invalidate })
}

export function useTableQrPdf() {
  return useMutation({ mutationFn: getTableQrPdf })
}
