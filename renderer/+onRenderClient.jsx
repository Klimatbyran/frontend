export { onRenderClient }

import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import AuthProvider from "../src/contexts/AuthContext"
import { VikeLanguageProvider } from "./VikeLanguageProvider"
import { ToastProvider } from "../src/contexts/ToastContext"
import { DataGuideProvider } from "../src/data-guide/DataGuide"
import { Layout } from "../src/components/layout/Layout"
import { HelmetProvider } from "react-helmet-async"

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

  // Wrap page with all providers for client-side
  const pageWithProviders = (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <VikeLanguageProvider pageContext={pageContext}>
            <ToastProvider>
              <DataGuideProvider>
                <Layout>
                  <Page {...pageProps} />
                </Layout>
              </DataGuideProvider>
            </ToastProvider>
          </VikeLanguageProvider>
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  )
  
  const container = document.getElementById('root')
  // Always do client-side render since SSR and client content differ
  const root = ReactDOM.createRoot(container)
  root.render(pageWithProviders)
}
