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

      // Node fetch decompresses gzip/br bodies. Drop encoding/length so the
      // browser does not try to decode an already-plain response (which shows
      // up as net::ERR_CONTENT_DECODING_FAILED for endpoints like stage API).
      const hopByHopHeaders = new Set([
        "transfer-encoding",
        "content-encoding",
        "content-length",
      ]);

      res.statusCode = upstream.status;
      upstream.headers.forEach((value, key) => {
        if (hopByHopHeaders.has(key.toLowerCase())) return;
        res.setHeader(key, value);
      });

      const buffer = Buffer.from(await upstream.arrayBuffer());
      res.end(buffer);
    } catch (error) {
      next(error as Error);
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
