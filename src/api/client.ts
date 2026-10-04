import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_ROUTES } from '@/api/routes'
import { env } from '@/config/env'

const CSRF_HEADER = 'X-CSRF-Token'
const SAFE_METHODS = new Set(['get', 'head', 'options'])
/** Auth calls that must never trigger a refresh-and-retry. */
const NO_REFRESH_PATHS: string[] = [API_ROUTES.auth.login, API_ROUTES.auth.refresh, API_ROUTES.auth.logout]

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 15_000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

/** Normalized error thrown by every api call, so UI never touches AxiosError. */
export class ApiError extends Error {
  readonly status: number | null
  readonly data: unknown

  constructor(message: string, status: number | null, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// ---- CSRF: every unsafe request needs a signed token (also sets its cookie).
let csrfToken: Promise<string> | null = null

function loadCsrfToken() {
  csrfToken ??= axios
    .get<{ csrfToken: string }>(API_ROUTES.auth.csrf, { baseURL: env.apiUrl, withCredentials: true })
    .then((res) => res.data.csrfToken)
    .catch((error: unknown) => {
      csrfToken = null
      throw error
    })
  return csrfToken
}

apiClient.interceptors.request.use(async (config) => {
  if (!SAFE_METHODS.has((config.method ?? 'get').toLowerCase())) {
    config.headers.set(CSRF_HEADER, await loadCsrfToken())
  }
  return config
})

// ---- Session: the access cookie is short-lived; refresh once (serialized) on 401.
type RetriableConfig = InternalAxiosRequestConfig & { _csrfRetried?: boolean; _authRetried?: boolean }

let refreshing: Promise<void> | null = null
const sessionRefreshedListeners = new Set<() => void>()
let sessionExpiredHandler: (() => void) | null = null

/** Called after a successful refresh (e.g. to reconnect the WebSocket). */
export function onSessionRefreshed(listener: () => void) {
  sessionRefreshedListeners.add(listener)
  return () => sessionRefreshedListeners.delete(listener)
}

/** Called when refresh fails, i.e. the user must log in again. */
export function setSessionExpiredHandler(handler: (() => void) | null) {
  sessionExpiredHandler = handler
}

function refreshSession() {
  refreshing ??= loadCsrfToken()
    .then((token) =>
      axios.post(API_ROUTES.auth.refresh, null, {
        baseURL: env.apiUrl,
        withCredentials: true,
        headers: { [CSRF_HEADER]: token },
      }),
    )
    .then(() => {
      sessionRefreshedListeners.forEach((listener) => listener())
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

function errorMessage(data: unknown, fallback: string) {
  const message = (data as { message?: string | string[] } | undefined)?.message
  return Array.isArray(message) ? message.join(', ') : (message ?? fallback)
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!(error instanceof AxiosError)) return Promise.reject(error)

    const config = error.config as RetriableConfig | undefined
    const status = error.response?.status ?? null
    const data: unknown = error.response?.data

    // CSRF token expired or cookie lost: fetch a new one and retry once.
    if (status === 403 && config && !config._csrfRetried && /csrf/i.test(errorMessage(data, ''))) {
      config._csrfRetried = true
      csrfToken = null
      return apiClient.request(config)
    }

    // Access token expired: refresh once, then replay the request.
    if (status === 401 && config && !config._authRetried && !NO_REFRESH_PATHS.includes(config.url ?? '')) {
      config._authRetried = true
      try {
        await refreshSession()
        return apiClient.request(config)
      } catch {
        sessionExpiredHandler?.()
      }
    }

    return Promise.reject(new ApiError(errorMessage(data, error.message), status, data))
  },
)
