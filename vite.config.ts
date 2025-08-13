import { defineConfig } from "vitest/config";
import { loadEnv, ConfigEnv } from "vite";
import react from "@vitejs/plugin-react";
import { plugin as markdown } from "vite-plugin-markdown";
import { Mode } from "vite-plugin-markdown";

export default ({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd());

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
          target: env.VITE_API_PROXY ?? "http://localhost:3000/", // Default to local, override in CI/CD
          changeOrigin: true,
          secure: false,
        },
      },
    },
    ssr: {
      noExternal: [
        "react-helmet-async", 
        "react-router-dom", 
        "react-router", 
        "@remix-run/router",
        "path-to-regexp"
      ],
    },
    base: "/",
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@radix-ui/react-accordion', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            charts: ['recharts'],
            utils: ['date-fns', 'clsx', 'class-variance-authority'],
          },
        },
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/setupTests.ts"],
      alias: {
        "@": "/src",
      },
    },
  });
};
