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

  // 301 Redirects från nginx
  app.get('/foretag/utslappen/lista', (req, res) => {
    res.redirect(301, '/sv/companies')
  })
  
  app.get(/^\/foretag\/(.+)-(Q\d+)$/, (req, res) => {
    res.redirect(301, `/sv/companies/${req.params[1]}`)
  })
  
  app.get(/^\/geografiskt\/(koldioxidbudgetarna|klimatplanerna|konsumtionen|elbilarna|laddarna|cyklarna|upphandlingarna|utslappen)\/(karta|lista)$/, (req, res) => {
    res.redirect(301, '/sv/municipalities')
  })
  
  app.get(/^\/kommun\/([^\/]+)/, (req, res) => {
    res.redirect(301, `/sv/municipalities/${req.params[0]}`)
  })
  
  app.get('/om-oss', (req, res) => {
    res.redirect(301, '/sv/about')
  })
  
  app.get('/kallor-och-metod', (req, res) => {
    res.redirect(301, '/sv/methodology')
  })
  
  app.get('/blog', (req, res) => {
    res.redirect(301, '/sv/insights')
  })
  
  app.get('/utslappsberakningar', (req, res) => {
    res.redirect(301, '/sv/insights/utslappsberakning')
  })
  
  app.get('/partierna', (req, res) => {
    res.redirect(301, '/sv/insights/klimatmal')
  })

  // Language detection and redirect for root path
  app.get('/', (req, res) => {
    const acceptLanguage = req.get('Accept-Language') || ''
    const preferredLang = acceptLanguage.startsWith('en') ? 'en' : 'sv'
    res.redirect(302, `/${preferredLang}`)
  })

  // API proxy - implementera riktig proxy
  app.use('/api', async (req, res) => {
    const backendUrl = process.env.BACKEND_URL || 'http://backend'
    try {
      const fetch = (await import('node-fetch')).default
      const response = await fetch(`${backendUrl}${req.originalUrl}`, {
        method: req.method,
        headers: {
          ...req.headers,
          host: undefined, // Remove host header to avoid conflicts
        },
        body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
      })
      
      // Copy response headers
      response.headers.forEach((value, key) => {
        res.setHeader(key, value)
      })
      
      res.status(response.status)
      const body = await response.text()
      res.send(body)
    } catch (error) {
      console.error('API proxy error:', error)
      res.status(502).json({ error: 'Backend proxy error' })
    }
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
