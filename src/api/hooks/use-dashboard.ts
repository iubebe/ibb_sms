import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { API_ROUTES } from '@/api/routes'
import type { Dashboard } from '@/api/types'

export async function getDashboard() {
  const { data } = await apiClient.get<Dashboard>(API_ROUTES.dashboard)
  return data
}

/** Today's figures. Polls until the backend pushes order events over the WebSocket. */
export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboard,
    staleTime: 5_000,
    refetchInterval: 15_000,
  })
}
