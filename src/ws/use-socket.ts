import { useEffect, useSyncExternalStore } from 'react'
import { onSessionRefreshed } from '@/api/client'
import { socketClient } from '@/ws/socket-client'

/** Live connection status of the shared socket. */
export function useSocketStatus() {
  return useSyncExternalStore(
    (listener) => socketClient.onStatusChange(listener),
    () => socketClient.getStatus(),
  )
}

/**
 * Keeps the socket open while `enabled` (i.e. logged in). The handshake is
 * authenticated by the access cookie, so reconnect whenever it was refreshed.
 */
export function useRealtimeConnection(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    socketClient.connect()
    const offRefresh = onSessionRefreshed(() => socketClient.reconnect())
    return () => {
      offRefresh()
      socketClient.disconnect()
    }
  }, [enabled])
}
