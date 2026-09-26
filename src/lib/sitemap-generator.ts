import fs from "fs";
import path from "path";
import { fetchDynamicRoutes } from "./sitemap/dynamic-routes";
import { createStaticRoutes } from "./sitemap/static-routes";
import { buildSitemapXml } from "./sitemap/xml-builder";

export async function generateSitemap(outputPath: string): Promise<void> {
  try {
    const currentDate = new Date().toISOString().split("T")[0];
    const staticRoutes = createStaticRoutes(currentDate);
    const { routes: dynamicRoutes, error: dynamicError } =
      await fetchDynamicRoutes(currentDate);
    if (dynamicError || dynamicRoutes.length === 0) {
      console.error("Error fetching dynamic routes:", dynamicError);
      if (fs.existsSync(outputPath)) {
        console.error(
          "Leaving the existing sitemap in place instead of replacing it.",
        );
        return;
      }
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
