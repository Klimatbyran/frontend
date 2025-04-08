import { generateSitemap } from "../src/lib/sitemap-generator.js";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate sitemap for the public directory
const publicPath = path.resolve(__dirname, "../public/sitemap.xml");

generateSitemap(publicPath)
  .then(() => {
    console.log("Sitemap generation completed successfully!");
  })
  .catch((error) => {
    console.error("Error generating sitemap:", error);
    process.exit(1);
  });
