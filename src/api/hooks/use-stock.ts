import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { env } from '@/config/env'
import { queryKeys } from '@/api/query-keys'
import { API_ROUTES } from '@/api/routes'
import type {
  ImportDraftInput,
  ImportInput,
  ImportReceipt,
  StockItemOption,
  StockItem,
  StockItemInput,
  StockItemUpdate,
  StockMovement,
  Supplier,
  SupplierInput,
} from '@/api/types'

export async function getStockItems() {
  const { data } = await apiClient.get<StockItem[]>(API_ROUTES.stock.items)
  return data
}

export async function createStockItem(input: StockItemInput) {
  const { data } = await apiClient.post<StockItem>(API_ROUTES.stock.items, input)
  return data
}

export async function updateStockItem(id: string, input: StockItemUpdate) {
  const { data } = await apiClient.patch<StockItem>(API_ROUTES.stock.item(id), input)
  return data
}

export async function deleteStockItem(id: string) {
  await apiClient.delete(API_ROUTES.stock.item(id))
}

export async function adjustStockItem(id: string, input: { change: number; note: string }) {
  const { data } = await apiClient.post<StockItem>(API_ROUTES.stock.adjust(id), input)
  return data
}

export async function getStockMovements(id: string) {
  const { data } = await apiClient.get<StockMovement[]>(API_ROUTES.stock.movements(id))
  return data
}

export async function getSuppliers() {
  const { data } = await apiClient.get<Supplier[]>(API_ROUTES.stock.suppliers)
  return data
}

export async function createSupplier(input: SupplierInput) {
  const { data } = await apiClient.post<Supplier>(API_ROUTES.stock.suppliers, input)
  return data
}

export async function updateSupplier(id: string, input: SupplierInput) {
  const { data } = await apiClient.patch<Supplier>(API_ROUTES.stock.supplier(id), input)
  return data
}

export async function deleteSupplier(id: string) {
  await apiClient.delete(API_ROUTES.stock.supplier(id))
}

export async function getImports(from: string, to: string) {
  const { data } = await apiClient.get<ImportReceipt[]>(API_ROUTES.stock.imports, { params: { from, to } })
  return data
}

export async function createImport(input: ImportInput) {
  const { data } = await apiClient.post<ImportReceipt>(API_ROUTES.stock.imports, input)
  return data
}

/** Authenticated image endpoint; the cookie authorizes the `<img>` request. */
export function importImageUrl(id: string): string {
  return `${env.apiUrl}${API_ROUTES.stock.importImage(id)}`
}

export async function getStockItemOptions() {
  const { data } = await apiClient.get<StockItemOption[]>(API_ROUTES.stock.itemOptions)
  return data
}

export async function getMyImports() {
  const { data } = await apiClient.get<ImportReceipt[]>(API_ROUTES.stock.importsMine)
  return data
}

/** Multipart: `image`, `lines` (JSON string), optional `supplierId`/`note`. Does not change stock. */
export async function createImportDraft(input: ImportDraftInput) {
  const body = new FormData()
  body.append('image', input.image, 'import.jpg')
  body.append('lines', JSON.stringify(input.lines))
  if (input.supplierId) body.append('supplierId', input.supplierId)
  if (input.note) body.append('note', input.note)
  const { data } = await apiClient.post<ImportReceipt>(API_ROUTES.stock.importDrafts, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30_000,
  })
  return data
}

export async function cancelImportDraft(id: string) {
  await apiClient.delete(API_ROUTES.stock.import(id))
}

export async function confirmImport(id: string, lines?: ImportInput['lines']) {
  const { data } = await apiClient.post<ImportReceipt>(API_ROUTES.stock.importConfirm(id), lines ? { lines } : {})
  return data
}

export async function rejectImport(id: string, reason: string) {
  const { data } = await apiClient.post<ImportReceipt>(API_ROUTES.stock.importReject(id), { reason })
  return data
}

export function useStockItemOptions() {
  return useQuery({ queryKey: queryKeys.stock.itemOptions, queryFn: getStockItemOptions })
}

export function useMyImports() {
  return useQuery({ queryKey: queryKeys.stock.myImports, queryFn: getMyImports })
}

export function useCreateImportDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createImportDraft,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stock', 'imports'] }),
  })
}

export function useCancelImportDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelImportDraft,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stock', 'imports'] }),
  })
}

/** Confirming adds stock, so everything under `stock` and the finance summary go stale. */
export function useConfirmImport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: string; lines?: ImportInput['lines'] }) => confirmImport(v.id, v.lines),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['stock'] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.all }),
      ]),
  })
}

export function useRejectImport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: string; reason: string }) => rejectImport(v.id, v.reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stock', 'imports'] }),
  })
}

export function useStockItems() {
  return useQuery({ queryKey: queryKeys.stock.items, queryFn: getStockItems })
}

export function useStockMovements(id: string | null) {
  return useQuery({
    queryKey: queryKeys.stock.movements(id ?? ''),
    queryFn: () => getStockMovements(id!),
    enabled: !!id,
  })
}

export function useSuppliers() {
  return useQuery({ queryKey: queryKeys.stock.suppliers, queryFn: getSuppliers })
}

/** `from`/`to` are ISO bounds of `[from, to)`. */
export function useImports(from: string, to: string) {
  return useQuery({ queryKey: queryKeys.stock.imports(from, to), queryFn: () => getImports(from, to) })
}

export function useCreateStockItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createStockItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.stock.items }),
  })
}

export function useUpdateStockItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: string; input: StockItemUpdate }) => updateStockItem(v.id, v.input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.stock.items }),
  })
}

export function useDeleteStockItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteStockItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.stock.items }),
  })
}

export function useAdjustStockItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: string; change: number; note: string }) =>
      adjustStockItem(v.id, { change: v.change, note: v.note }),
    onSuccess: (_item, v) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.stock.items })
      void queryClient.invalidateQueries({ queryKey: queryKeys.stock.movements(v.id) })
    },
  })
}

function useInvalidateSuppliers() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.stock.suppliers })
    // Receipts embed the supplier name.
    void queryClient.invalidateQueries({ queryKey: queryKeys.stock.allImports })
  }
}

export function useCreateSupplier() {
  const invalidate = useInvalidateSuppliers()
  return useMutation({ mutationFn: createSupplier, onSuccess: invalidate })
}

export function useUpdateSupplier() {
  const invalidate = useInvalidateSuppliers()
  return useMutation({
    mutationFn: (v: { id: string; input: SupplierInput }) => updateSupplier(v.id, v.input),
    onSuccess: invalidate,
  })
}

export function useDeleteSupplier() {
  const invalidate = useInvalidateSuppliers()
  return useMutation({ mutationFn: deleteSupplier, onSuccess: invalidate })
}

/** Creating a receipt changes stock levels and the movement ledger too. */
export function useCreateImport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createImport,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['stock'] }),
        // Import cost is part of the finance summary.
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.all }),
      ]),
  })
}
