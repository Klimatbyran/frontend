export { onRenderHtml }

import ReactDOMServer from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Skapa en minimal SSR-säker wrapper som bara renderar sidinnehållet
function SSRSafePage({ Page, pageProps }) {
  // Skapa en QueryClient för SSR
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        retry: 0, // Ingen retry under SSR
      },
    },
  })

  // Rendera bara sidinnehållet utan Layout eller andra providers som kan orsaka problem
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <Page {...pageProps} />
      </div>
    </QueryClientProvider>
  )
}

async function onRenderHtml(pageContext) {
  const { Page, pageProps } = pageContext
  
  // Render med minimal SSR-säker wrapper
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
