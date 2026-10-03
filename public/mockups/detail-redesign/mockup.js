const SERIES = {
  "muni-history": {
    type: "history",
    years: [2015, 2017, 2019, 2021, 2023],
    values: [290000, 268000, 245000, 228000, 210000],
  },
  "muni-future": {
    type: "future",
    years: [2023, 2025, 2030, 2035, 2040, 2045, 2050],
    trend: [210, 197, 168, 143, 122, 104, 88],
    paris: [210, 162, 85, 45, 24, 12, 7],
    markerYear: 2030,
  },
  "region-history": {
    type: "history",
    years: [1990, 2000, 2010, 2015, 2020, 2023],
    values: [18.2, 16.1, 14.0, 12.8, 11.4, 10.7],
  },
  "region-future": {
    type: "future",
    years: [2023, 2025, 2030, 2035, 2040, 2045, 2050],
    trend: [10.7, 9.4, 6.9, 5.1, 3.7, 2.7, 2.0],
    paris: [10.7, 8.3, 4.4, 2.3, 1.2, 0.65, 0.35],
    markerYear: 2030,
  },
  "company-past": {
    type: "stacked",
    years: [2019, 2020, 2021, 2022, 2023, 2024],
    scope12: [1.4, 1.2, 1.1, 1.15, 1.05, 1.0],
    scope3: [42, 36, 34, 37, 36.5, 37],
  },
  "company-future": {
    type: "future",
    years: [2024, 2025, 2030, 2035, 2040, 2045, 2050],
    trend: [38, 37.5, 36, 34.5, 33, 31.5, 30],
    paris: [38, 33.4, 17.6, 9.3, 4.9, 2.6, 1.4],
    markerYear: 2030,
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
  const last = points[points.length - 1];
  const first = points[0];
  return `${linePath(points)} L${pad(last.x)} ${pad(baselineY)} L${pad(first.x)} ${pad(baselineY)} Z`;
}

function bandPath(topPts, bottomPts) {
  const bottom = [...bottomPts].reverse();
  return `${linePath(topPts)} ${bottom.map((p) => `L${pad(p.x)} ${pad(p.y)}`).join(" ")} Z`;
}

function mapPts(values, years, box, max) {
  return values.map((v, i) => ({
    x: box.x + (i / Math.max(years.length - 1, 1)) * box.w,
    y: box.y + box.h - (v / max) * box.h,
    year: years[i],
    value: v,
  }));
}

function gridLines(box) {
  return [0.25, 0.5, 0.75, 1]
    .map((frac) => {
      const y = box.y + box.h - frac * box.h;
      return `<line x1="${box.x}" y1="${pad(y)}" x2="${box.x + box.w}" y2="${pad(y)}" stroke="rgba(255,255,255,0.05)"/>`;
    })
    .join("");
}

function renderHistory(el, data) {
  const box = { x: 28, y: 16, w: 650, h: 210 };
  const max = Math.max(...data.values) * 1.12;
  const pts = mapPts(data.values, data.years, box, max);
  const labels = data.years
    .map((year, i) => {
      const p = pts[i];
      return `<text class="axis-label" x="${pad(p.x)}" y="${box.y + box.h + 22}" text-anchor="middle">${year}</text>`;
    })
    .join("");

  el.innerHTML = `
    <svg viewBox="0 0 700 250" role="img" aria-label="Historical emissions">
      <defs>
        <linearGradient id="histFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FDB768" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#FDB768" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${gridLines(box)}
      <line x1="${box.x}" y1="${box.y + box.h}" x2="${box.x + box.w}" y2="${box.y + box.h}" stroke="rgba(255,255,255,0.12)"/>
      <path d="${areaPath(pts, box.y + box.h)}" fill="url(#histFill)"/>
      <path class="chart-line" d="${linePath(pts)}" stroke="#FDB768" stroke-width="3"/>
      ${pts.map((p) => `<circle cx="${pad(p.x)}" cy="${pad(p.y)}" r="3.6" fill="#FDB768"/>`).join("")}
      ${labels}
    </svg>
  `;
}

function renderFuture(el, data) {
  const box = { x: 28, y: 28, w: 650, h: 250 };
  const max = Math.max(...data.trend, ...data.paris) * 1.1;
  const trendPts = mapPts(data.trend, data.years, box, max);
  const parisPts = mapPts(data.paris, data.years, box, max);
  const markerIndex = data.years.indexOf(data.markerYear);
  const marker = markerIndex >= 0 ? trendPts[markerIndex] : null;
  const parisMarker = markerIndex >= 0 ? parisPts[markerIndex] : null;
  const ticks = data.years.filter(
    (year, i) => i === 0 || year === data.markerYear || year === 2040 || i === data.years.length - 1,
  );

  el.innerHTML = `
    <svg viewBox="0 0 700 310" role="img" aria-label="Trend versus Paris path">
      ${gridLines(box)}
      <line x1="${box.x}" y1="${box.y + box.h}" x2="${box.x + box.w}" y2="${box.y + box.h}" stroke="rgba(255,255,255,0.12)"/>
      <path d="${bandPath(trendPts, parisPts)}" fill="#F0759A" opacity="0.16"/>
      <path class="chart-line" d="${linePath(trendPts)}" stroke="#FDB768" stroke-width="2.8"/>
      <path class="chart-line" d="${linePath(parisPts)}" stroke="#AAE506" stroke-width="2.8" stroke-dasharray="8 7"/>
      ${
        marker
          ? `<line x1="${pad(marker.x)}" y1="${box.y}" x2="${pad(marker.x)}" y2="${box.y + box.h}" stroke="rgba(247,247,247,0.22)" stroke-dasharray="3 5"/>
             <text class="chart-note" x="${pad(marker.x + 6)}" y="${box.y + 12}">2030</text>
             <circle cx="${pad(marker.x)}" cy="${pad(marker.y)}" r="4" fill="#FDB768"/>
             <circle cx="${pad(parisMarker.x)}" cy="${pad(parisMarker.y)}" r="4" fill="#AAE506"/>`
          : ""
      }
      ${ticks
        .map((year) => {
          const i = data.years.indexOf(year);
          return `<text class="axis-label" x="${pad(trendPts[i].x)}" y="${box.y + box.h + 22}" text-anchor="middle">${year}</text>`;
        })
        .join("")}
      <text class="chart-note" x="${pad(trendPts.at(-1).x - 4)}" y="${pad(trendPts.at(-1).y - 10)}" text-anchor="end">Trend</text>
      <text class="chart-note" fill="#AAE506" x="${pad(parisPts.at(-1).x - 4)}" y="${pad(Math.max(parisPts.at(-1).y - 10, box.y + 14))}" text-anchor="end">Paris</text>
    </svg>
  `;
}

function renderStacked(el, data) {
  const box = { x: 28, y: 16, w: 650, h: 200 };
  const totals = data.scope12.map((v, i) => v + data.scope3[i]);
  const max = Math.max(...totals) * 1.08;
  const barW = box.w / data.years.length - 18;
  const bars = data.years
    .map((year, i) => {
      const x = box.x + i * (box.w / data.years.length) + 8;
      const h3 = (data.scope3[i] / max) * box.h;
      const h12 = (data.scope12[i] / max) * box.h;
      return `
        <g>
          <rect x="${pad(x)}" y="${pad(box.y + box.h - h3 - h12)}" width="${pad(barW)}" height="${pad(h3)}" fill="#59A0E1" rx="4"/>
          <rect x="${pad(x)}" y="${pad(box.y + box.h - h12)}" width="${pad(barW)}" height="${pad(Math.max(h12, 4))}" fill="#FDB768" rx="3"/>
          <text class="axis-label" x="${pad(x + barW / 2)}" y="${box.y + box.h + 22}" text-anchor="middle">${year}</text>
        </g>
      `;
    })
    .join("");

  el.innerHTML = `
    <svg viewBox="0 0 700 250" role="img" aria-label="Own operations versus value chain">
      <line x1="${box.x}" y1="${box.y + box.h}" x2="${box.x + box.w}" y2="${box.y + box.h}" stroke="rgba(255,255,255,0.08)"/>
      ${bars}
    </svg>
  `;
}

const renderers = {
  history: renderHistory,
  future: renderFuture,
  stacked: renderStacked,
};

function mountCharts(root) {
  root.querySelectorAll("[data-series]").forEach((el) => {
    const data = SERIES[el.getAttribute("data-series")];
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

const initial = location.hash.replace("#", "") || "municipality";
setEntity(
  ["municipality", "region", "company"].includes(initial) ? initial : "municipality",
);
