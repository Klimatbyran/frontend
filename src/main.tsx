import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import AuthProvider from "./contexts/AuthContext";
import "./index.css";
import "./i18n";
import App from "./App";
import { Layout } from "./components/layout/Layout";
import { LanguageProvider } from "./components/LanguageProvider";

// Create router with all routes
const router = createBrowserRouter([
  {
    path: "*",
    element: (
      <AuthProvider>
        <LanguageProvider>
          <Layout>
            <App />
          </Layout>
        </LanguageProvider>
      </AuthProvider>
    ),
  },
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // Data stays fresh for 2 minutes
      gcTime: 1000 * 60 * 5, // Cache persists for 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      retry: 2, // Retry failed requests twice
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
    </QueryClientProvider>
  </StrictMode>,
);
