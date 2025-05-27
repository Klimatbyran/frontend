import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

export function UnauthorizedErrorPage() {
  const { t } = useTranslation();
  const { token, login } = useAuth();

  useEffect(() => {
    if (!token) {
      login();
    }
  }, [token, login]);

  return (
    <div>
      <h1 className="text-7xl font-light tracking-tight">
        {t("unauthorizedPage.title")}
      </h1>
      <h3 className="text-3xl inline whitespace-pre-wrap tracking-tight text-[#E2FF8D]">
        {t("unauthorizedPage.errorMessage")}
      </h3>
    </div>
  );
}
