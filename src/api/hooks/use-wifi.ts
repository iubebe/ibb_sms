import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { env } from '@/config/env'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { API_ROUTES } from '@/api/routes'
import type { WifiNetwork, WifiSecurity } from '@/api/types'

/** Sent once; the backend keeps only the QR image, never the password. */
export interface WifiCredentialsInput {
  ssid: string
  security: WifiSecurity
  password?: string
  hidden: boolean
}

/** Admin-only, `no-store` image (it encodes the password). `version` busts the browser cache after a rotation. */
export function wifiImageUrl(id: string, version: string): string {
  return `${env.apiUrl}${API_ROUTES.wifi.image(id)}?v=${encodeURIComponent(version)}`
}

export function useWifiList() {
  return useQuery({
    queryKey: queryKeys.wifi.all,
    queryFn: async () => (await apiClient.get<WifiNetwork[]>(API_ROUTES.wifi.list)).data,
    // Keep nothing around: the list drives images of a secret.
    gcTime: 0,
  })
}

function useInvalidateWifi() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.wifi.all })
}

/**
 * `gcTime: 0` on credential mutations: react-query keeps a mutation's variables
 * (the password) in memory until it is garbage collected.
 */
export function useCreateWifi() {
  const invalidate = useInvalidateWifi()
  return useMutation({
    gcTime: 0,
    mutationFn: async (input: WifiCredentialsInput) =>
      (await apiClient.post<WifiNetwork>(API_ROUTES.wifi.create, input)).data,
    onSuccess: invalidate,
  })
}

export function useReplaceWifiCredentials() {
  const invalidate = useInvalidateWifi()
  return useMutation({
    gcTime: 0,
    mutationFn: async (v: { id: string; input: WifiCredentialsInput }) =>
      (await apiClient.put<WifiNetwork>(API_ROUTES.wifi.credentials(v.id), v.input)).data,
    onSuccess: invalidate,
  })
}

export function useSetWifiActive() {
  const invalidate = useInvalidateWifi()
  return useMutation({
    mutationFn: async (v: { id: string; isActive: boolean }) =>
      (await apiClient.patch<WifiNetwork>(API_ROUTES.wifi.update(v.id), { isActive: v.isActive })).data,
    onSuccess: invalidate,
  })
}

export function useDeleteWifi() {
  const invalidate = useInvalidateWifi()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(API_ROUTES.wifi.remove(id))
    },
    onSuccess: invalidate,
  })
}
