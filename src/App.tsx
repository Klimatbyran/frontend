import { ToastProvider } from "./contexts/ToastContext";
import { HelpSystemProvider } from "./help-system/HelpSystem";
import { AppRoutes } from "./routes";

function App() {
  return (
    <ToastProvider>
      <HelpSystemProvider>
        <AppRoutes />
      </HelpSystemProvider>
    </ToastProvider>
  );
}

export default App;
