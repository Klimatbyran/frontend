const SERIES = {
  "muni-story": {
    type: "story",
    historyYears: [2015, 2017, 2019, 2021, 2023],
    history: [290, 268, 245, 228, 210],
    futureYears: [2023, 2025, 2030, 2035, 2040, 2045, 2050],
    trend: [210, 197, 168, 143, 122, 104, 88],
    paris: [210, 162, 85, 45, 24, 12, 7],
    unit: "thousand tonnes / year",
    todayLabel: "Today",
  },
  "region-story": {
    type: "story",
    historyYears: [1990, 2000, 2010, 2015, 2020, 2023],
    history: [18.2, 16.1, 14.0, 12.8, 11.4, 10.7],
    futureYears: [2023, 2025, 2030, 2035, 2040, 2045, 2050],
    trend: [10.7, 9.4, 6.9, 5.1, 3.7, 2.7, 2.0],
    paris: [10.7, 8.3, 4.4, 2.3, 1.2, 0.65, 0.35],
    unit: "million tonnes / year",
    todayLabel: "Today",
  },
  "company-story": {
    type: "story",
    historyYears: [2019, 2020, 2021, 2022, 2023, 2024],
    history: [43.4, 37.2, 35.1, 38.15, 37.55, 38],
    futureYears: [2024, 2025, 2030, 2035, 2040, 2045, 2050],
    trend: [38, 37.5, 36, 34.5, 33, 31.5, 30],
    paris: [38, 33.4, 17.6, 9.3, 4.9, 2.6, 1.4],
    unit: "million tonnes / year",
    todayLabel: "Today",
  },
  "company-past": {
    type: "stacked",
    years: [2019, 2020, 2021, 2022, 2023, 2024],
    scope12: [1.4, 1.2, 1.1, 1.15, 1.05, 1.0],
    scope3: [42, 36, 34, 37, 36.5, 37],
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
  if (!topPts.length) return "";
  const bottom = [...bottomPts].reverse();
  return `${linePath(topPts)} ${bottom
    .map((p) => `L${pad(p.x)} ${pad(p.y)}`)
    .join(" ")} Z`;
}

function yearToX(year, start, end, box) {
  return box.x + ((year - start) / (end - start)) * box.w;
}

function valueToY(value, max, box) {
  return box.y + box.h - (value / max) * box.h;
}

function renderStory(el, data) {
  const box = { x: 52, y: 28, w: 620, h: 250 };
  const start = data.historyYears[0];
  const end = data.futureYears[data.futureYears.length - 1];
  const today = data.historyYears[data.historyYears.length - 1];
  const max = Math.max(...data.history, ...data.trend, ...data.paris) * 1.12;
  const toPts = (years, values) =>
    years.map((year, i) => ({
      x: yearToX(year, start, end, box),
      y: valueToY(values[i], max, box),
      year,
      value: values[i],
    }));

  const histPts = toPts(data.historyYears, data.history);
  const trendPts = toPts(data.futureYears, data.trend);
  const parisPts = toPts(data.futureYears, data.paris);
  const todayX = yearToX(today, start, end, box);
  const ticks = [start, today, 2040, end].filter(
    (year, i, arr) => arr.indexOf(year) === i,
  );

  const grids = [0.25, 0.5, 0.75, 1]
    .map((frac) => {
      const y = box.y + box.h - frac * box.h;
      return `<line x1="${box.x}" y1="${pad(y)}" x2="${box.x + box.w}" y2="${pad(y)}" stroke="rgba(255,255,255,0.05)"/>`;
    })
    .join("");

  el.innerHTML = `
    <svg viewBox="0 0 720 330" role="img" aria-label="Emissions from the past through 2050, compared with the Paris path">
      <defs>
        <linearGradient id="histFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FDB768" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#FDB768" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${grids}
      <line x1="${box.x}" y1="${box.y + box.h}" x2="${box.x + box.w}" y2="${box.y + box.h}" stroke="rgba(255,255,255,0.12)"/>
      <path d="${areaPath(histPts, box.y + box.h)}" fill="url(#histFill)"/>
      <path d="${bandPath(trendPts, parisPts)}" fill="#F0759A" opacity="0.16"/>
      <path class="chart-line" d="${linePath(histPts)}" stroke="#FDB768" stroke-width="3"/>
      <path class="chart-line" d="${linePath(trendPts)}" stroke="#FDB768" stroke-width="2.4"/>
      <path class="chart-line" d="${linePath(parisPts)}" stroke="#AAE506" stroke-width="2.8" stroke-dasharray="8 7"/>
      <line x1="${pad(todayX)}" y1="${box.y}" x2="${pad(todayX)}" y2="${box.y + box.h}" stroke="rgba(247,247,247,0.28)" stroke-dasharray="3 5"/>
      <text class="chart-note" x="${pad(todayX + 8)}" y="${box.y + 14}">${data.todayLabel}</text>
      ${ticks
        .map((year) => {
          const x = yearToX(year, start, end, box);
          return `<text class="axis-label" x="${pad(x)}" y="${box.y + box.h + 22}" text-anchor="middle">${year}</text>`;
        })
        .join("")}
      <text class="chart-note" x="${pad(trendPts[trendPts.length - 1].x - 4)}" y="${pad(trendPts[trendPts.length - 1].y - 12)}" text-anchor="end">If we continue</text>
      <text class="chart-note" fill="#AAE506" x="${pad(parisPts[parisPts.length - 1].x - 4)}" y="${pad(Math.max(parisPts[parisPts.length - 1].y - 12, box.y + 16))}" text-anchor="end">Paris path</text>
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
          <rect x="${pad(x)}" y="${pad(y3)}" width="${pad(barW)}" height="${pad(h3)}" fill="#59A0E1" rx="4"/>
          <rect x="${pad(x)}" y="${pad(y12)}" width="${pad(barW)}" height="${pad(Math.max(h12, 4))}" fill="#FDB768" rx="3"/>
          <text class="axis-label" x="${pad(x + barW / 2)}" y="${box.y + box.h + 22}" text-anchor="middle">${year}</text>
        </g>
      `;
    })
    .join("");

  el.innerHTML = `
    <svg viewBox="0 0 700 250" role="img" aria-label="Company emissions from own operations versus the value chain">
      <line x1="${box.x}" y1="${box.y + box.h}" x2="${box.x + box.w}" y2="${box.y + box.h}" stroke="rgba(255,255,255,0.08)"/>
      ${bars}
    </svg>
  `;
}

const renderers = {
  story: renderStory,
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
