import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { API_ROUTES } from '@/api/routes'
import type { AddOrderItemsInput, BackdatedOrdersInput, BackdatedOrdersResult, OrderImportResult, CreateOrderStaffInput, OrderCustomerInput, OrderStatus, OrderTransition, OrderPaymentQr, PaymentMethod, PaymentQrCode, ServedItem, StaffOrder } from '@/api/types'

export async function getOrders(status?: OrderStatus) {
  const { data } = await apiClient.get<StaffOrder[]>(API_ROUTES.orders.list, { params: { status } })
  return data
}

/** Admin: every order created in `[from, to)` (ISO timestamps). */
export async function getOrderHistory(from: string, to: string) {
  const { data } = await apiClient.get<StaffOrder[]>(API_ROUTES.orders.history, { params: { from, to } })
  return data
}

export async function createOrderForStaff(input: CreateOrderStaffInput) {
  const { data } = await apiClient.post<StaffOrder>(API_ROUTES.orders.create, input)
  return data
}

export async function createBackdatedOrders(input: BackdatedOrdersInput) {
  const { data } = await apiClient.post<BackdatedOrdersResult>(API_ROUTES.orders.backdated, input)
  return data
}

export async function getOrderImportTemplate() {
  const { data } = await apiClient.get<Blob>(API_ROUTES.orders.importTemplate, {
    responseType: 'blob',
    timeout: 60_000,
  })
  return data
}

/** Multipart `file` (.xlsx). All or nothing: a 400 carries `errors` with the row numbers. */
export async function importOrders(file: File) {
  const body = new FormData()
  body.append('file', file)
  const { data } = await apiClient.post<OrderImportResult>(API_ROUTES.orders.import, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60_000,
  })
  return data
}

/** Sets the absolute served count (idempotent, safe to retry). */
export async function setItemServed(orderId: string, itemId: string, servedQuantity: number) {
  const { data } = await apiClient.patch<ServedItem>(API_ROUTES.orders.served(orderId, itemId), {
    servedQuantity,
  })
  return data
}

export async function addOrderItems(orderId: string, input: AddOrderItemsInput) {
  const { data } = await apiClient.post<StaffOrder>(API_ROUTES.orders.addItems(orderId), input)
  return data
}

export async function updateOrderCustomer(orderId: string, input: OrderCustomerInput) {
  const { data } = await apiClient.patch<StaffOrder>(API_ROUTES.orders.customer(orderId), input)
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

/** Order number = first 3-8 hex chars of the order id (the `Số` on the receipt). Any day. */
export const ORDER_NUMBER_PATTERN = /^[0-9a-f]{3,8}$/i

export function useOrderSearch(code: string) {
  return useQuery({
    queryKey: queryKeys.orders.search(code),
    queryFn: () => apiClient.get<StaffOrder[]>(API_ROUTES.orders.search, { params: { code } }).then(r => r.data),
    enabled: ORDER_NUMBER_PATTERN.test(code),
    staleTime: 30_000,
  })
}

export function useOrderHistory(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.orders.history(from, to),
    queryFn: () => getOrderHistory(from, to),
    staleTime: 30_000,
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

export function useAddOrderItems() {
  const refresh = useRefreshAfterOrderChange()
  return useMutation({
    mutationFn: (v: { orderId: string; input: AddOrderItemsInput }) => addOrderItems(v.orderId, v.input),
    onSettled: refresh,
  })
}

/** Also refreshes the customer list: the edit can create or relink a customer. */
export function useUpdateOrderCustomer() {
  const queryClient = useQueryClient()
  const refresh = useRefreshAfterOrderChange()
  return useMutation({
    mutationFn: (v: { orderId: string; input: OrderCustomerInput }) => updateOrderCustomer(v.orderId, v.input),
    onSettled: () =>
      Promise.all([refresh(), queryClient.invalidateQueries({ queryKey: queryKeys.customers.all })]),
  })
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
  const queryClient = useQueryClient()
  const refresh = useRefreshAfterOrderChange()
  return useMutation({
    mutationFn: createOrderForStaff,
    onSettled: () =>
      Promise.all([refresh(), queryClient.invalidateQueries({ queryKey: queryKeys.customers.all })]),
  })
}

export function useCreateBackdatedOrders() {
  const refresh = useRefreshAfterOrderChange()
  return useMutation({ mutationFn: createBackdatedOrders, onSettled: refresh })
}

export function useOrderImportTemplate() {
  return useMutation({ mutationFn: getOrderImportTemplate })
}

export function useImportOrders() {
  const refresh = useRefreshAfterOrderChange()
  return useMutation({ mutationFn: importOrders, onSettled: refresh })
}

/** Transfer QRs with this order's total baked in. Refetched when the total changes. */
export function useOrderPaymentQrs(orderId: string, total: number) {
  return useQuery({
    queryKey: queryKeys.orders.paymentQrs(orderId, total),
    queryFn: () => apiClient.get<OrderPaymentQr[]>(API_ROUTES.orders.paymentQrs(orderId)).then(r => r.data),
  })
}

export function usePaymentQrCodes() {
  return useQuery({
    queryKey: queryKeys.orders.paymentQrCodes,
    queryFn: () => apiClient.get<PaymentQrCode[]>(API_ROUTES.orders.paymentQrCodes).then(r => r.data),
  })
}
