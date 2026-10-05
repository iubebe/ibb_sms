import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { API_ROUTES } from '@/api/routes'
import type { CreateUserInput, ManagedUser, UpdateUserInput } from '@/api/types'

export async function getUsers() {
  const { data } = await apiClient.get<ManagedUser[]>(API_ROUTES.users.list)
  return data
}

export async function createUser(input: CreateUserInput) {
  const { data } = await apiClient.post<ManagedUser>(API_ROUTES.users.list, input)
  return data
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const { data } = await apiClient.patch<ManagedUser>(API_ROUTES.users.detail(id), input)
  return data
}

export async function resetUserPassword(id: string, password: string) {
  await apiClient.post(API_ROUTES.users.resetPassword(id), { password })
}

export async function deleteUser(id: string) {
  await apiClient.delete(API_ROUTES.users.detail(id))
}

export function useUsers() {
  return useQuery({ queryKey: queryKeys.users.all, queryFn: getUsers })
}

/** Account changes also change names/rows in the attendance report. */
function useInvalidateUsers() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all }),
    ])
}

export function useCreateUser() {
  const invalidate = useInvalidateUsers()
  return useMutation({ mutationFn: createUser, onSuccess: invalidate })
}

export function useUpdateUser() {
  const invalidate = useInvalidateUsers()
  return useMutation({
    mutationFn: (v: { id: string; input: UpdateUserInput }) => updateUser(v.id, v.input),
    onSuccess: invalidate,
  })
}

export function useResetUserPassword() {
  const invalidate = useInvalidateUsers()
  return useMutation({
    mutationFn: (v: { id: string; password: string }) => resetUserPassword(v.id, v.password),
    onSuccess: invalidate,
  })
}

export function useDeleteUser() {
  const invalidate = useInvalidateUsers()
  return useMutation({ mutationFn: deleteUser, onSuccess: invalidate })
}
