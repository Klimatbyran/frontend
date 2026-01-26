import fs from "fs";
import path from "path";
import { getCompanies, getMunicipalities } from "./api.js";
import { createSlug } from "./utils.js";

// Set NODE_TLS_REJECT_UNAUTHORIZED to allow self-signed certificates during development
// This is only used during sitemap generation in Node.js environment
if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

export async function generateSitemap(outputPath: string): Promise<void> {
  try {
    const currentDate = new Date().toISOString().split("T")[0];
    
    // Get site origin from environment variable, fallback to default
    const siteOrigin = process.env.VITE_SITE_ORIGIN || "https://klimatkollen.se";

    // Static routes - Swedish (default)
    const staticRoutes: SitemapEntry[] = [
      {
        loc: `${siteOrigin}/sv/`,
        lastmod: currentDate,
        changefreq: "weekly",
        priority: "1.0",
      },
      {
        loc: `${siteOrigin}/sv/municipalities`,
        lastmod: currentDate,
        changefreq: "monthly",
        priority: "0.8",
      },
      {
        loc: `${siteOrigin}/sv/companies`,
        lastmod: currentDate,
        changefreq: "monthly",
        priority: "0.8",
      },
      {
        loc: `${siteOrigin}/sv/about`,
        lastmod: currentDate,
        changefreq: "monthly",
        priority: "0.7",
      },
      {
        loc: `${siteOrigin}/sv/methodology`,
        lastmod: currentDate,
        changefreq: "monthly",
        priority: "0.6",
      },
      {
        loc: `${siteOrigin}/sv/insights`,
        lastmod: currentDate,
        changefreq: "weekly",
        priority: "0.7",
      },
      {
        loc: `${siteOrigin}/sv/insights/klimatmal`,
        lastmod: currentDate,
        changefreq: "monthly",
        priority: "0.6",
      },
      {
        loc: `${siteOrigin}/sv/insights/utslappsberakning`,
        lastmod: currentDate,
        changefreq: "monthly",
        priority: "0.6",
      },
    ];

    // Static routes - English
    const englishStaticRoutes: SitemapEntry[] = [
      {
        loc: `${siteOrigin}/en`,
        lastmod: currentDate,
        changefreq: "weekly",
        priority: "0.9",
      },
      {
        loc: `${siteOrigin}/en/municipalities`,
        lastmod: currentDate,
        changefreq: "monthly",
        priority: "0.7",
      },
      {
        loc: `${siteOrigin}/en/companies`,
        lastmod: currentDate,
        changefreq: "monthly",
        priority: "0.7",
      },
      {
        loc: `${siteOrigin}/en/about`,
        lastmod: currentDate,
        changefreq: "monthly",
        priority: "0.6",
      },
      {
        loc: `${siteOrigin}/en/methodology`,
        lastmod: currentDate,
        changefreq: "monthly",
        priority: "0.6",
      },
      {
        loc: `${siteOrigin}/en/insights`,
        lastmod: currentDate,
        changefreq: "weekly",
        priority: "0.6",
      },
      {
        loc: `${siteOrigin}/en/insights/klimatmal`,
        lastmod: currentDate,
        changefreq: "monthly",
        priority: "0.5",
      },
      {
        loc: `${siteOrigin}/en/insights/utslappsberakning`,
        lastmod: currentDate,
        changefreq: "monthly",
        priority: "0.5",
      },
    ];

    // Add English routes to all routes
    staticRoutes.push(...englishStaticRoutes);

    // Get dynamic routes
    const allRoutes = [...staticRoutes];

    try {
      // Add municipalities
      const municipalities = await getMunicipalities();
      if (municipalities && municipalities.length > 0) {
        const municipalityRoutes = municipalities
          .filter((municipality) => municipality.name) // Ensure municipality has a name
          .map((municipality) => {
            // Create a URL-friendly ID from the municipality name
            const id = createSlug(municipality.name);

            return {
              loc: `${siteOrigin}/sv/municipalities/${id}`,
              lastmod: currentDate,
              changefreq: "monthly",
              priority: "0.6",
            };
          });

        // Add English versions of municipality routes
        const englishMunicipalityRoutes = municipalityRoutes.map((route) => ({
          ...route,
          loc: route.loc.replace(
            `${siteOrigin}/sv/municipalities/`,
            `${siteOrigin}/en/municipalities/`,
          ),
          priority: "0.5", // Slightly lower priority for English versions
        }));

        allRoutes.push(...municipalityRoutes);
        allRoutes.push(...englishMunicipalityRoutes);
        console.log(
          `Added ${municipalityRoutes.length} Swedish and ${englishMunicipalityRoutes.length} English municipality routes to sitemap`,
        );
      }

      // Add companies
      const companies = await getCompanies();
      if (companies && companies.length > 0) {
        const companyRoutes = companies.map((company) => {
          // Create a URL-friendly slug from the company name
          const slug = createSlug(company.name);

          return {
            loc: `${siteOrigin}/sv/foretag/${slug}-${company.wikidataId}`,
            lastmod: currentDate,
            changefreq: "monthly",
            priority: "0.6",
          };
        });

        // Add English versions of company routes
        const englishCompanyRoutes = companies.map((company) => {
          const slug = createSlug(company.name);

          return {
            loc: `${siteOrigin}/en/companies/${company.wikidataId}/${slug}`,
            lastmod: currentDate,
            changefreq: "monthly",
            priority: "0.5", // Slightly lower priority for English versions
          };
        });

        allRoutes.push(...companyRoutes);
        allRoutes.push(...englishCompanyRoutes);
        console.log(
          `Added ${companyRoutes.length} Swedish and ${englishCompanyRoutes.length} English company routes to sitemap`,
        );
      }
    } catch (error) {
      console.error("Error fetching dynamic routes:", error);
      // Continue with static routes if dynamic routes fail
    }

    // Generate XML with language alternates
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allRoutes
  .map((route) => {
    // Generate alternate links for each URL
    let alternateLinks = "";

    // Skip generating alternates for URLs that already have language prefixes
    if (!route.loc.includes("/en/")) {
      const enUrl = route.loc.replace(
        `${siteOrigin}/sv/`,
        `${siteOrigin}/en/`,
      );
      alternateLinks = `
    <xhtml:link rel="alternate" hreflang="sv" href="${route.loc}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${route.loc}" />`;
    } else if (route.loc.includes("/en/")) {
      const svUrl = route.loc.replace(
        `${siteOrigin}/en/`,
        `${siteOrigin}/sv/`,
      );
      alternateLinks = `
    <xhtml:link rel="alternate" hreflang="sv" href="${svUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${route.loc}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${svUrl}" />`;
    }

    return `  <url>
    <loc>${route.loc}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>${alternateLinks}
  </url>`;
  })
  .join("\n")}
</urlset>`;

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write to file
    fs.writeFileSync(outputPath, xml);
    console.log(
      `Sitemap generated at ${outputPath} with ${allRoutes.length} URLs`,
    );
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }
}
