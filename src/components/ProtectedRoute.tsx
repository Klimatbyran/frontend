import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthExpiredModal } from "@/components/companies/edit/AuthExpiredModal";

const ProtectedRoute = () => {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleCancel = () => {
    // Remove '/edit' from the current path
    const newPath = location.pathname.replace(/\/edit$/, "");
    navigate(newPath, { replace: true });
  };

  if (!token) {
    return (
      <AuthExpiredModal isOpen={true} onClose={handleCancel} onLogin={login} />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
