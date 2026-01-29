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
  const folderName = path.basename(report.link, ".pdf");
  const html = `
<!DOCTYPE html>
<html lang="sv">
  <head>
    <meta charset="UTF-8" />
    <title>${report.title}</title>
    <meta name="description" content="${report.excerpt}" />
    <meta property="og:title" content="${report.title}" />
    <meta property="og:description" content="${report.excerpt}" />
    <meta property="og:image" content="${makeAbsoluteUrl(report.image)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${makeAbsoluteUrl(`/reports/${folderName}`)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${report.title}" />
    <meta name="twitter:description" content="${report.excerpt}" />
    <meta name="twitter:image" content="${makeAbsoluteUrl(report.image)}" />
    <link rel="canonical" href="${makeAbsoluteUrl(`/reports/${folderName}`)}" />
    <style>
      body {
        background: #000;
        color: #fff;
        margin: 0;
        font-family: system-ui, sans-serif;
      }
      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
      }
      .card {
        background: #181818;
        border-radius: 24px;
        padding: 2.5rem 2rem;
        max-width: 420px;
        box-shadow: 0 0 30px rgba(153,207,255,0.15);
        margin-top: 2rem;
        text-align: center;
      }
      .title {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
        letter-spacing: -0.02em;
      }
      .subtitle {
        font-size: 1.3rem;
        font-weight: 600;
        margin-bottom: 1.2rem;
      }
      .desc {
        color: #b0b0b0;
        font-size: 1.1rem;
        margin-bottom: 2rem;
      }
      .button {
        display: inline-block;
        padding: 0.75rem 2rem;
        background: #181818;
        color: #59a0e1;
        border-radius: 12px;
        font-size: 1.1rem;
        font-weight: 500;
        text-decoration: none;
        border: 1px solid #59a0e1;
        transition: background 0.2s, color 0.2s;
      }
      .button:hover {
        background: #59a0e1;
        color: #181818;
      }
      .cover {
        width: 100%;
        border-radius: 16px;
        margin: 0 0 2rem 0;
        display: block;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="title">${report.title}</div>
      <div class="card">
        <img src="${report.image}" alt="${report.title}" class="cover" />
        <div class="subtitle">${report.title}</div>
        <div class="desc">${report.excerpt}</div>
        <a href="${report.link}" class="button">Öppna rapporten (PDF)</a>
      </div>
    </div>
  </body>
</html>
  `;
  const reportDir = path.join(outputDir, folderName);
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(path.join(reportDir, "index.html"), html.trim());
});

console.log("Static report HTML pages generated.");
