import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { API_ROUTES } from '@/api/routes'
import type { AuthUser, ChangePasswordInput, LoginInput } from '@/api/types'

export async function getMe() {
  const { data } = await apiClient.get<AuthUser>(API_ROUTES.auth.me)
  return data
}

export async function login(input: LoginInput) {
  const { data } = await apiClient.post<{ user: AuthUser }>(API_ROUTES.auth.login, input)
  return data.user
}

export async function logout() {
  await apiClient.post(API_ROUTES.auth.logout)
}

export async function changePassword(input: ChangePasswordInput) {
  const { data } = await apiClient.post<{ user: AuthUser }>(API_ROUTES.auth.changePassword, input)
  return data.user
}

/** Current user; 401 (after the one refresh attempt) means "not logged in". */
export function useMe() {
  return useQuery({ queryKey: queryKeys.auth.me, queryFn: getMe, retry: false, staleTime: 5 * 60_000 })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: login,
    onSuccess: (user) => queryClient.setQueryData(queryKeys.auth.me, user),
  })
}

export function useChangePassword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: changePassword,
    onSuccess: (user) => queryClient.setQueryData(queryKeys.auth.me, user),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logout,
    // Server session ends even if the call failed (cookies are cleared or expired).
    onSettled: () => {
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'auth' })
      queryClient.setQueryData(queryKeys.auth.me, null)
    },
  })
}
