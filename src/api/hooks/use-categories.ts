import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { API_ROUTES } from '@/api/routes'
import type { Category, CategoryInput } from '@/api/types'

export async function getCategories() {
  const { data } = await apiClient.get<Category[]>(API_ROUTES.categories.list)
  return data
}

export async function createCategory(input: CategoryInput) {
  const { data } = await apiClient.post<Category>(API_ROUTES.categories.list, input)
  return data
}

export async function updateCategory(id: string, input: CategoryInput) {
  const { data } = await apiClient.patch<Category>(API_ROUTES.categories.detail(id), input)
  return data
}

export async function deleteCategory(id: string) {
  await apiClient.delete(API_ROUTES.categories.detail(id))
}

export function useCategories() {
  return useQuery({ queryKey: queryKeys.categories.all, queryFn: getCategories })
}

/** Category changes also change product rows (category removed -> products uncategorized). */
function useInvalidateCatalog() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
    ])
}

export function useCreateCategory() {
  const invalidate = useInvalidateCatalog()
  return useMutation({ mutationFn: createCategory, onSuccess: invalidate })
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCatalog()
  return useMutation({
    mutationFn: (v: { id: string; input: CategoryInput }) => updateCategory(v.id, v.input),
    onSuccess: invalidate,
  })
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCatalog()
  return useMutation({ mutationFn: deleteCategory, onSuccess: invalidate })
}
