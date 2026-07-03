import { jwtDecode } from "jwt-decode";
import React, {
  useContext,
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { authenticateWithGithub, apiUrl } from "@/lib/api";
import { Token } from "@/types/token";

export interface AuthContext {
  token: string;
  user: Token | null;
  login: (redirectUri?: string) => void;
  authenticate: (code: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContext>({} as AuthContext);

export const useAuth = () => {
  return useContext(AuthContext);
};

function isTokenExpired(token: string): boolean {
  if (!token) return true;
  try {
    const decoded: Token = jwtDecode(token);
    if (!decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

function useTokenAutoLogout(token: string, logout: () => void) {
  const logoutTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!token) return;
    if (isTokenExpired(token)) {
      logout();
      return;
    }

    if (logoutTimeout.current) {
      clearTimeout(logoutTimeout.current);
    }

    const decoded: Token = jwtDecode(token);
    const msUntilExpiry = decoded.exp * 1000 - Date.now();
    logoutTimeout.current = setTimeout(() => {
      logout();
    }, msUntilExpiry);

    return () => {
      if (logoutTimeout.current) {
        clearTimeout(logoutTimeout.current);
      }
    };
  }, [token, logout]);
}

function createLoginHandler() {
  return (redirectUri?: string) => {
    localStorage.setItem(
      "postLoginRedirect",
      window.location.pathname + window.location.search,
    );
    const callbackUrl =
      redirectUri || `${window.location.origin}/auth/callback`;
    const url = new URL(apiUrl("/auth/github"), window.location.origin);
    url.searchParams.set("redirect_uri", callbackUrl);
    window.location.href = url.toString();
  };
}

function createAuthenticateHandler(setToken: (token: string) => void) {
  return async (code: string) => {
    try {
      const response = await authenticateWithGithub(code);
      if (response.token) {
        setToken(response.token);
        localStorage.setItem("token", response.token);
      }
      return true;
    } catch (error) {
      console.error("Login error", error);
      throw error;
    }
  };
}

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const user: Token | null = token ? jwtDecode(token) : null;

  const logout = useCallback(() => {
    setToken("");
    localStorage.removeItem("token");
  }, []);

  useTokenAutoLogout(token, logout);

  const login = useCallback(createLoginHandler(), []);
  const authenticate = useCallback(createAuthenticateHandler(setToken), []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        authenticate,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
