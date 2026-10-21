import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { API_ROUTES } from '@/api/routes'
import type { AtRiskItem, WriteOff, WriteOffInput } from '@/api/types'

export async function getAtRiskItems() {
  const { data } = await apiClient.get<AtRiskItem[]>(API_ROUTES.stock.writeOffsAtRisk)
  return data
}

export async function getWriteOffs(from: string, to: string) {
  const { data } = await apiClient.get<WriteOff[]>(API_ROUTES.stock.writeOffs, { params: { from, to } })
  return data
}

export async function getPendingWriteOffs() {
  const { data } = await apiClient.get<WriteOff[]>(API_ROUTES.stock.writeOffsPending)
  return data
}

export async function getMyWriteOffs() {
  const { data } = await apiClient.get<WriteOff[]>(API_ROUTES.stock.writeOffsMine)
  return data
}

/** Admin: removes the stock at once. */
export async function createWriteOff(input: WriteOffInput) {
  const { data } = await apiClient.post<WriteOff>(API_ROUTES.stock.writeOffs, input)
  return data
}

/** Staff: waits for an admin; stock is not changed. */
export async function proposeWriteOff(input: WriteOffInput) {
  const { data } = await apiClient.post<WriteOff>(API_ROUTES.stock.writeOffProposals, input)
  return data
}

export async function cancelWriteOffProposal(id: string) {
  await apiClient.delete(API_ROUTES.stock.writeOff(id))
}

export async function confirmWriteOff(id: string, quantity?: number) {
  const { data } = await apiClient.post<WriteOff>(API_ROUTES.stock.writeOffConfirm(id), quantity === undefined ? {} : { quantity })
  return data
}

export async function rejectWriteOff(id: string, reason: string) {
  const { data } = await apiClient.post<WriteOff>(API_ROUTES.stock.writeOffReject(id), { reason })
  return data
}

export function useAtRiskItems() {
  return useQuery({ queryKey: queryKeys.stock.atRisk, queryFn: getAtRiskItems })
}

/** `from`/`to` are ISO bounds of `[from, to)`. */
export function useWriteOffs(from: string, to: string) {
  return useQuery({ queryKey: queryKeys.stock.writeOffs(from, to), queryFn: () => getWriteOffs(from, to) })
}

export function usePendingWriteOffs() {
  return useQuery({ queryKey: queryKeys.stock.writeOffsPending, queryFn: getPendingWriteOffs })
}

export function useMyWriteOffs() {
  return useQuery({ queryKey: queryKeys.stock.writeOffsMine, queryFn: getMyWriteOffs })
}

/** A write-off lowers stock and shows up as a finance loss, so both go stale. */
function useRefreshAfterStockChange() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['stock'] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all }),
    ])
}

export function useCreateWriteOff() {
  const refresh = useRefreshAfterStockChange()
  return useMutation({ mutationFn: createWriteOff, onSuccess: refresh })
}

export function useProposeWriteOff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: proposeWriteOff,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stock', 'write-offs'] }),
  })
}

export function useCancelWriteOffProposal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelWriteOffProposal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stock', 'write-offs'] }),
  })
}

export function useConfirmWriteOff() {
  const refresh = useRefreshAfterStockChange()
  return useMutation({
    mutationFn: (v: { id: string; quantity?: number }) => confirmWriteOff(v.id, v.quantity),
    onSuccess: refresh,
  })
}

export function useRejectWriteOff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: string; reason: string }) => rejectWriteOff(v.id, v.reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stock', 'write-offs'] }),
  })
}
