export { onRenderClient }

import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import AuthProvider from "../src/contexts/AuthContext"
import { LanguageProvider } from "../src/components/LanguageProvider"

// Import CSS
import "../src/index.css"
import "../src/i18n"

async function onRenderClient(pageContext) {
  const { Page, pageProps } = pageContext
  
  // Create QueryClient for client
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        retry: 2,
      },
    },
  })

  // Wrap page with providers (utan HelmetProvider för nu)
  const pageWithProviders = (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <Page {...pageProps} />
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
  
  const container = document.getElementById('root')
  if (container.hasChildNodes()) {
    // Hydrate the server-rendered HTML
    ReactDOM.hydrateRoot(container, pageWithProviders)
  } else {
    // Client-side render (fallback)
    const root = ReactDOM.createRoot(container)
    root.render(pageWithProviders)
  }
}
