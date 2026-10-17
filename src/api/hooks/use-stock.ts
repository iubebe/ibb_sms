import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { API_ROUTES } from '@/api/routes'
import type {
  ImportInput,
  ImportReceipt,
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stock'] }),
  })
}
