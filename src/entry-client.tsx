import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import AuthProvider from "./contexts/AuthContext";
import { LanguageProvider } from "./components/LanguageProvider";
import { Layout } from "./components/layout/Layout";
import App from "./App";
import "./index.css";
import "./i18n";

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

const AppComponent = () => (
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <LanguageProvider>
              <Layout>
                <App />
              </Layout>
            </LanguageProvider>
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  </StrictMode>
);

const container = document.getElementById("root")!;

// Hydrate if SSR content exists, otherwise render
if (container.innerHTML.trim() !== "") {
  hydrateRoot(container, <AppComponent />);
} else {
  const root = createRoot(container);
  root.render(<AppComponent />);
}
