import { ToastProvider } from "./contexts/ToastContext";
import { AppRoutes } from "./routes";

function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}

export default App;
