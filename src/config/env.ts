// The only reader of window.env, which is filled by /assets/environment/env.js at runtime.
const raw = (key: keyof RawRuntimeEnv): string | undefined => {
  const value = window.env?.[key]
  return value === undefined || value === '' ? undefined : value
}

export const env = {
  apiUrl: raw('API_BASE_URL') ?? 'http://localhost:3000/api',
  wsUrl: raw('WS_URL') ?? 'http://localhost:3000',
} as const
