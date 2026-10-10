import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { API_ROUTES } from '@/api/routes'
import type { CreateOrderStaffInput, OrderStatus, OrderTransition, PaymentMethod, PaymentQrCode, ServedItem, StaffOrder } from '@/api/types'

export async function getOrders(status?: OrderStatus) {
  const { data } = await apiClient.get<StaffOrder[]>(API_ROUTES.orders.list, { params: { status } })
  return data
}

export async function createOrderForStaff(input: CreateOrderStaffInput) {
  const { data } = await apiClient.post<StaffOrder>(API_ROUTES.orders.create, input)
  return data
}

/** Sets the absolute served count (idempotent, safe to retry). */
export async function setItemServed(orderId: string, itemId: string, servedQuantity: number) {
  const { data } = await apiClient.patch<ServedItem>(API_ROUTES.orders.served(orderId, itemId), {
    servedQuantity,
  })
  return data
}

export async function confirmOrder(orderId: string) {
  const { data } = await apiClient.post<OrderTransition>(API_ROUTES.orders.confirm(orderId))
  return data
}

export async function cancelOrder(orderId: string) {
  const { data } = await apiClient.post<OrderTransition>(API_ROUTES.orders.cancel(orderId))
  return data
}

export async function payOrder(orderId: string, paymentMethod: PaymentMethod) {
  const { data } = await apiClient.post<OrderTransition>(API_ROUTES.orders.pay(orderId), { paymentMethod })
  return data
}

/** `useOrders('confirmed')` is the serving queue. Polls until the backend pushes order events. */
export function useOrders(status?: OrderStatus) {
  return useQuery({
    queryKey: queryKeys.orders.list(status),
    queryFn: () => getOrders(status),
    staleTime: 5_000,
    refetchInterval: 15_000,
  })
}

/** A status change also moves the dashboard counters and revenue. */
function useRefreshAfterOrderChange() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
    ])
}

export function useConfirmOrder() {
  const refresh = useRefreshAfterOrderChange()
  return useMutation({ mutationFn: confirmOrder, onSettled: refresh })
}

export function useCancelOrder() {
  const refresh = useRefreshAfterOrderChange()
  return useMutation({ mutationFn: cancelOrder, onSettled: refresh })
}

export function usePayOrder() {
  const refresh = useRefreshAfterOrderChange()
  return useMutation({
    mutationFn: (v: { orderId: string; paymentMethod: PaymentMethod }) => payOrder(v.orderId, v.paymentMethod),
    onSettled: refresh,
  })
}

export function useSetServed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (v: { orderId: string; itemId: string; servedQuantity: number }) =>
      setItemServed(v.orderId, v.itemId, v.servedQuantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders.all }),
  })
}

export function useCreateOrder() {
  const refresh = useRefreshAfterOrderChange()
  return useMutation({
    mutationFn: createOrderForStaff,
    onSettled: refresh,
  })
}

export function usePaymentQrCodes() {
  return useQuery({
    queryKey: queryKeys.orders.paymentQrCodes,
    queryFn: () => apiClient.get<PaymentQrCode[]>(API_ROUTES.orders.paymentQrCodes).then(r => r.data),
  })
}
