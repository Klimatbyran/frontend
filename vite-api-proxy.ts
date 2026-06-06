import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

function readRequestBody(req: IncomingMessage): Promise<Buffer | undefined> {
  if (!req.method || req.method === "GET" || req.method === "HEAD") {
    return Promise.resolve(undefined);
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

/**
 * Dev-only /api proxy. Uses Node fetch so Host is always the API hostname
 * (api.unearthdata.ai returns HTML for Host: unearthdata.ai).
 */
export function devApiProxy(apiOrigin: string, apiKey?: string): Plugin {
  const base = apiOrigin.replace(/\/$/, "");

  const handler = async (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) => {
    if (!req.url?.startsWith("/api")) {
      next();
      return;
    }

    const url = `${base}${req.url}`;

    try {
      const headers = new Headers();
      if (apiKey) {
        headers.set("X-API-Key", apiKey);
      }
      if (req.headers.authorization) {
        headers.set("Authorization", req.headers.authorization);
      }
      if (req.headers["content-type"]) {
        headers.set("Content-Type", req.headers["content-type"]);
      }

      const body = await readRequestBody(req);

      const upstream = await fetch(url, {
        method: req.method,
        headers,
        body: body as BodyInit | undefined,
      });

      res.statusCode = upstream.status;
      upstream.headers.forEach((value, key) => {
        if (key === "transfer-encoding") return;
        res.setHeader(key, value);
      });

      const buffer = Buffer.from(await upstream.arrayBuffer());
      res.end(buffer);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown proxy error";
      console.error(`[dev-api-proxy] ${req.method} ${url} failed:`, message);
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: "API proxy failed",
          message,
          hint: "Restart the dev server (npm run dev) if this persists.",
        }),
      );
    }
  };

  return {
    name: "dev-api-proxy",
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}
