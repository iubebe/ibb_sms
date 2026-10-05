import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { API_ROUTES } from '@/api/routes'

export interface HealthResponse {
  status: 'ok'
}

// Pattern for every resource: a plain method (usable outside React) + a hook that wraps it.
export async function getHealth() {
  const { data } = await apiClient.get<HealthResponse>(API_ROUTES.health)
  return data
}

export function useHealth() {
  return useQuery({ queryKey: queryKeys.health, queryFn: getHealth })
}
