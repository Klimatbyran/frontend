import { Suspense } from "react";
import { PageLoading } from "@/components/pageStates/Loading";
import { ToastProvider } from "./contexts/ToastContext";
import { AppRoutes } from "./routes";

function App() {
  return (
    <ToastProvider>
      <Suspense fallback={<PageLoading />}>
        <AppRoutes />
      </Suspense>
    </ToastProvider>
  );
}

export default App;
