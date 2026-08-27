import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthExpiredModal } from "@/components/AuthExpiredModal";

const ProtectedRoute = () => {
  const { token, login } = useAuth();
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/", { replace: true });
  };

  if (!token) {
    return <AuthExpiredModal isOpen onClose={handleCancel} onLogin={login} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
