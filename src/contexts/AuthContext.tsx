import { authenticateWithGithub, baseUrl } from "@/lib/api";
import { Token } from "@/types/token";
import { jwtDecode } from "jwt-decode";
import React, {
  useContext,
  createContext,
  useState,
  useEffect,
  useRef,
} from "react";

export interface AuthContext {
  token: string;
  user: Token | null;
  login: () => void;
  authenticate: (code: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContext>({} as AuthContext);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const user: Token | null = token ? jwtDecode(token) : null;
  const logoutTimeout = useRef<NodeJS.Timeout | null>(null);

  // Helper to check if token is expired
  const isTokenExpired = (token: string): boolean => {
    if (!token) return true;
    try {
      const decoded: Token = jwtDecode(token);
      if (!decoded.exp) return true;
      // exp is in seconds since epoch
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  };

  // Set up auto-logout when token expires
  useEffect(() => {
    if (!token) return;
    if (isTokenExpired(token)) {
      logout();
      return;
    }
    // Clear any previous timeout
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
  }, [token]);

  const login = () => {
    localStorage.setItem(
      "postLoginRedirect",
      window.location.pathname + window.location.search,
    );
    window.location.href = baseUrl + "/auth/github";
  };

  const authenticate = async (code: string) => {
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

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    if (logoutTimeout.current) {
      clearTimeout(logoutTimeout.current);
    }
  };

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
