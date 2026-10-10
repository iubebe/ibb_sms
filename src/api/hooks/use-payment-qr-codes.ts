import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { API_ROUTES } from '@/api/routes'
import type { PaymentQrCode } from '@/api/types'

export interface PaymentQrCodeFields {
  label?: string
  isActive?: boolean
}

export async function listPaymentQrCodes() {
  const { data } = await apiClient.get<PaymentQrCode[]>(API_ROUTES.paymentQrCodes.list)
  return data
}

/** Multipart: field `image` plus `label`. The backend stores the image and creates an active code. */
export async function createPaymentQrCode(input: { label: string; image: Blob }) {
  const body = new FormData()
  body.append('label', input.label)
  body.append('image', input.image, 'qr.jpg')
  const { data } = await apiClient.post<PaymentQrCode>(API_ROUTES.paymentQrCodes.create, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30_000,
  })
  return data
}

export async function updatePaymentQrCode(id: string, input: PaymentQrCodeFields) {
  const { data } = await apiClient.patch<PaymentQrCode>(API_ROUTES.paymentQrCodes.update(id), input)
  return data
}

/** Multipart field `image`. Replaces the stored image and deletes the old object. */
export async function replacePaymentQrImage(id: string, image: Blob) {
  const body = new FormData()
  body.append('image', image, 'qr.jpg')
  const { data } = await apiClient.post<PaymentQrCode>(API_ROUTES.paymentQrCodes.image(id), body, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30_000,
  })
  return data
}

export async function deletePaymentQrCode(id: string) {
  await apiClient.delete(API_ROUTES.paymentQrCodes.remove(id))
}

export function usePaymentQrCodeList() {
  return useQuery({
    queryKey: queryKeys.paymentQrCodes.all,
    queryFn: listPaymentQrCodes,
  })
}

/** Changes made here also refresh the checkout list (`orders.paymentQrCodes`). */
function useInvalidatePaymentQr() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentQrCodes.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.paymentQrCodes }),
    ])
}

export function useCreatePaymentQrCode() {
  const invalidate = useInvalidatePaymentQr()
  return useMutation({ mutationFn: createPaymentQrCode, onSuccess: invalidate })
}

export function useUpdatePaymentQrCode() {
  const invalidate = useInvalidatePaymentQr()
  return useMutation({
    mutationFn: (v: { id: string; input: PaymentQrCodeFields }) => updatePaymentQrCode(v.id, v.input),
    onSuccess: invalidate,
  })
}

export function useReplacePaymentQrImage() {
  const invalidate = useInvalidatePaymentQr()
  return useMutation({
    mutationFn: (v: { id: string; image: Blob }) => replacePaymentQrImage(v.id, v.image),
    onSuccess: invalidate,
  })
}

export function useDeletePaymentQrCode() {
  const invalidate = useInvalidatePaymentQr()
  return useMutation({ mutationFn: deletePaymentQrCode, onSuccess: invalidate })
}
