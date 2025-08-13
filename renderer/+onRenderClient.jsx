export { onRenderClient }

import ReactDOM from 'react-dom/client'

async function onRenderClient(pageContext) {
  const { Page, pageProps } = pageContext
  
  const container = document.getElementById('root')
  if (container.hasChildNodes()) {
    // Hydrate the server-rendered HTML
    ReactDOM.hydrateRoot(container, <Page {...pageProps} />)
  } else {
    // Client-side render (fallback)
    const root = ReactDOM.createRoot(container)
    root.render(<Page {...pageProps} />)
  }
}
