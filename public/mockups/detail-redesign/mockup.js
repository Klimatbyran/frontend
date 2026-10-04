const SERIES = {
  "muni-combined": {
    type: "combined",
    historyYears: [2015, 2017, 2019, 2021, 2023],
    history: [290, 268, 245, 228, 210],
    futureYears: [2023, 2025, 2030, 2035, 2040, 2045, 2050],
    trend: [210, 197, 168, 143, 122, 104, 88],
    paris: [210, 162, 85, 45, 24, 12, 7],
  },
  "region-combined": {
    type: "combined",
    historyYears: [1990, 2000, 2010, 2015, 2020, 2023],
    history: [18.2, 16.1, 14.0, 12.8, 11.4, 10.7],
    futureYears: [2023, 2025, 2030, 2035, 2040, 2045, 2050],
    trend: [10.7, 9.4, 6.9, 5.1, 3.7, 2.7, 2.0],
    paris: [10.7, 8.3, 4.4, 2.3, 1.2, 0.65, 0.35],
  },
  "company-combined": {
    type: "combined",
    historyYears: [2019, 2020, 2021, 2022, 2023, 2024],
    history: [43.4, 37.2, 35.1, 38.2, 37.6, 38],
    futureYears: [2024, 2025, 2030, 2035, 2040, 2045, 2050],
    trend: [38, 37.5, 36, 34.5, 33, 31.5, 30],
    paris: [38, 33.4, 17.6, 9.3, 4.9, 2.6, 1.4],
  },
  "company-past": {
    type: "stacked",
    years: [2019, 2020, 2021, 2022, 2023, 2024],
    scope12: [1.4, 1.2, 1.1, 1.15, 1.05, 1.0],
    scope3: [42, 36, 34, 37, 36.5, 37],
  },
};

const BOX = { x: 4, y: 32, w: 992, h: 348 };
const VIEW = "0 0 1000 410";

function pad(n) {
  return Number(n.toFixed(2));
}

