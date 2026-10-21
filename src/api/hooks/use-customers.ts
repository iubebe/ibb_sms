import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { API_ROUTES } from '@/api/routes'
import type { Customer, CustomerInput, CustomerLookup } from '@/api/types'

export async function getCustomers(search: string) {
  const { data } = await apiClient.get<Customer[]>(API_ROUTES.customers.list, {
    params: { search: search || undefined },
  })
  return data
}

/** Exact match on phone; `null` when no customer has it. */
export async function lookupCustomerByPhone(phone: string) {
  const { data } = await apiClient.get<{ customer: CustomerLookup | null }>(API_ROUTES.customers.lookup, {
    params: { phone },
  })
  return data.customer
}

export async function updateCustomer(id: string, input: CustomerInput) {
  const { data } = await apiClient.patch<Customer>(API_ROUTES.customers.detail(id), input)
  return data
}

export async function deleteCustomer(id: string) {
  await apiClient.delete(API_ROUTES.customers.detail(id))
}

/** Admin only. `search` matches name, phone or address on the server. */
export function useCustomers(search: string) {
  return useQuery({ queryKey: queryKeys.customers.list(search), queryFn: () => getCustomers(search) })
}

/** On demand (a mutation, not a query): runs only when staff press "Tìm". */
export function useLookupCustomer() {
  return useMutation({ mutationFn: lookupCustomerByPhone })
}

function useInvalidateCustomers() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.customers.all })
}

export function useUpdateCustomer() {
  const invalidate = useInvalidateCustomers()
  return useMutation({
    mutationFn: (v: { id: string; input: CustomerInput }) => updateCustomer(v.id, v.input),
    onSuccess: invalidate,
  })
}

export function useDeleteCustomer() {
  const invalidate = useInvalidateCustomers()
  return useMutation({ mutationFn: deleteCustomer, onSuccess: invalidate })
}
