import { Suspense } from "react";
import { PageLoading } from "@/components/pageStates/Loading";
import { ToastProvider } from "./contexts/ToastContext";
import { ComparisonProvider } from "./contexts/ComparisonContext";
import { ComparisonFloatingBar } from "./components/explore/ComparisonFloatingBar";
import { AppRoutes } from "./routes";

function App() {
  return (
    <ToastProvider>
      <ComparisonProvider>
        <Suspense fallback={<PageLoading />}>
          <AppRoutes />
        </Suspense>
        <ComparisonFloatingBar />
      </ComparisonProvider>
    </ToastProvider>
  );
}

export default App;
