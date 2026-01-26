/**
 * Generate OG images for entities using Puppeteer
 * Renders React components and saves as PNG files
 * 
 * Run: node scripts/generate-og-images.mjs
 * 
 * This script:
 * 1. Fetches companies and municipalities from the API
 * 2. Generates SEO meta for each entity
 * 3. Renders OG images using Puppeteer
 * 4. Saves images to public/og/{type}/{id}.png
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to wait/delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Simple HTTP server to serve the OG image HTML page
function createOgImageServer(htmlContent, port) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      if (req.url === "/og-image") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(htmlContent);
      } else {
        res.writeHead(404);
        res.end("Not found");
      }
    });

    server.listen(port, () => {
      console.log(`OG Image server running on http://localhost:${port}`);
      resolve(server);
    });
  });
}

/**
 * Generate Company OG Preview HTML (matches CompanyOgPreview component)
 */
function generateCompanyPreviewHtml(company, options = {}) {
  const {
    latestYear,
    totalEmissions,
    emissionsChange,
    industry,
  } = options;

  const formattedEmissions = totalEmissions
    ? `${(totalEmissions / 1_000_000).toFixed(1)} Mt CO₂e`
    : "No data";

  const changeDisplay = emissionsChange
    ? `${emissionsChange > 0 ? "+" : ""}${emissionsChange.toFixed(1)}%`
    : null;

  const parisStatus =
    company.meetsParis === true
      ? "On Track"
      : company.meetsParis === false
        ? "Not on Track"
        : "Unknown";

  const logoHtml = company.logoUrl
    ? `<img src="${escapeHtml(company.logoUrl)}" alt="" style="height: 60px; width: auto; object-fit: contain;" />`
    : "";

  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OG Image</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: 1200px;
      height: 630px;
      display: flex;
      flex-direction: column;
      background-color: #000000;
      font-family: "DM Sans", system-ui, -apple-system, sans-serif;
      position: relative;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <!-- Header Section -->
  <div style="padding: 60px 80px 40px; border-bottom: 1px solid #2e2e2e;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 56px; font-weight: 300; line-height: 1.1; color: #ffffff; margin: 0; margin-bottom: 8px; letter-spacing: -0.02em;">
          ${escapeHtml(company.name)}
        </h1>
        ${industry ? `<div style="font-size: 20px; color: #878787; margin-top: 4px;">${escapeHtml(industry)}</div>` : ""}
      </div>
      ${logoHtml}
    </div>
  </div>

  <!-- Stats Section -->
  <div style="flex: 1; padding: 40px 80px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px;">
    <!-- Total Emissions -->
    <div>
      <div style="font-size: 18px; color: #878787; margin-bottom: 12px;">
        Total Emissions${latestYear ? ` (${latestYear})` : ""}
      </div>
      <div style="font-size: 42px; font-weight: 600; color: #ffffff;">
        ${escapeHtml(formattedEmissions)}
      </div>
    </div>

    <!-- Year-over-Year Change -->
    ${changeDisplay ? `
    <div>
      <div style="font-size: 18px; color: #878787; margin-bottom: 12px;">
        Year-over-Year Change
      </div>
      <div style="font-size: 42px; font-weight: 600; color: ${emissionsChange < 0 ? "#aae506" : "#f0759a"};">
        ${escapeHtml(changeDisplay)}
      </div>
    </div>
    ` : `
    <div>
      <div style="font-size: 18px; color: #878787; margin-bottom: 12px;">
        Year-over-Year Change
      </div>
      <div style="font-size: 42px; font-weight: 600; color: #ffffff;">
        No data
      </div>
    </div>
    `}

    <!-- Paris Alignment -->
    <div>
      <div style="font-size: 18px; color: #878787; margin-bottom: 12px;">
        Paris Alignment
      </div>
      <div style="font-size: 42px; font-weight: 600; color: #ffffff;">
        ${escapeHtml(parisStatus)}
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div style="padding: 24px 80px; background-color: #121212; border-top: 1px solid #2e2e2e; display: flex; justify-content: space-between; align-items: center;">
    <div style="font-size: 20px; font-weight: 600; color: #ffffff;">
      Klimatkollen
    </div>
    <div style="font-size: 16px; color: #878787;">
      klimatkollen.se
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate Municipality OG Preview HTML (matches MunicipalityOgPreview component)
 */
function generateMunicipalityPreviewHtml(municipality, options = {}) {
  const { latestYear, totalEmissions, emissionsChange } = options;

  const formattedEmissions = totalEmissions
    ? `${(totalEmissions / 1_000).toFixed(1)} kt CO₂e`
    : "No data";

  const changeDisplay = emissionsChange
    ? `${emissionsChange > 0 ? "+" : ""}${emissionsChange.toFixed(1)}%`
    : null;

  const parisStatus =
    municipality.meetsParisGoal === true
      ? "On Track"
      : municipality.meetsParisGoal === false
        ? "Not on Track"
        : "Unknown";

  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OG Image</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: 1200px;
      height: 630px;
      display: flex;
      flex-direction: column;
      background-color: #000000;
      font-family: "DM Sans", system-ui, -apple-system, sans-serif;
      position: relative;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <!-- Header Section -->
  <div style="padding: 60px 80px 40px; border-bottom: 1px solid #2e2e2e;">
    <h1 style="font-size: 56px; font-weight: 300; line-height: 1.1; color: #ffffff; margin: 0; margin-bottom: 8px; letter-spacing: -0.02em;">
      ${escapeHtml(municipality.name)}
    </h1>
    <div style="font-size: 20px; color: #878787; margin-top: 4px;">
      Municipality
    </div>
  </div>

  <!-- Stats Section -->
  <div style="flex: 1; padding: 40px 80px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px;">
    <!-- Total Emissions -->
    <div>
      <div style="font-size: 18px; color: #878787; margin-bottom: 12px;">
        Total Emissions${latestYear ? ` (${latestYear})` : ""}
      </div>
      <div style="font-size: 42px; font-weight: 600; color: #ffffff;">
        ${escapeHtml(formattedEmissions)}
      </div>
    </div>

    <!-- Historical Change -->
    ${changeDisplay ? `
    <div>
      <div style="font-size: 18px; color: #878787; margin-bottom: 12px;">
        Historical Change
      </div>
      <div style="font-size: 42px; font-weight: 600; color: ${emissionsChange < 0 ? "#aae506" : "#f0759a"};">
        ${escapeHtml(changeDisplay)}
      </div>
    </div>
    ` : `
    <div>
      <div style="font-size: 18px; color: #878787; margin-bottom: 12px;">
        Historical Change
      </div>
      <div style="font-size: 42px; font-weight: 600; color: #ffffff;">
        No data
      </div>
    </div>
    `}

    <!-- Paris Alignment -->
    <div>
      <div style="font-size: 18px; color: #878787; margin-bottom: 12px;">
        Paris Alignment
      </div>
      <div style="font-size: 42px; font-weight: 600; color: #ffffff;">
        ${escapeHtml(parisStatus)}
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div style="padding: 24px 80px; background-color: #121212; border-top: 1px solid #2e2e2e; display: flex; justify-content: space-between; align-items: center;">
    <div style="font-size: 20px; font-weight: 600; color: #ffffff;">
      Klimatkollen
    </div>
    <div style="font-size: 16px; color: #878787;">
      klimatkollen.se
    </div>
  </div>
</body>
</html>
  `.trim();
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Generate Report OG Preview HTML (matches ReportOgPreview component)
 */
function generateReportPreviewHtml(report) {
  const truncatedExcerpt =
    report.excerpt && report.excerpt.length > 150
      ? `${report.excerpt.substring(0, 150)}...`
      : report.excerpt || "";

  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OG Image</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: 1200px;
      height: 630px;
      display: flex;
      flexDirection: column;
      background-color: #000000;
      font-family: "DM Sans", system-ui, -apple-system, sans-serif;
      position: relative;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <!-- Image Section -->
  <div style="position: relative; height: 280px; overflow: hidden;">
    <img src="${escapeHtml(report.image)}" alt="" style="width: 100%; height: 100%; object-fit: cover;" />
    <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 80px; background: linear-gradient(to top, rgba(0, 0, 0, 0.95), transparent);"></div>
  </div>

  <!-- Content Section -->
  <div style="flex: 1; padding: 50px 80px; display: flex; flex-direction: column; justify-content: space-between;">
    <!-- Metadata -->
    ${report.category || report.date || report.readTime ? `
    <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 24px; flex-wrap: wrap;">
      ${report.category ? `<span style="padding: 6px 16px; background-color: rgba(89, 160, 225, 0.2); color: #59a0e1; border-radius: 9999px; font-size: 16px; font-weight: 500;">${escapeHtml(report.category)}</span>` : ""}
      ${report.date ? `<div style="display: flex; align-items: center; gap: 8px; color: #878787; font-size: 16px;">${escapeHtml(report.date)}</div>` : ""}
      ${report.readTime ? `<div style="display: flex; align-items: center; gap: 8px; color: #878787; font-size: 16px;">${escapeHtml(report.readTime)}</div>` : ""}
    </div>
    ` : ""}

    <!-- Title -->
    <h1 style="font-size: 56px; font-weight: 300; line-height: 1.2; color: #ffffff; margin: 0; margin-bottom: 24px; max-width: 1000px; letter-spacing: -0.02em;">
      ${escapeHtml(report.title)}
    </h1>

    <!-- Excerpt -->
    ${truncatedExcerpt ? `<p style="font-size: 24px; line-height: 1.5; color: #878787; margin: 0; max-width: 900px;">${escapeHtml(truncatedExcerpt)}</p>` : ""}

    <!-- Footer -->
    <div style="margin-top: auto; padding-top: 32px; border-top: 1px solid #2e2e2e; display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 20px; font-weight: 600; color: #ffffff;">Klimatkollen</div>
      <div style="font-size: 16px; color: #878787;">klimatkollen.se</div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate Article OG Preview HTML (matches ArticleOgPreview component)
 */
function generateArticlePreviewHtml(article) {
  const truncatedExcerpt =
    article.excerpt && article.excerpt.length > 150
      ? `${article.excerpt.substring(0, 150)}...`
      : article.excerpt || "";

  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OG Image</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: 1200px;
      height: 630px;
      display: flex;
      flexDirection: column;
      background-color: #000000;
      font-family: "DM Sans", system-ui, -apple-system, sans-serif;
      position: relative;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <!-- Image Section -->
  <div style="position: relative; height: 280px; overflow: hidden;">
    <img src="${escapeHtml(article.image)}" alt="" style="width: 100%; height: 100%; object-fit: cover;" />
    <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 80px; background: linear-gradient(to top, rgba(0, 0, 0, 0.95), transparent);"></div>
  </div>

  <!-- Content Section -->
  <div style="flex: 1; padding: 50px 80px; display: flex; flex-direction: column; justify-content: space-between;">
    <!-- Metadata -->
    ${article.category || article.date || article.readTime || article.language ? `
    <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 24px; flex-wrap: wrap;">
      ${article.category ? `<span style="padding: 6px 16px; background-color: rgba(89, 160, 225, 0.2); color: #59a0e1; border-radius: 9999px; font-size: 16px; font-weight: 500;">${escapeHtml(article.category)}</span>` : ""}
      ${article.date ? `<div style="display: flex; align-items: center; gap: 8px; color: #878787; font-size: 16px;">${escapeHtml(article.date)}</div>` : ""}
      ${article.readTime ? `<div style="display: flex; align-items: center; gap: 8px; color: #878787; font-size: 16px;">${escapeHtml(article.readTime)}</div>` : ""}
      ${article.language ? `<div style="display: flex; align-items: center; gap: 8px; color: #878787; font-size: 16px;">${escapeHtml(article.language)}</div>` : ""}
    </div>
    ` : ""}

    <!-- Title -->
    <h1 style="font-size: 56px; font-weight: 300; line-height: 1.2; color: #ffffff; margin: 0; margin-bottom: 24px; max-width: 1000px; letter-spacing: -0.02em;">
      ${escapeHtml(article.title)}
    </h1>

    <!-- Excerpt -->
    ${truncatedExcerpt ? `<p style="font-size: 24px; line-height: 1.5; color: #878787; margin: 0; max-width: 900px;">${escapeHtml(truncatedExcerpt)}</p>` : ""}

    <!-- Footer -->
    <div style="margin-top: auto; padding-top: 32px; border-top: 1px solid #2e2e2e; display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 20px; font-weight: 600; color: #ffffff;">Klimatkollen</div>
      <div style="font-size: 16px; color: #878787;">klimatkollen.se</div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate OG images for entities
 */
async function generateOgImages() {
  let puppeteer;
  try {
    puppeteer = await import("puppeteer");
  } catch (e) {
    console.error(
      "Puppeteer not found. Install it with: npm install --save-dev puppeteer",
    );
    process.exit(1);
  }

  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });

  // Create output directories
  const outputDir = resolve(__dirname, "../public/og");
  const companiesDir = join(outputDir, "companies");
  const municipalitiesDir = join(outputDir, "municipalities");

  if (!existsSync(companiesDir)) {
    mkdirSync(companiesDir, { recursive: true });
  }
  if (!existsSync(municipalitiesDir)) {
    mkdirSync(municipalitiesDir, { recursive: true });
  }

  // Note: Server not needed for preview approach, but keeping for compatibility
  const serverPort = 3001;
  const server = await createOgImageServer("", serverPort);

  try {
    console.log("Fetching entities from API...");

    // Fetch companies and municipalities from API
    const apiBaseUrl =
      process.env.VITE_API_PROXY ||
      process.env.API_URL ||
      "https://api.klimatkollen.se/api";

    let companies = [];
    let municipalities = [];

    try {
      const companiesResponse = await fetch(`${apiBaseUrl}/companies/`);
      if (companiesResponse.ok) {
        companies = await companiesResponse.json();
        console.log(`Found ${companies.length} companies`);
      } else {
        console.warn(
          `Failed to fetch companies: ${companiesResponse.status}`,
        );
      }
    } catch (error) {
      console.warn("Error fetching companies:", error.message);
    }

    try {
      const municipalitiesResponse = await fetch(
        `${apiBaseUrl}/municipalities/`,
      );
      if (municipalitiesResponse.ok) {
        municipalities = await municipalitiesResponse.json();
        console.log(`Found ${municipalities.length} municipalities`);
      } else {
        console.warn(
          `Failed to fetch municipalities: ${municipalitiesResponse.status}`,
        );
      }
    } catch (error) {
      console.warn("Error fetching municipalities:", error.message);
    }

    // Generate images for companies
    // Limit can be set via OG_IMAGE_LIMIT env var (default: 10 for testing)
    const limit = parseInt(process.env.OG_IMAGE_LIMIT || "10", 10);
    const shouldLimit = process.env.OG_IMAGE_LIMIT !== "0" && limit > 0;
    const companiesToProcess = shouldLimit ? companies.slice(0, limit) : companies;
    
    console.log(
      `\nGenerating OG images for companies... (${companiesToProcess.length} of ${companies.length})`,
    );
    for (const company of companiesToProcess) {
      const entityId = company.wikidataId || company.id;
      if (!entityId) continue;

      // Fetch full company details for preview
      let companyDetails = company;
      try {
        const detailsResponse = await fetch(
          `${apiBaseUrl}/companies/${entityId}`,
        );
        if (detailsResponse.ok) {
          companyDetails = await detailsResponse.json();
        }
      } catch (error) {
        console.warn(`  ⚠ Could not fetch details for ${company.name}, using list data`);
      }

      // Calculate stats for preview
      const sortedPeriods = companyDetails.reportingPeriods
        ? [...companyDetails.reportingPeriods].sort(
            (a, b) =>
              new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
          )
        : [];
      const latestPeriod = sortedPeriods[0];
      const previousPeriod = sortedPeriods[1];
      const latestYear = latestPeriod
        ? new Date(latestPeriod.endDate).getFullYear()
        : undefined;
      const totalEmissions =
        latestPeriod?.emissions?.calculatedTotalEmissions || null;
      const prevEmissions =
        previousPeriod?.emissions?.calculatedTotalEmissions || null;
      const emissionsChange =
        totalEmissions && prevEmissions && prevEmissions > 0
          ? ((totalEmissions - prevEmissions) / prevEmissions) * 100
          : null;

      // Get industry (simplified - you may want to fetch sector names)
      const industry =
        companyDetails.industry?.industryGics?.sectorName || null;

      // Generate preview HTML
      const html = generateCompanyPreviewHtml(companyDetails, {
        latestYear,
        totalEmissions,
        emissionsChange,
        industry,
      });

      await page.setContent(html);
      await delay(500); // Wait for rendering

      const outputPath = join(companiesDir, `${entityId}.png`);
      await page.screenshot({
        path: outputPath,
        type: "png",
        clip: { x: 0, y: 0, width: 1200, height: 630 },
      });

      console.log(`  ✓ ${company.name} (${entityId}.png)`);
    }

    // Generate images for municipalities
    const municipalitiesToProcess = shouldLimit
      ? municipalities.slice(0, limit)
      : municipalities;
    
    console.log(
      `\nGenerating OG images for municipalities... (${municipalitiesToProcess.length} of ${municipalities.length})`,
    );
    for (const municipality of municipalitiesToProcess) {
      const entityId =
        municipality.name?.toLowerCase().replace(/\s+/g, "-") ||
        municipality.id;
      if (!entityId) continue;

      // Fetch full municipality details for preview
      let municipalityDetails = municipality;
      try {
        const detailsResponse = await fetch(
          `${apiBaseUrl}/municipalities/${encodeURIComponent(municipality.name)}`,
        );
        if (detailsResponse.ok) {
          municipalityDetails = await detailsResponse.json();
        }
      } catch (error) {
        console.warn(`  ⚠ Could not fetch details for ${municipality.name}, using list data`);
      }

      // Calculate stats for preview
      const emissions = municipalityDetails.emissions || [];
      const latestEmissions = emissions[emissions.length - 1];
      const previousEmissions = emissions[emissions.length - 2];
      const latestYear = latestEmissions?.year || undefined;
      const totalEmissions = latestEmissions?.value || null;
      const prevEmissions = previousEmissions?.value || null;
      const emissionsChange =
        totalEmissions && prevEmissions && prevEmissions > 0
          ? ((totalEmissions - prevEmissions) / prevEmissions) * 100
          : municipalityDetails.historicalEmissionChangePercent || null;

      // Generate preview HTML
      const html = generateMunicipalityPreviewHtml(municipalityDetails, {
        latestYear,
        totalEmissions,
        emissionsChange,
      });

      await page.setContent(html);
      await delay(500); // Wait for rendering

      const outputPath = join(municipalitiesDir, `${entityId}.png`);
      await page.screenshot({
        path: outputPath,
        type: "png",
        clip: { x: 0, y: 0, width: 1200, height: 630 },
      });

      console.log(`  ✓ ${municipality.name} (${entityId}.png)`);
    }

    console.log("\n✅ OG image generation complete!");
    console.log(
      `Generated ${companiesToProcess.length} company images and ${municipalitiesToProcess.length} municipality images.`,
    );
    if (shouldLimit) {
      console.log(
        `\nNote: Limited to ${limit} of each for testing. To generate all, set OG_IMAGE_LIMIT=0 or remove the limit.`,
      );
      console.log(
        `  Example: OG_IMAGE_LIMIT=0 npm run generate:og-images`,
      );
    }
  } finally {
    await browser.close();
    server.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateOgImages().catch((error) => {
    console.error("Error generating OG images:", error);
    process.exit(1);
  });
}

export { generateOgImages };
