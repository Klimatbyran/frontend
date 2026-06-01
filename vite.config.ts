import { defineConfig } from "vitest/config";
import { loadEnv, ConfigEnv } from "vite";
import react from "@vitejs/plugin-react";
import { plugin as markdown, Mode } from "vite-plugin-markdown";
import { devApiProxy } from "./vite-api-proxy";

export default ({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiProxyTarget = env.VITE_API_PROXY ?? "http://localhost:3000/";

  console.log(
    `[vite] /api/* → ${apiProxyTarget.replace(/\/$/, "")} (via devApiProxy)`,
  );

  return defineConfig({
    plugins: [
      devApiProxy(apiProxyTarget, env.GARBO_PROXY_CLIENT_API_KEY),
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
