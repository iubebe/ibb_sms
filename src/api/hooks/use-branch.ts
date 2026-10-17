import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { API_ROUTES } from '@/api/routes'
import type { Branch, BranchInput } from '@/api/types'

export async function getBranch() {
  const { data } = await apiClient.get<Branch>(API_ROUTES.branch)
  return data
}

export async function updateBranch(input: BranchInput) {
  const { data } = await apiClient.patch<Branch>(API_ROUTES.branch, input)
  return data
}

/** The shop name/address. Rarely changes, so keep it fresh for a long while. */
export function useBranch() {
  return useQuery({ queryKey: queryKeys.branch, queryFn: getBranch, staleTime: 10 * 60_000 })
}

export function useUpdateBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateBranch,
    onSuccess: (branch) => queryClient.setQueryData(queryKeys.branch, branch),
  })
}
