import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { API_ROUTES } from '@/api/routes'
import type { Product, ProductInput } from '@/api/types'

export async function getProducts() {
  const { data } = await apiClient.get<Product[]>(API_ROUTES.products.list)
  return data
}

export async function createProduct(input: ProductInput) {
  const { data } = await apiClient.post<Product>(API_ROUTES.products.list, input)
  return data
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const { data } = await apiClient.patch<Product>(API_ROUTES.products.detail(id), input)
  return data
}

/** Sends the image as multipart field `image`; the backend stores it and sets `imageUrl`. */
export async function uploadProductImage(id: string, image: Blob) {
  const body = new FormData()
  body.append('image', image, 'image.jpg')
  // The client defaults to JSON, which would serialize the FormData as JSON. Longer
  // timeout than usual because the image goes over mobile data.
  const { data } = await apiClient.post<Product>(API_ROUTES.products.image(id), body, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30_000,
  })
  return data
}

export async function deleteProduct(id: string) {
  await apiClient.delete(API_ROUTES.products.detail(id))
}

/** All products of the branch, inactive ones included. */
export function useProducts() {
  return useQuery({ queryKey: queryKeys.products.all, queryFn: getProducts })
}

/** Product changes also change the per-category counts. */
function useInvalidateCatalog() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
    ])
}

export function useCreateProduct() {
  const invalidate = useInvalidateCatalog()
  return useMutation({ mutationFn: createProduct, onSuccess: invalidate })
}

export function useUpdateProduct() {
  const invalidate = useInvalidateCatalog()
  return useMutation({
    mutationFn: (v: { id: string; input: Partial<ProductInput> }) => updateProduct(v.id, v.input),
    onSuccess: invalidate,
  })
}

export function useUploadProductImage() {
  const invalidate = useInvalidateCatalog()
  return useMutation({
    mutationFn: (v: { id: string; image: Blob }) => uploadProductImage(v.id, v.image),
    onSuccess: invalidate,
  })
}

export function useDeleteProduct() {
  const invalidate = useInvalidateCatalog()
  return useMutation({ mutationFn: deleteProduct, onSuccess: invalidate })
}
