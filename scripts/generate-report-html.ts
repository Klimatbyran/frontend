import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { reports } from "../src/lib/constants/reports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, "../public/reports");

function makeAbsoluteUrl(relativePath: string) {
  return `https://klimatkollen.se${relativePath}`;
}

reports.forEach((report) => {
  const folderName = path.basename(report.pdfUrl, ".pdf");
  const html = `
<!DOCTYPE html>
<html lang="sv">
  <head>
    <meta charset="UTF-8" />
    <title>${report.title}</title>
    <meta name="description" content="${report.excerpt}" />
    <meta property="og:title" content="${report.title}" />
    <meta property="og:description" content="${report.excerpt}" />
    <meta property="og:image" content="${makeAbsoluteUrl(report.coverImage)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${makeAbsoluteUrl(`/reports/${folderName}`)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${report.title}" />
    <meta name="twitter:description" content="${report.excerpt}" />
    <meta name="twitter:image" content="${makeAbsoluteUrl(report.coverImage)}" />
    <link rel="canonical" href="${makeAbsoluteUrl(`/reports/${folderName}`)}" />
    <style>
      body {
        background: #000;
        color: #59a0e1;
        margin: 0;
        font-family: system-ui, sans-serif;
      }
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
      }
      .loading-text {
        font-size: 2rem;
        font-weight: 500;
        color: #59a0e1;
        letter-spacing: 0.02em;
        margin-top: 1.5rem;
      }
      .spinner {
        border: 4px solid #222;
        border-top: 4px solid #59a0e1;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        animation: spin 1s linear infinite;
        margin-bottom: 1.5rem;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
    <script>
      var isBot = /bot|crawl|spider|slack|facebook|twitter|linkedin|embed/i.test(navigator.userAgent);
      if (!isBot) {
        setTimeout(function() {
          window.location.href = "/sv/reports/${folderName}";
        }, 400);
      }
    </script>
  </head>
  <body>
    <div class="loading-container">
      <div class="spinner"></div>
      <div class="loading-text">Laddar rapport...</div>
    </div>
  </body>
</html>
  `;
  const reportDir = path.join(outputDir, folderName);
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(path.join(reportDir, "index.html"), html.trim());
});

console.log("Static report HTML pages generated.");
