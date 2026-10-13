import type { Plugin } from 'vite'
import { loadEnv } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'

export function vercelApiDevPlugin(): Plugin {
  return {
    name: 'vercel-api-dev-middleware',
    configResolved(config) {
      // Populate process.env with variables from .env
      const env = loadEnv(config.mode, process.cwd(), '')
      Object.assign(process.env, env)
    },
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url ? req.url.split('?')[0] : ''

        if (url.startsWith('/api/')) {
          const endpoint = url.replace('/api/', '').replace(/\/$/, '')
          
          try {
            // Map endpoint to api/<name>.ts
            const modulePath = path.resolve(process.cwd(), 'api', `${endpoint}.ts`)
            
            // Collect request body for POST/PUT/PATCH
            let body: any = null
            if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
              const chunks: Buffer[] = []
              for await (const chunk of req) {
                chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
              }
              const raw = Buffer.concat(chunks).toString('utf-8')
              try {
                body = JSON.parse(raw)
              } catch {
                body = raw
              }
            }

            // Load handler dynamically through Vite's SSR runtime
            const mod = await server.ssrLoadModule(modulePath)
            const handler = mod.default

            if (typeof handler === 'function') {
              // Polyfill ApiResponse helper methods
              const extendedRes: any = res
              extendedRes.status = function (code: number) {
                this.statusCode = code
                return this
              }
              extendedRes.json = function (data: any) {
                if (!this.headersSent) {
                  this.setHeader('Content-Type', 'application/json')
                }
                this.end(JSON.stringify(data))
              }
              extendedRes.send = function (data: any) {
                this.end(typeof data === 'object' ? JSON.stringify(data) : String(data))
              }

              const extendedReq: any = req
              extendedReq.body = body

              await handler(extendedReq, extendedRes)
              return
            }
          } catch (err: any) {
            if (err.code === 'ENOENT' || (err.message && err.message.includes('Cannot find module'))) {
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: `API route ${url} not found` }))
              return
            }

            console.error(`[Dev API Middleware Error] ${url}:`, err)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Internal API middleware error', message: err.message }))
            return
          }
        }

        next()
      })
    },
  }
}