function linePath(points) {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${pad(p.x)} ${pad(p.y)}`)
    .join(" ");
}

function areaPath(points, baselineY) {
  const last = points[points.length - 1];
  const first = points[0];
  return `${linePath(points)} L${pad(last.x)} ${pad(baselineY)} L${pad(first.x)} ${pad(baselineY)} Z`;
}

function bandPath(topPts, bottomPts) {
  const bottom = [...bottomPts].reverse();
  return `${linePath(topPts)} ${bottom.map((p) => `L${pad(p.x)} ${pad(p.y)}`).join(" ")} Z`;
}

function yearToX(year, start, end, box) {
  return box.x + ((year - start) / (end - start)) * box.w;
}

function valueToY(value, max, box) {
  return box.y + box.h - (value / max) * box.h;
}

function toPts(years, values, start, end, max, box) {
  return years.map((year, i) => ({
    x: yearToX(year, start, end, box),
    y: valueToY(values[i], max, box),
    year,
    value: values[i],
  }));
}

function gridLines(box) {
  return [0.25, 0.5, 0.75, 1]
    .map((frac) => {
      const y = box.y + box.h - frac * box.h;
      return `<line x1="${box.x}" y1="${pad(y)}" x2="${box.x + box.w}" y2="${pad(y)}" stroke="rgba(255,255,255,0.06)"/>`;
    })
    .join("");
}

function renderCombined(el, data, id) {
  const box = BOX;
  const start = data.historyYears[0];
  const end = data.futureYears[data.futureYears.length - 1];
  const today = data.historyYears[data.historyYears.length - 1];
  const max = Math.max(...data.history, ...data.trend, ...data.paris) * 1.08;
  const histPts = toPts(data.historyYears, data.history, start, end, max, box);
  const trendPts = toPts(data.futureYears, data.trend, start, end, max, box);
  const parisPts = toPts(data.futureYears, data.paris, start, end, max, box);
  const todayX = yearToX(today, start, end, box);
  const ticks = [start, today, 2030, 2040, end].filter(
    (year, i, arr) => arr.indexOf(year) === i && year >= start && year <= end,
  );

  el.innerHTML = `
    <svg viewBox="${VIEW}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Historical emissions, then the trend versus the Paris path">
      <defs>
        <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FDB768" stop-opacity="0.38"/>
          <stop offset="100%" stop-color="#FDB768" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${gridLines(box)}
      <line x1="${box.x}" y1="${box.y + box.h}" x2="${box.x + box.w}" y2="${box.y + box.h}" stroke="rgba(255,255,255,0.14)"/>
      <rect x="${box.x}" y="${box.y}" width="${pad(todayX - box.x)}" height="${box.h}" fill="rgba(255,255,255,0.03)"/>
      <path d="${areaPath(histPts, box.y + box.h)}" fill="url(#${id})"/>
      <path d="${bandPath(trendPts, parisPts)}" fill="#F0759A" opacity="0.18"/>
      <path class="chart-line" d="${linePath(histPts)}" stroke="#FDB768" stroke-width="2.8"/>
      <path class="chart-line" d="${linePath(trendPts)}" stroke="#FDB768" stroke-width="2.4"/>
      <path class="chart-line" d="${linePath(parisPts)}" stroke="#AAE506" stroke-width="2.6" stroke-dasharray="7 6"/>
      <line x1="${pad(todayX)}" y1="${box.y}" x2="${pad(todayX)}" y2="${box.y + box.h}" stroke="rgba(247,247,247,0.45)"/>
      <text class="chart-note" x="${pad(todayX - 10)}" y="${box.y - 10}" text-anchor="end">So far</text>
      <text class="chart-note" x="${pad(todayX + 10)}" y="${box.y - 10}">From now</text>
      <text class="axis-label" x="${pad(todayX)}" y="${box.y + 14}" text-anchor="middle">Now</text>
      ${histPts.map((p) => `<circle cx="${pad(p.x)}" cy="${pad(p.y)}" r="3.2" fill="#FDB768"/>`).join("")}
      ${ticks
        .map((year) => {
          const x = yearToX(year, start, end, box);
          const anchor = year === start ? "start" : year === end ? "end" : "middle";
          const label = year === today ? "Now" : String(year);
          if (year === today) {
            return `<text class="axis-label" x="${pad(x)}" y="${box.y + box.h + 20}" text-anchor="middle">${today}</text>`;
          }
          return `<text class="axis-label" x="${pad(x)}" y="${box.y + box.h + 20}" text-anchor="${anchor}">${label}</text>`;
        })
        .join("")}
    </svg>
  `;
}

function renderStacked(el, data) {
  const box = { x: 4, y: 8, w: 992, h: 348 };
  const totals = data.scope12.map((v, i) => v + data.scope3[i]);
  const max = Math.max(...totals) * 1.05;
  const gap = 18;
  const barW = box.w / data.years.length - gap;
  const bars = data.years
    .map((year, i) => {
      const x = box.x + i * (box.w / data.years.length) + gap / 2;
      const h3 = (data.scope3[i] / max) * box.h;
      const h12 = (data.scope12[i] / max) * box.h;
      const anchor = i === 0 ? "start" : i === data.years.length - 1 ? "end" : "middle";
      const labelX = i === 0 ? x : i === data.years.length - 1 ? x + barW : x + barW / 2;
      return `
        <g>
          <rect x="${pad(x)}" y="${pad(box.y + box.h - h3 - h12)}" width="${pad(barW)}" height="${pad(h3)}" fill="#59A0E1"/>
          <rect x="${pad(x)}" y="${pad(box.y + box.h - h12)}" width="${pad(barW)}" height="${pad(Math.max(h12, 5))}" fill="#FDB768"/>
          <text class="axis-label" x="${pad(labelX)}" y="${box.y + box.h + 20}" text-anchor="${anchor}">${year}</text>
        </g>
      `;
    })
    .join("");

  el.innerHTML = `
    <svg viewBox="${VIEW}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Own operations versus value chain">
      <line x1="${box.x}" y1="${box.y + box.h}" x2="${box.x + box.w}" y2="${box.y + box.h}" stroke="rgba(255,255,255,0.14)"/>
      ${bars}
    </svg>
  `;
}

const renderers = {
  combined: renderCombined,
  stacked: renderStacked,
};

function mountCharts(root) {
  root.querySelectorAll("[data-series]").forEach((el) => {
    const key = el.getAttribute("data-series");
    const data = SERIES[key];
    if (!data) return;
    renderers[data.type](el, data, `fill-${key}`);
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
