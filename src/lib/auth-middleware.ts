import { Middleware } from "openapi-fetch";

// Helper function to safely get token from localStorage (works in browser only)
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
};

// Helper function to safely set token in localStorage (works in browser only)
const setToken = (token: string): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("token", token);
  } catch {
    // Ignore errors (e.g., in private browsing mode)
  }
};

export const authMiddleware: Middleware = {
  async onRequest(req, _options) {
    const token = getToken();
    if (token) {
      req.headers.append("authorization", `Bearer ${token}`);
    }
    return req;
  },
  async onResponse(res, _options, _req) {
    if (res.headers.has("x-auth-token")) {
      const newToken = res.headers.get("x-auth-token");
      if (newToken) {
        setToken(newToken);
      }
    }
    return res;
  },
};
