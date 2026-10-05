/** Events the server sends to the client. Key = event name, value = listener signature. */
export interface ServerToClientEvents {
  pong: (data: unknown) => void
}

/** Events the client sends to the server. Key = event name, value = emit signature. */
export interface ClientToServerEvents {
  ping: (data?: unknown) => void
}
