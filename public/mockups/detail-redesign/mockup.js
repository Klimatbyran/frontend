const SERIES = {
  "muni-past": {
    type: "area",
    color: "#FDB768",
    years: [2015, 2017, 2019, 2021, 2023],
    values: [290, 268, 245, 228, 210],
  },
  "muni-future": {
    type: "dual",
    years: [2023, 2025, 2030, 2035, 2040, 2045, 2050],
    trend: [210, 197, 168, 143, 122, 104, 88],
    paris: [210, 162, 85, 45, 24, 12, 7],
  },
  "muni-sectors": {
    type: "pie",
    slices: [
      { value: 41, color: "#F48F2A" },
      { value: 24, color: "#59A0E1" },
      { value: 18, color: "#AAE506" },
      { value: 17, color: "#F0759A" },
    ],
  },
  "region-past": {
    type: "area",
    color: "#FDB768",
    years: [1990, 2000, 2010, 2015, 2020, 2023],
    values: [18.2, 16.1, 14.0, 12.8, 11.4, 10.7],
  },
  "region-future": {
    type: "dual",
    years: [2023, 2025, 2030, 2035, 2040, 2045, 2050],
    trend: [10.7, 9.4, 6.9, 5.1, 3.7, 2.7, 2.0],
    paris: [10.7, 8.3, 4.4, 2.3, 1.2, 0.65, 0.35],
  },
  "company-past": {
    type: "stacked",
    years: [2019, 2020, 2021, 2022, 2023, 2024],
    scope12: [1.4, 1.2, 1.1, 1.15, 1.05, 1.0],
    scope3: [42, 36, 34, 37, 36.5, 37],
  },
  "company-future": {
    type: "dual",
    years: [2024, 2025, 2030, 2035, 2040, 2045, 2050],
    trend: [38, 37.5, 36, 34.5, 33, 31.5, 30],
    paris: [38, 33.4, 17.6, 9.3, 4.9, 2.6, 1.4],
  },
};

function pad(n) {
  return Number(n.toFixed(2));
}

function linePath(points) {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${pad(p.x)} ${pad(p.y)}`)
    .join(" ");
}

function areaPath(points, baselineY) {
  if (!points.length) return "";
  const top = linePath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${top} L${pad(last.x)} ${pad(baselineY)} L${pad(first.x)} ${pad(baselineY)} Z`;
}

function mapPoints(values, years, box) {
  const min = Math.min(...values) * 0.85;
  const max = Math.max(...values) * 1.05;
  const span = max - min || 1;
  return values.map((v, i) => ({
    x: box.x + (i / Math.max(years.length - 1, 1)) * box.w,
    y: box.y + box.h - ((v - min) / span) * box.h,
    year: years[i],
    value: v,
  }));
}

function renderArea(el, data) {
  const box = { x: 36, y: 16, w: 640, h: 200 };
  const points = mapPoints(data.values, data.years, box);
  const path = linePath(points);
  const area = areaPath(points, box.y + box.h);
  const labels = data.years
    .map((year, i) => {
      const p = points[i];
      return `<text class="axis-label" x="${pad(p.x)}" y="${box.y + box.h + 22}" text-anchor="middle">${year}</text>`;
    })
    .join("");

  el.innerHTML = `
    <svg viewBox="0 0 700 250" role="img" aria-label="Historical emissions chart">
      <defs>
        <linearGradient id="areaGrad-${data.color}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${data.color}" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="${data.color}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <line x1="${box.x}" y1="${box.y + box.h}" x2="${box.x + box.w}" y2="${box.y + box.h}" stroke="rgba(255,255,255,0.08)"/>
      <path class="chart-area" d="${area}" fill="url(#areaGrad-${data.color})"/>
      <path class="chart-line" d="${path}" stroke="${data.color}" style="stroke-dasharray:900;stroke-dashoffset:900;animation:draw 1.2s ease forwards"/>
      ${points
        .map(
          (p) =>
            `<circle cx="${pad(p.x)}" cy="${pad(p.y)}" r="3.5" fill="${data.color}"/>`,
        )
        .join("")}
      ${labels}
    </svg>
  `;
}

