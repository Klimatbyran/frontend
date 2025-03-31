import { useEffect, useRef,} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useTranslation } from "react-i18next";

export const AuthCallback = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticate, token } = useAuth();
  const { showToast } = useToast();
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return // prevent rerender caused by StrictMode
    
    called.current = true
    const params = new URLSearchParams(location.search);
    const code = params.get('code')
    const error = params.get('error');
    
    authenticate(code)

    if (error) {
      console.error('Authentication error:', error);
      navigate('/', { state: { error: t("authCallbackpage.failed") } });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (token) {
      showToast(t('authCallbackPage.success.title'), t('authCallbackPage.success.description'))
      navigate('/')
    }
  }, [token])
  
  return <div>{t('blogDetailPage.loading')}</div>;
}