import fs from "fs";
import path from "path";
import { fetchDynamicRoutes } from "./sitemap/dynamic-routes";
import { createStaticRoutes } from "./sitemap/static-routes";
import { buildSitemapXml } from "./sitemap/xml-builder";

// Set NODE_TLS_REJECT_UNAUTHORIZED to allow self-signed certificates during development
// This is only used during sitemap generation in Node.js environment
if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export async function generateSitemap(outputPath: string): Promise<void> {
  try {
    const currentDate = new Date().toISOString().split("T")[0];
    const staticRoutes = createStaticRoutes(currentDate);
    const { routes: dynamicRoutes, error: dynamicError } =
      await fetchDynamicRoutes(currentDate);
    if (dynamicError) {
      console.error("Error fetching dynamic routes:", dynamicError);
    }
    const allRoutes = [...staticRoutes, ...dynamicRoutes];
    const xml = buildSitemapXml(allRoutes);

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, xml);
    console.log(
      `Sitemap generated at ${outputPath} with ${allRoutes.length} URLs`,
    );
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }
}
