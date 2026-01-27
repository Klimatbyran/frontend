/**
 * Generate OG images for articles and reports using Puppeteer
 * Renders preview components and saves as PNG files
 * 
 * Run: node scripts/generate-og-images.mjs
 * 
 * This script:
 * 1. Reads articles and reports from frontend files (frontend-only data)
 * 2. Generates OG preview images using Puppeteer
 * 3. Saves images to public/og/{type}/{id}.png
 * 
 * Note: Companies and municipalities are handled by backend API endpoints
 * (/api/og/companies/{id} and /api/og/municipalities/{id})
 */

import { readFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";
import { load } from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to wait/delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
function generateReportPreviewHtml(report, publicDir) {
  const truncatedExcerpt =
    report.excerpt && report.excerpt.length > 150
      ? `${report.excerpt.substring(0, 150)}...`
      : report.excerpt || "";

  // Resolve image path to absolute file path
  const imageSrc = report.image 
    ? resolveImagePath(report.image, publicDir) || ""
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
    ${imageSrc ? `<img src="${escapeHtml(imageSrc)}" alt="" style="width: 100%; height: 100%; object-fit: cover;" />` : '<div style="width: 100%; height: 100%; background-color: #121212;"></div>'}
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
 * Convert image path to absolute file path for Puppeteer
 * Handles both relative paths (/images/...) and absolute URLs (https://...)
 */
function resolveImagePath(imagePath, publicDir) {
  if (!imagePath) return null;
  
  // If it's already an absolute URL (http/https), use it as-is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  
  // Convert relative path to absolute file path
  // Remove leading slash and resolve from public directory
  const relativePath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  const absolutePath = resolve(publicDir, relativePath);
  
  // Check if file exists
  if (existsSync(absolutePath)) {
    // Convert to file:// URL for Puppeteer
    return `file://${absolutePath}`;
  }
  
  console.warn(`  ⚠ Image not found: ${imagePath} (resolved to ${absolutePath})`);
  return null;
}

/**
 * Generate Article OG Preview HTML (matches ArticleOgPreview component)
 */
function generateArticlePreviewHtml(article, publicDir) {
  const truncatedExcerpt =
    article.excerpt && article.excerpt.length > 150
      ? `${article.excerpt.substring(0, 150)}...`
      : article.excerpt || "";

  // Resolve image path to absolute file path
  const imageSrc = article.image 
    ? resolveImagePath(article.image, publicDir) || ""
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
    ${imageSrc ? `<img src="${escapeHtml(imageSrc)}" alt="" style="width: 100%; height: 100%; object-fit: cover;" />` : '<div style="width: 100%; height: 100%; background-color: #121212;"></div>'}
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
  const publicDir = resolve(__dirname, "../public");
  const articlesDir = join(outputDir, "articles");
  const reportsDir = join(outputDir, "reports");

  if (!existsSync(articlesDir)) {
    mkdirSync(articlesDir, { recursive: true });
  }
  if (!existsSync(reportsDir)) {
    mkdirSync(reportsDir, { recursive: true });
  }

  try {
    // Generate images for articles (frontend-only, build-time generation)
    console.log("\nGenerating OG images for articles...");
    const blogPostsDir = resolve(__dirname, "../src/lib/blog/posts");
    const blogMetadataPath = resolve(__dirname, "../src/lib/blog/blogPostsList.ts");
    
    // Read blog metadata (simple parsing - just get IDs)
    let articleIds = [];
    try {
      const blogMetadataContent = readFileSync(blogMetadataPath, "utf-8");
      const idMatches = blogMetadataContent.matchAll(/id:\s*"([^"]+)"/g);
      articleIds = Array.from(idMatches, (m) => m[1]);
    } catch (error) {
      console.warn("Could not read blog metadata, skipping articles:", error.message);
    }

    // Read markdown files and parse frontmatter
    const markdownFiles = readdirSync(blogPostsDir).filter((f) => f.endsWith(".md"));
    const articlesProcessed = new Set();
    
    for (const articleId of articleIds) {
      if (articlesProcessed.has(articleId)) continue;
      
      // Try to find markdown file for this article
      let articleMetadata = null;
      for (const filename of markdownFiles) {
        if (filename.startsWith(articleId)) {
          try {
            const filePath = join(blogPostsDir, filename);
            const content = readFileSync(filePath, "utf-8");
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
            if (frontmatterMatch) {
              articleMetadata = load(frontmatterMatch[1]);
              articleMetadata.id = articleId;
              break;
            }
          } catch (error) {
            console.warn(`  ⚠ Could not parse ${filename}:`, error.message);
          }
        }
      }
      
      if (!articleMetadata || !articleMetadata.title) {
        console.warn(`  ⚠ Skipping ${articleId} - missing metadata`);
        continue;
      }
      
      // Generate preview HTML (pass publicDir for image path resolution)
      const html = generateArticlePreviewHtml(articleMetadata, publicDir);
      
      await page.setContent(html);
      // Wait for images to load (increase delay for external URLs)
      await delay(articleMetadata.image?.startsWith("http") ? 2000 : 1000);
      
      const outputPath = join(articlesDir, `${articleId}.png`);
      await page.screenshot({
        path: outputPath,
        type: "png",
        clip: { x: 0, y: 0, width: 1200, height: 630 },
      });
      
      console.log(`  ✓ ${articleMetadata.title} (${articleId}.png)`);
      articlesProcessed.add(articleId);
    }

    // Generate images for reports (frontend-only, build-time generation)
    console.log("\nGenerating OG images for reports...");
    const reportsPath = resolve(__dirname, "../src/lib/constants/reports.ts");
    
    // Simple parsing to extract report data (or we could import it if ESM works)
    let reports = [];
    try {
      // Read the reports file and parse it (simplified - just get basic structure)
      // For a more robust solution, we could use a build step to export JSON
      const reportsContent = readFileSync(reportsPath, "utf-8");
      
      // Try to extract report objects using regex (simplified approach)
      // This is a bit fragile, but works for the current structure
      const reportMatches = reportsContent.matchAll(/{\s*id:\s*"([^"]+)",[\s\S]*?title:\s*"([^"]+)",[\s\S]*?excerpt:\s*"([^"]+)",[\s\S]*?image:\s*"([^"]+)",[\s\S]*?date:\s*"([^"]+)",[\s\S]*?readTime:\s*"([^"]+)",[\s\S]*?category:\s*"([^"]+)"/g);
      
      for (const match of reportMatches) {
        reports.push({
          id: match[1],
          title: match[2],
          excerpt: match[3],
          image: match[4],
          date: match[5],
          readTime: match[6],
          category: match[7],
        });
      }
    } catch (error) {
      console.warn("Could not parse reports file, trying alternative method:", error.message);
      // Fallback: manually list reports (if regex parsing fails)
      reports = [
        { id: "1", title: "Storföretagens historiska utsläpp", excerpt: "En analys av 150 bolags klimatredovisningar", image: "/images/reportImages/2024_report_sv2.png", date: "2025-03-11", readTime: "15 min", category: "report" },
        { id: "2", title: "Bolagsklimatkollen 2024", excerpt: "En analys av 150 svenska storbolags klimatredovisning 2023", image: "/images/reportImages/2023_bolagsklimatkollen2.png", date: "2024-06-01", readTime: "15 min", category: "report" },
        { id: "3", title: "Corporate Climate Checker", excerpt: "An analysis of 150 major Swedish companies' climate reporting 2023", image: "/images/reportImages/2023_corportateclimatechecker2.png", date: "2024-08-01", readTime: "15 min", category: "report" },
        { id: "4", title: "Typology of Data Quality Problems in the Corporate Reporting of GHG Emissions", excerpt: "A typology of data quality problems in corporate reporting of GHG emissions. A report by Green Data, Indicators, Algorithms (Green DIA), funded by the Bavarian Research Institute for Digital Transformation (bidt) and Klimatkollen.", image: "/images/reportImages/typology-of-errors.png", date: "2025-05-26", readTime: "15 min", category: "report" },
        { id: "5", title: "Bolagsklimatkollen 2025", excerpt: "I årets version av rapporten Bolagsklimatkollen analyserar vi 235 storbolags klimatredovisning för 2024. Rapporten är ett samarbete mellan 2050 Consulting och Klimatkollen.", image: "/images/reportImages/2024_bolagsklimatkollen.png", date: "2025-06-23", readTime: "15 min", category: "report" },
        { id: "6", title: "Applying Carbon Law From 2025", excerpt: "Summary of Klimatkollen's investigations for adjustments to the Carbon Law target trajectory, based on 2024 emissions and updated carbon budgets.", image: "/images/reportImages/2025_Carbon_Law.png", date: "2025-06-19", readTime: "7 min", category: "report" },
      ];
    }
    
    for (const report of reports) {
      if (!report.id || !report.title) continue;
      
      // Generate preview HTML (pass publicDir for image path resolution)
      const html = generateReportPreviewHtml(report, publicDir);
      
      await page.setContent(html);
      // Wait for images to load (increase delay for external URLs)
      await delay(report.image?.startsWith("http") ? 2000 : 1000);
      
      const outputPath = join(reportsDir, `${report.id}.png`);
      await page.screenshot({
        path: outputPath,
        type: "png",
        clip: { x: 0, y: 0, width: 1200, height: 630 },
      });
      
      console.log(`  ✓ ${report.title} (${report.id}.png)`);
    }

    console.log("\n✅ OG image generation complete!");
    console.log(
      `Generated ${articlesProcessed.size} article images and ${reports.length} report images.`,
    );
    console.log(
      `\nNote: Companies and municipalities are handled by backend API endpoints.`,
    );
  } finally {
    await browser.close();
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
