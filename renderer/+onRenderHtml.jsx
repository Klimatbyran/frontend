export { onRenderHtml }

import ReactDOMServer from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'

async function onRenderHtml(pageContext) {
  const { Page, pageProps } = pageContext
  
  // Render the page to HTML string
  const pageHtml = ReactDOMServer.renderToString(<Page {...pageProps} />)

  // Return the full HTML document
  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="sv">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Klimatkollen</title>
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