function renderDual(el, data) {
  const box = { x: 36, y: 16, w: 640, h: 250 };
  const all = [...data.trend, ...data.paris];
  const min = 0;
  const max = Math.max(...all) * 1.08;
  const span = max - min || 1;
  const toPoints = (values) =>
    values.map((v, i) => ({
      x: box.x + (i / Math.max(data.years.length - 1, 1)) * box.w,
      y: box.y + box.h - ((v - min) / span) * box.h,
    }));
  const trendPts = toPoints(data.trend);
  const parisPts = toPoints(data.paris);
  const labels = data.years
    .filter((_, i) => i === 0 || i === data.years.length - 1 || i % 2 === 0)
    .map((year) => {
      const i = data.years.indexOf(year);
      const x = box.x + (i / Math.max(data.years.length - 1, 1)) * box.w;
      return `<text class="axis-label" x="${pad(x)}" y="${box.y + box.h + 22}" text-anchor="middle">${year}</text>`;
    })
    .join("");

  el.innerHTML = `
    <svg viewBox="0 0 700 300" role="img" aria-label="Future emissions versus Paris path">
      <line x1="${box.x}" y1="${box.y + box.h}" x2="${box.x + box.w}" y2="${box.y + box.h}" stroke="rgba(255,255,255,0.08)"/>
      <path class="chart-area" d="${areaPath(trendPts, box.y + box.h)}" fill="#FDB768"/>
      <path class="chart-line" d="${linePath(trendPts)}" stroke="#FDB768" style="stroke-dasharray:1000;stroke-dashoffset:1000;animation:draw 1.2s ease forwards"/>
      <path class="chart-line" d="${linePath(parisPts)}" stroke="#AAE506" stroke-width="3" stroke-dasharray="8 7"/>
      ${labels}
    </svg>
  `;
}

function renderStacked(el, data) {
  const box = { x: 36, y: 16, w: 640, h: 200 };
  const totals = data.scope12.map((v, i) => v + data.scope3[i]);
  const max = Math.max(...totals) * 1.08;
  const barW = box.w / data.years.length - 18;
  const bars = data.years
    .map((year, i) => {
      const x = box.x + i * (box.w / data.years.length) + 8;
      const h3 = (data.scope3[i] / max) * box.h;
      const h12 = (data.scope12[i] / max) * box.h;
      const y3 = box.y + box.h - h3 - h12;
      const y12 = box.y + box.h - h12;
      return `
        <g>
          <rect x="${pad(x)}" y="${pad(y3)}" width="${pad(barW)}" height="${pad(h3)}" fill="#59A0E1" rx="4" opacity="0.9"/>
          <rect x="${pad(x)}" y="${pad(y12)}" width="${pad(barW)}" height="${pad(h12)}" fill="#FDB768" rx="4"/>
          <text class="axis-label" x="${pad(x + barW / 2)}" y="${box.y + box.h + 22}" text-anchor="middle">${year}</text>
        </g>
      `;
    })
    .join("");

  el.innerHTML = `
    <svg viewBox="0 0 700 250" role="img" aria-label="Company emissions by scope">
      <line x1="${box.x}" y1="${box.y + box.h}" x2="${box.x + box.w}" y2="${box.y + box.h}" stroke="rgba(255,255,255,0.08)"/>
      ${bars}
    </svg>
  `;
}

function renderPie(el, data) {
  const cx = 120;
  const cy = 110;
  const r = 88;
  let angle = -Math.PI / 2;
  const total = data.slices.reduce((s, x) => s + x.value, 0);
  const paths = data.slices
    .map((slice) => {
      const sweep = (slice.value / total) * Math.PI * 2;
      const x1 = cx + Math.cos(angle) * r;
      const y1 = cy + Math.sin(angle) * r;
      angle += sweep;
      const x2 = cx + Math.cos(angle) * r;
      const y2 = cy + Math.sin(angle) * r;
      const large = sweep > Math.PI ? 1 : 0;
      return `<path d="M ${cx} ${cy} L ${pad(x1)} ${pad(y1)} A ${r} ${r} 0 ${large} 1 ${pad(x2)} ${pad(y2)} Z" fill="${slice.color}"/>`;
    })
    .join("");

  el.innerHTML = `
    <svg viewBox="0 0 240 220" role="img" aria-label="Emission sources">
      ${paths}
      <circle cx="${cx}" cy="${cy}" r="48" fill="#121212"/>
    </svg>
  `;
}

const renderers = {
  area: renderArea,
  dual: renderDual,
  stacked: renderStacked,
  pie: renderPie,
};

function mountCharts(root) {
  root.querySelectorAll("[data-series]").forEach((el) => {
    const key = el.getAttribute("data-series");
    const data = SERIES[key];
    if (!data) return;
    renderers[data.type](el, data);
  });
}

function setEntity(entity) {
  const app = document.getElementById("app");
  const tpl = document.getElementById(`tpl-${entity}`);
  app.innerHTML = "";
  app.appendChild(tpl.content.cloneNode(true));
  mountCharts(app);
  document.querySelectorAll(".entity-tab").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.entity === entity);
  });
  history.replaceState(null, "", `#${entity}`);
}

document.querySelectorAll(".entity-tab").forEach((btn) => {
  btn.addEventListener("click", () => setEntity(btn.dataset.entity));
});

const style = document.createElement("style");
style.textContent = `@keyframes fadeIn { to { opacity: 1; } }`;
document.head.appendChild(style);

const initial = location.hash.replace("#", "") || "municipality";
setEntity(["municipality", "region", "company"].includes(initial) ? initial : "municipality");
