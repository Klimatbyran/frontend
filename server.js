import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";

async function createServer() {
  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  // Use Node.js built-in HTTP server instead of Express
  const { createServer: createHttpServer } = await import("node:http");

  const server = createHttpServer(async (req, res) => {
    const url = req.url;

    try {
      // Apply Vite's middleware manually
      await new Promise((resolve, reject) => {
        vite.middlewares(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch (middlewareError) {
      // If middleware doesn't handle it, serve our SSR content
      try {
        let template = fs.readFileSync(
          path.resolve(__dirname, "index.html"),
          "utf-8",
        );

        template = await vite.transformIndexHtml(url, template);

        // For now, serve client-side only to avoid path-to-regexp issues
        const html = template.replace(`<!--ssr-outlet-->`, "");

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        console.error(e);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      }
    }
  });

  const port = process.env.PORT || 5173;
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

createServer();
