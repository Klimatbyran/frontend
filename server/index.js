import express from 'express'
import { renderPage } from 'vike/server'
import { root } from './root.js'

const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 3000

startServer()

async function startServer() {
  const app = express()

  if (isProduction) {
    app.use(express.static(`${root}/dist/client`))
  } else {
    const vite = await import('vite')
    const viteDevMiddleware = (
      await vite.createServer({
        root,
        server: { middlewareMode: true }
      })
    ).middlewares
    app.use(viteDevMiddleware)
  }

  // API proxy - flyttar från nginx
  app.use('/api/*', async (req, res) => {
    const backendUrl = process.env.BACKEND_URL || 'http://backend'
    // Här skulle vi implementera proxy logik, för nu bara placeholder
    res.status(502).json({ error: 'Backend proxy not implemented yet' })
  })

  app.get('*', async (req, res, next) => {
    const pageContextInit = {
      urlOriginal: req.originalUrl,
      userAgent: req.get('User-Agent')
    }
    const pageContext = await renderPage(pageContextInit)
    const { httpResponse } = pageContext
    if (!httpResponse) {
      return next()
    } else {
      const { body, statusCode, headers } = httpResponse
      headers.forEach(([name, value]) => res.setHeader(name, value))
      res.status(statusCode).send(body)
    }
  })

  app.listen(port)
  console.log(`Server running at http://localhost:${port}`)
}
