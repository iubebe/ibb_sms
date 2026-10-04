import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { API_ROUTES } from '@/api/routes'
import type { OrderStatus, ServedItem, StaffOrder } from '@/api/types'

export async function getOrders(status?: OrderStatus) {
  const { data } = await apiClient.get<StaffOrder[]>(API_ROUTES.orders.list, { params: { status } })
  return data
}

/** Sets the absolute served count (idempotent, safe to retry). */
export async function setItemServed(orderId: string, itemId: string, servedQuantity: number) {
  const { data } = await apiClient.patch<ServedItem>(API_ROUTES.orders.served(orderId, itemId), {
    servedQuantity,
  })
  return data
}

/** `useOrders('confirmed')` is the serving queue. */
export function useOrders(status?: OrderStatus) {
  return useQuery({ queryKey: queryKeys.orders.list(status), queryFn: () => getOrders(status) })
}

export function useSetServed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (v: { orderId: string; itemId: string; servedQuantity: number }) =>
      setItemServed(v.orderId, v.itemId, v.servedQuantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders.all }),
  })
}
