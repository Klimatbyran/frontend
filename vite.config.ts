import { defineConfig, loadEnv, ConfigEnv } from "vite";
import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
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
      vike(),
      markdown({ mode: ["html", "toc", "meta", "react"] as Mode[] }),
    ],
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).pathname,
        "@lib": new URL("./src/lib", import.meta.url).pathname,
      },
    },
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_PROXY ?? "http://localhost:3000/",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    ssr: {
      noExternal: ['react-helmet-async']
    },
    optimizeDeps: {
      include: ['react-helmet-async']
    },
    base: "/",
  });
};
