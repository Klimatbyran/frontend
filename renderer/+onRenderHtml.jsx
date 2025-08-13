export { onRenderHtml }

import ReactDOMServer from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'

// Skapa en SSR-säker version av sidan utan browser-beroenden
function SSRSafePage({ Page, pageProps }) {
  // Rendera bara sidan utan providers som kräver window
  return <Page {...pageProps} />
}

async function onRenderHtml(pageContext) {
  const { Page, pageProps } = pageContext
  
  // Render med SSR-säker wrapper
  const pageHtml = ReactDOMServer.renderToString(
    <SSRSafePage Page={Page} pageProps={pageProps} />
  )

  // Return the full HTML document
  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="sv">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Klimatkollen</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      </head>
      <body>
        <div id="root">${dangerouslySkipEscape(pageHtml)}</div>
      </body>
    </html>`

  return {
    documentHtml,
    pageContext: {
      // We can add custom pageContext properties here
    }
  }
}
