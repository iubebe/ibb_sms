import fs from 'node:fs'
import path from 'node:path'
import { loadEnv, type Plugin } from 'vite'

const ENV_JS_URL = '/assets/environment/env.js'

// Dev only: answers GET /assets/environment/env.js from .env, using the keys listed in
// env.template.js. Without any of them in .env the static fallback env.js is served.
export function localEnvPlugin(): Plugin {
  let mode = 'development'
  let envDir = process.cwd()
  let publicDir = path.resolve(process.cwd(), 'public')

  return {
    name: 'local-env',
    apply: 'serve',
    configResolved(config) {
      mode = config.mode
      envDir = typeof config.envDir === 'string' ? config.envDir : config.root
      publicDir = config.publicDir
    },
    configureServer(server) {
      const templatePath = path.join(publicDir, 'assets/environment/env.template.js')

      server.watcher.add(path.join(envDir, '.env*'))
      server.watcher.on('change', (file) => {
        if (path.basename(file).startsWith('.env')) server.ws.send({ type: 'full-reload' })
      })

      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== ENV_JS_URL) return next()

        const template = fs.readFileSync(templatePath, 'utf8')
        const keys = [...new Set([...template.matchAll(/\$\{([A-Z0-9_]+)\}/g)].map((m) => m[1]))]
        const env = loadEnv(mode, envDir, '')
        if (!keys.some((key) => env[key])) return next()

        const body = template.replace(/\$\{([A-Z0-9_]+)\}/g, (_, key: string) => env[key] ?? '')
        res.setHeader('Content-Type', 'application/javascript')
        res.setHeader('Cache-Control', 'no-store')
        res.end(body)
      })
    },
  }
}
