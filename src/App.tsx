import { Suspense } from "react";
import { PageLoading } from "@/components/pageStates/Loading";
import { ToastProvider } from "./contexts/ToastContext";
import { ComparisonProvider } from "./contexts/ComparisonContext";
import { useComparisonRouteEffects } from "./hooks/explore/useComparisonRouteEffects";
import { AppRoutes } from "./routes";

function ComparisonRouteEffects() {
  useComparisonRouteEffects();
  return null;
}

function App() {
  return (
    <ToastProvider>
      <ComparisonProvider>
        <ComparisonRouteEffects />
        <Suspense fallback={<PageLoading />}>
          <AppRoutes />
        </Suspense>
      </ComparisonProvider>
    </ToastProvider>
  );
}

export default App;
