import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";

export const AuthCallback = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticate, token } = useAuth();
  const { showToast } = useToast();
  const called = useRef(false);
  const { currentLanguage } = useLanguage
    ? useLanguage()
    : { currentLanguage: "sv" };

  useEffect(() => {
    if (called.current) return; // prevent rerender caused by StrictMode

    called.current = true;
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (!code) return;
    authenticate(code);

    if (error) {
      console.error("Authentication error:", error);
      navigate("/", { state: { error: t("authCallbackPage.failed") } });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (token) {
      showToast(
        t("authCallbackPage.success.title"),
        t("authCallbackPage.success.description"),
      );
      const redirectPath = localStorage.getItem("postLoginRedirect");
      if (redirectPath) {
        localStorage.removeItem("postLoginRedirect");
        if (redirectPath.endsWith("/403")) {
          // Redirect to landing page based on language
          const lang = currentLanguage || "sv";
          navigate(lang === "en" ? "/en" : "/sv", { replace: true });
        } else {
          navigate(redirectPath, { replace: true });
        }
      } else {
        navigate(currentLanguage === "en" ? "/en" : "/sv", { replace: true });
      }
    }
  }, [token]);

  return <div>{t("blogDetailPage.loading")}</div>;
};
