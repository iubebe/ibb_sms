import { Navigate, Outlet, useLocation } from 'react-router'
import { ApiError } from '@/api/client'
import { useLogout, useMe } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AppShell } from '@/features/shell/app-shell'
import { useRealtimeConnection } from '@/ws/use-socket'

/** Where `ProtectedRoute` sent the user from, so login can send them back. */
export interface LoginRedirectState {
  from?: string
}

type Gate = ReturnType<typeof useGate>

function useGate() {
  const me = useMe()
  const user = me.data ?? null
  if (user) return { status: 'user', user } as const
  if (me.isPending) return { status: 'loading' } as const
  // Only a 401 means "not logged in"; network/5xx must not bounce the user to login.
  if (me.isError && !(me.error instanceof ApiError && me.error.status === 401)) {
    return { status: 'error', retry: () => void me.refetch() } as const
  }
  return { status: 'anonymous' } as const
}

function GateFallback({ gate }: { gate: Gate }) {
  if (gate.status === 'error') {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-muted-foreground">Không kết nối được máy chủ.</p>
        <Button className="min-h-11" onClick={gate.retry}>
          Thử lại
        </Button>
      </main>
    )
  }
  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <Skeleton className="h-12 w-40" />
    </main>
  )
}

/** Layout route: authenticated users with a usable password get the shell + realtime socket. */
export function ProtectedRoute() {
  const gate = useGate()
  const location = useLocation()
  const { mutate: logout } = useLogout()
  const ready = gate.status === 'user' && !gate.user.mustChangePassword
  useRealtimeConnection(ready)

  if (gate.status === 'loading' || gate.status === 'error') return <GateFallback gate={gate} />
  if (gate.status === 'anonymous') {
    const state: LoginRedirectState = { from: location.pathname + location.search }
    return <Navigate to="/login" replace state={state} />
  }
  if (gate.user.mustChangePassword) return <Navigate to="/change-password" replace />

  return <AppShell userName={gate.user.name} onLogout={() => logout()} />
}

/** Only for logged-out visitors (login); logged-in users go back where they came from. */
export function GuestOnlyRoute() {
  const gate = useGate()
  const location = useLocation()

  if (gate.status === 'loading' || gate.status === 'error') return <GateFallback gate={gate} />
  if (gate.status === 'user') {
    const from = (location.state as LoginRedirectState | null)?.from
    return <Navigate to={gate.user.mustChangePassword ? '/change-password' : (from ?? '/')} replace />
  }
  return <Outlet />
}

/** Only while the account is flagged `mustChangePassword`. */
export function PasswordChangeRoute() {
  const gate = useGate()

  if (gate.status === 'loading' || gate.status === 'error') return <GateFallback gate={gate} />
  if (gate.status === 'anonymous') return <Navigate to="/login" replace />
  if (!gate.user.mustChangePassword) return <Navigate to="/" replace />
  return <Outlet />
}
