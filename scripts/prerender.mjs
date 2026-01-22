/**
 * Prerender script for generating static HTML files
 * Uses Puppeteer to render routes and save HTML files
 * 
 * Install dependencies: npm install --save-dev puppeteer
 * Run: node scripts/prerender.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, statSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";

// Prerender routes - defined here to avoid TypeScript import issues
const prerenderRoutes = [
  // Home routes (both languages)
  "/sv",
  "/en",

  // Public pages
  "/sv/about",
  "/en/about",
  "/sv/methodology",
  "/en/methodology",
  "/sv/support",
  "/en/support",
  "/sv/privacy",
  "/en/privacy",
  "/sv/products",
  "/en/products",

  // Explore pages
  "/sv/explore",
  "/en/explore",
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple HTTP server to serve dist files
function createStaticServer(distDir, port) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let filePath = join(distDir, req.url === "/" ? "index.html" : req.url);

      // If it's a directory, try index.html
      try {
        const stat = statSync(filePath);
        if (stat.isDirectory()) {
          filePath = join(filePath, "index.html");
        }
      } catch (e) {
        // File doesn't exist, try as file
      }

      // If file doesn't exist, serve index.html (for SPA routing)
      try {
        const content = readFileSync(filePath);
        const ext = filePath.split(".").pop();
        const contentType =
          ext === "html"
            ? "text/html"
            : ext === "js"
              ? "application/javascript"
              : ext === "css"
                ? "text/css"
                : "application/octet-stream";
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
      } catch (e) {
        // Fallback to index.html for SPA routes
        try {
          const content = readFileSync(join(distDir, "index.html"));
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(content);
        } catch (e2) {
          res.writeHead(404);
          res.end("Not found");
        }
      }
    });

    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function prerender() {
  let puppeteer;
  try {
    puppeteer = await import("puppeteer");
  } catch (error) {
    console.error(
      "Puppeteer not found. Install it with: npm install --save-dev puppeteer",
    );
    process.exit(1);
  }

  const distDir = resolve(__dirname, "../dist");
  const indexPath = join(distDir, "index.html");

  // Check if dist/index.html exists
  try {
    readFileSync(indexPath, "utf-8");
  } catch (error) {
    console.error(
      "dist/index.html not found. Please run 'npm run build' first.",
    );
    process.exit(1);
  }

  console.log("Starting prerender...");
  console.log(`Routes to prerender: ${prerenderRoutes.length}`);

  // Start local server
  const port = 4173;
  const server = await createStaticServer(distDir, port);
  const baseUrl = `http://localhost:${port}`;

  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 });

  // Read the base index.html template
  const baseHTML = readFileSync(indexPath, "utf-8");

  for (const route of prerenderRoutes) {
    try {
      console.log(`Prerendering: ${route}`);

      // Navigate to the route
      await page.goto(`${baseUrl}${route}`, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      // Wait for React to render and Helmet to update
      await page.waitForTimeout(2000);

      // Wait for root element to have content
      try {
        await page.waitForFunction(
          () => {
            const root = document.querySelector("#root");
            return root && root.innerHTML.length > 0;
          },
          { timeout: 10000 },
        );
      } catch (e) {
        console.warn(`Timeout waiting for content on ${route}`);
      }

      // Wait for any async content
      await page.waitForSelector("#root", { timeout: 5000 });

      // Get the rendered HTML with updated head (from Helmet)
      const html = await page.content();

      // Extract the head and body content
      const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

      if (!headMatch || !bodyMatch) {
        console.warn(`Could not extract head/body for ${route}`);
        continue;
      }

      // Determine output path
      // For root routes, use dist/index.html
      // For other routes, create route/index.html
      let routeDir;
      let routeIndexPath;

      if (route === "/" || route === "/sv" || route === "/en") {
        // For home routes, we'll create separate files
        routeDir = route === "/" ? distDir : join(distDir, route);
        routeIndexPath = join(routeDir, "index.html");
      } else {
        routeDir = join(distDir, route);
        routeIndexPath = join(routeDir, "index.html");
      }

      // Create directory if needed
      mkdirSync(routeDir, { recursive: true });

      // Create the final HTML with updated head (SEO meta tags) and body
      const finalHTML = `<!DOCTYPE html>
<html lang="sv">
${headMatch[1]}
${bodyMatch[1]}
</html>`;

      writeFileSync(routeIndexPath, finalHTML, "utf-8");
      console.log(`✓ Prerendered: ${route} -> ${routeIndexPath}`);
    } catch (error) {
      console.error(`✗ Failed to prerender ${route}:`, error.message);
    }
  }

  await browser.close();
  server.close();
  console.log("Prerender complete!");
}

prerender().catch((error) => {
  console.error("Prerender failed:", error);
  process.exit(1);
});
