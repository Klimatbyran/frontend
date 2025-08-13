import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import AuthProvider from "./contexts/AuthContext";
import { LanguageProvider } from "./components/LanguageProvider";
import { Layout } from "./components/layout/Layout";
import App from "./App";
import "./index.css";
import "./i18n";

export function render(url: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        retry: 2,
      },
    },
  });

  const helmetContext = {};

  const html = renderToString(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider context={helmetContext}>
          <StaticRouter location={url}>
            <AuthProvider>
              <LanguageProvider>
                <Layout>
                  <App />
                </Layout>
              </LanguageProvider>
            </AuthProvider>
          </StaticRouter>
        </HelmetProvider>
      </QueryClientProvider>
    </StrictMode>
  );

  return { html, helmetContext };
}
