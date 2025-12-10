import { Middleware } from "openapi-fetch";

export const authMiddleware: Middleware = {
  async onRequest(req, _options) {
    if (localStorage.getItem("token")) {
      req.headers.append(
        "authorization",
        "Bearer " + localStorage.getItem("token"),
      );
    }
    return req;
  },
  async onResponse(res, _options, _req) {
    if (res.headers.has("x-auth-token")) {
      localStorage.setItem("token", res.headers.get("x-auth-token") || "");
    }
    return res;
  },
};
