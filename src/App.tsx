import { ToastProvider } from "./contexts/ToastContext";
import { DataGuideProvider } from "./data-guide/DataGuide";
import { AppRoutes } from "./routes";

function App() {
  return (
    <ToastProvider>
      <DataGuideProvider>
        <AppRoutes />
      </DataGuideProvider>
    </ToastProvider>
  );
}

export default App;
