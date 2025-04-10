import { authenticateWithGithub, baseUrl } from "@/lib/api";
import { Token } from "@/types/token";
import { jwtDecode } from "jwt-decode";
import React, { useContext, createContext, useState } from "react";

export interface AuthContext {
  token: string;
  user: Token | null;
  login: () => void;
  authenticate: (code: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContext>({} as AuthContext);

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const user: Token | null = token ? jwtDecode(token) : null;

  const login = () => {
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
