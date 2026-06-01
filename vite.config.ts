import { defineConfig } from "vitest/config";
import { loadEnv, ConfigEnv } from "vite";
import react from "@vitejs/plugin-react";
import { plugin as markdown, Mode } from "vite-plugin-markdown";

export default ({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiProxyTarget = (
    env.VITE_API_PROXY ?? "http://localhost:3000/"
  ).replace(/\/$/, "");
  const apiProxyHost = new URL(`${apiProxyTarget}/`).host;

  // api.unearthdata.ai returns the marketing SPA unless Host is exactly api.unearthdata.ai
  const apiProxy = {
    "/api": {
      target: apiProxyTarget,
      changeOrigin: false,
      secure: true,
      headers: {
        host: apiProxyHost,
      },
      configure: (proxy: {
        on: (
          event: "proxyReq",
          handler: (
            proxyReq: {
              setHeader: (name: string, value: string) => void;
              host: string;
            },
          ) => void,
        ) => void;
      }) => {
        proxy.on("proxyReq", (proxyReq) => {
          proxyReq.setHeader("host", apiProxyHost);
          proxyReq.host = apiProxyHost;
          const key = env.GARBO_PROXY_CLIENT_API_KEY;
          if (key) {
            proxyReq.setHeader("X-API-Key", key);
          }
        });
      },
    },
  };

  console.log(
    `[vite] /api → ${apiProxyTarget}/api/* (upstream Host: ${apiProxyHost})`,
  );

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
        "@lib": new URL("./src/lib", import.meta.url).pathname,
      },
    },
    server: {
      proxy: apiProxy,
    },
    preview: {
      proxy: apiProxy,
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
