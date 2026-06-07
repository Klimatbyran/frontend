import { defineConfig } from "vitest/config";
import { loadEnv, ConfigEnv } from "vite";
import react from "@vitejs/plugin-react";
import { plugin as markdown, Mode } from "vite-plugin-markdown";

export default ({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiProxyTarget = env.VITE_API_PROXY ?? "https://klimatkollen.se/";
  const isLocalGarboProxy = /localhost|127\.0\.0\.1/.test(apiProxyTarget);

  if (isLocalGarboProxy && !env.GARBO_PROXY_CLIENT_API_KEY) {
    console.warn(
      "[vite] GARBO_PROXY_CLIENT_API_KEY is missing. Local Garbo returns 401 without it. " +
        "Add your key to .env.development or use VITE_API_PROXY=https://klimatkollen.se/",
    );
  }

  return defineConfig({
    plugins: [
      react({
        babel: {
          plugins: [
            ["@babel/plugin-transform-react-jsx", { runtime: "automatic" }],
            ["@babel/plugin-proposal-class-properties", { loose: true }],
          ],
        },
      }),
      markdown({ mode: ["html", "toc", "meta", "react"] as Mode[] }),
    ],
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).pathname,
        "@lib": new URL("./src/lib", import.meta.url).pathname, // Fixes your import issue
      },
    },
    server: {
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              const key = env.GARBO_PROXY_CLIENT_API_KEY;
              if (key) {
                proxyReq.setHeader("X-API-Key", key);
              }
            });
          },
        },
      },
    },
    base: "/",
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/setupTests.ts"],
      alias: {
        "@": "/src",
      },
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        exclude: [
          "node_modules/",
          "dist/",
          "coverage/",
          "**/*.d.ts",
          "**/*.config.*",
          "**/setupTests.ts",
          "**/*.test.*",
          "**/*.spec.*",
        ],
      },
    },
  });
};
