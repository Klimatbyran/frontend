import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'

async function createServer() {
  const app = express()

  let vite
  if (!isProduction) {
    // Create Vite server in middleware mode
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    })
    app.use(vite.middlewares)
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist/client')))
  }

  app.use('*catchAll', async (req, res, next) => {
    const url = req.originalUrl

    try {
      let template
      let render
      
      if (!isProduction) {
        // Development: read index.html and transform it
        template = fs.readFileSync(
          path.resolve(__dirname, 'index.html'),
          'utf-8',
        )
        template = await vite.transformIndexHtml(url, template)
        
        // Load the server entry
        const module = await vite.ssrLoadModule('/src/entry-server.tsx')
        render = module.render
      } else {
        // Production: use built files
        template = fs.readFileSync(
          path.resolve(__dirname, 'dist/client/index.html'),
          'utf-8',
        )
        const module = await import('./dist/server/entry-server.js')
        render = module.render
      }

      // Render the app HTML
      const { html: appHtml, helmetContext } = await render(url)

      // Inject the app-rendered HTML into the template
      const html = template.replace(`<!--ssr-outlet-->`, appHtml)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(e)
      }
      console.error('SSR Error:', e)
      
      // Fallback to client-side rendering on error
      let template
      if (!isProduction) {
        template = fs.readFileSync(
          path.resolve(__dirname, 'index.html'),
          'utf-8',
        )
        template = await vite.transformIndexHtml(url, template)
      } else {
        template = fs.readFileSync(
          path.resolve(__dirname, 'dist/client/index.html'),
          'utf-8',
        )
      }
      const html = template.replace(`<!--ssr-outlet-->`, '')
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    }
  })

  const port = process.env.PORT || 5173
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
  })
}

createServer()
