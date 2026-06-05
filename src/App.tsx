import { Suspense } from "react";
import { PageLoading } from "@/components/pageStates/Loading";
import { ToastProvider } from "./contexts/ToastContext";
import { ComparisonProvider } from "./contexts/ComparisonContext";
import { ComparisonDetailEntityRegistry } from "./contexts/ComparisonDetailEntityContext";
import { ComparisonFloatingBar } from "./components/explore/ComparisonFloatingBar";
import { AppRoutes } from "./routes";

function App() {
  return (
    <ToastProvider>
      <ComparisonProvider>
        <ComparisonDetailEntityRegistry>
          <Suspense fallback={<PageLoading />}>
            <AppRoutes />
          </Suspense>
          <ComparisonFloatingBar />
        </ComparisonDetailEntityRegistry>
      </ComparisonProvider>
    </ToastProvider>
  );
}

export default App;
