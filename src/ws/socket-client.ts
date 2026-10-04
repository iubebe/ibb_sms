import { io, type Socket } from 'socket.io-client'
import { env } from '@/config/env'
import type { ClientToServerEvents, ServerToClientEvents } from '@/ws/events'

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'

type StatusListener = (status: ConnectionStatus) => void

/**
 * Single Socket.IO instance for the whole app. Typed by `@/ws/events`.
 * The backend authenticates the handshake with the access cookie, so connect
 * only after login and reconnect after the session was refreshed.
 */
export class SocketClient {
  private readonly socket: Socket<ServerToClientEvents, ClientToServerEvents>
  private status: ConnectionStatus = 'idle'
  private readonly statusListeners = new Set<StatusListener>()

  constructor(url: string) {
    this.socket = io(url, { autoConnect: false, transports: ['websocket'], withCredentials: true })
    this.socket.on('connect', () => this.setStatus('connected'))
    this.socket.on('disconnect', () => this.setStatus('disconnected'))
    this.socket.on('connect_error', () => this.setStatus('error'))
  }

  connect() {
    if (this.socket.active) return
    this.setStatus('connecting')
    this.socket.connect()
  }

  /** Drop the current connection and handshake again with the latest cookie. */
  reconnect() {
    this.socket.disconnect()
    this.setStatus('connecting')
    this.socket.connect()
  }

  disconnect() {
    this.socket.disconnect()
  }

  getStatus() {
    return this.status
  }

  /** Subscribe to connection status changes. Returns an unsubscribe function. */
  onStatusChange(listener: StatusListener) {
    this.statusListeners.add(listener)
    return () => this.statusListeners.delete(listener)
  }

  /** Listen to a server event. Returns an unsubscribe function. */
  on<E extends keyof ServerToClientEvents>(event: E, listener: ServerToClientEvents[E]) {
    // socket.io's generic listener types don't narrow through a generic key.
    this.socket.on(event, listener as never)
    return () => {
      this.socket.off(event, listener as never)
    }
  }

  emit<E extends keyof ClientToServerEvents>(
    event: E,
    ...args: Parameters<ClientToServerEvents[E]>
  ) {
    this.socket.emit(event, ...(args as never))
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status
    this.statusListeners.forEach((listener) => listener(status))
  }
}

export const socketClient = new SocketClient(env.wsUrl)
