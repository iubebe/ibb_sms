/// <reference types="vite/client" />

// Raw strings from /assets/environment/env.js (see public/assets/environment/env.template.js).
interface RawRuntimeEnv {
  readonly API_BASE_URL?: string
  readonly WS_URL?: string
}

interface Window {
  env?: RawRuntimeEnv
}
