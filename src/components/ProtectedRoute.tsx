import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = () => {
  const { token } = useAuth();
  if (token) {
    return <Outlet />;
  }
  return <Navigate to={"/403"} replace />;
};

export default ProtectedRoute;
