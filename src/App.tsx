import { Suspense } from "react";
import { PageLoading } from "@/components/pageStates/Loading";
import { ToastProvider } from "./contexts/ToastContext";
import { ComparisonProvider } from "./contexts/ComparisonContext";
import { ComparisonDetailEntityRegistry } from "./contexts/ComparisonDetailEntityContext";
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
        <ComparisonDetailEntityRegistry>
          <Suspense fallback={<PageLoading />}>
            <AppRoutes />
          </Suspense>
        </ComparisonDetailEntityRegistry>
      </ComparisonProvider>
    </ToastProvider>
  );
}

export default App;
