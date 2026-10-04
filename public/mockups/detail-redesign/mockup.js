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
    history: [3.1, 2.7, 2.35, 2.15, 1.92, 1.8],
    futureYears: [2023, 2025, 2030, 2035, 2040, 2045, 2050],
    trend: [1.8, 1.58, 1.16, 0.85, 0.63, 0.46, 0.34],
    paris: [1.8, 1.4, 0.74, 0.39, 0.2, 0.11, 0.06],
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

const PLACE_INFO = {
  municipalities: {
    Umeå: {
      change: -3.2,
      paris: false,
      go: "municipality",
      note: "Largest in the region. About 210,000 t a year.",
    },
    Skellefteå: {
      change: -4.8,
      paris: true,
      note: "Industry has fallen fast. A big part of the regional cut.",
    },
    Lycksele: { change: -2.0, paris: false },
    Dorotea: { change: 0.4, paris: false },
    Vännäs: { change: -2.8, paris: false },
    Nordmaling: { change: -3.5, paris: false },
    Vindeln: { change: -2.4, paris: false },
    Robertsfors: { change: -3.8, paris: false },
    Bjurholm: { change: -1.5, paris: false },
    Malå: { change: -5.1, paris: true },
    Norsjö: { change: -4.2, paris: true },
    Sorsele: { change: -1.1, paris: false },
    Storuman: { change: -2.2, paris: false },
    Vilhelmina: { change: -1.8, paris: false },
    Åsele: { change: -0.6, paris: false },
  },
  regions: {
    Västerbotten: {
      change: -4.1,
      paris: true,
      go: "region",
      note: "On track if the trend holds.",
    },
    Norrbotten: { change: -1.4, paris: false },
    Västernorrland: { change: -1.8, paris: false },
    Jämtland: { change: -4.6, paris: true },
    Gävleborg: { change: -2.1, paris: false },
    Dalarna: { change: -2.4, paris: false },
    Värmland: { change: -2.0, paris: false },
    Örebro: { change: -2.7, paris: false },
    Västmanland: { change: -2.3, paris: false },
    Uppsala: { change: -1.9, paris: false },
    Stockholm: { change: -1.6, paris: false },
    Södermanland: { change: -2.2, paris: false },
    Östergötland: { change: -2.8, paris: false },
    Jönköping: { change: -2.5, paris: false },
    Kronoberg: { change: -3.9, paris: true },
    Kalmar: { change: -2.0, paris: false },
    Gotland: { change: -5.0, paris: true },
    Blekinge: { change: -3.6, paris: true },
    Skåne: { change: -1.7, paris: false },
    Halland: { change: -4.4, paris: true },
    "Västra Götaland": { change: -3.8, paris: true },
  },
};

function formatChange(value) {
  if (value > 0) return `+${value.toFixed(1)}%`;
  if (value < 0) return `−${Math.abs(value).toFixed(1)}%`;
  return "0%";
}

function placeRecord(kind, id) {
  return PLACE_INFO[kind]?.[id] || { change: null, paris: false };
}

function fillReadout(el, kind, id) {
  if (!el || !id) return;
  const info = placeRecord(kind, id);
  const onTrack = info.paris;
  const statClass = onTrack ? "accent-green" : "accent-pink";
  const verdict = onTrack ? "On track for Paris" : "Not on track for Paris";
  const change =
    typeof info.change === "number" ? `${formatChange(info.change)} a year.` : "";
  const link = info.go
    ? `<p class="map-readout-link"><a class="place-link" href="#${info.go}" data-go="${info.go}">Open ${id}</a></p>`
    : "";
  const note = info.note ? `<p class="map-readout-note">${info.note}</p>` : "";
  el.innerHTML = `
    <p class="map-readout-name">${id}</p>
    <p class="map-readout-stat ${statClass}">${verdict} ${change}</p>
    ${note}
    ${link}
  `;
}

function renderMap(el) {
  const kind = el.dataset.map;
  const map = window.MOCKUP_MAPS?.[kind];
  if (!map) return;
  const focus = el.dataset.focus || "";
  const labels = (el.dataset.label || "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  const labelSet = new Set(labels);

  el.innerHTML = `
    <svg viewBox="${map.viewBox}" role="img" aria-label="${kind === "regions" ? "Swedish regions" : "Municipalities in Västerbotten"}">
      ${map.areas
        .map((area) => {
          const info = placeRecord(kind, area.id);
          const classes = [
            "map-area",
            info.paris ? "is-on" : "is-off",
            area.id === focus ? "is-focus" : "",
          ]
            .filter(Boolean)
            .join(" ");
          const go = info.go ? `data-go="${info.go}"` : "";
          return `<path class="${classes}" data-place="${area.id}" data-kind="${kind}" ${go} d="${area.d}"/>`;
        })
        .join("")}
      ${map.areas
        .filter((area) => labelSet.has(area.id))
        .map(
          (area) =>
            `<text class="map-label" x="${area.c[0]}" y="${area.c[1]}" text-anchor="middle">${area.id}</text>`,
        )
        .join("")}
    </svg>
  `;
}

function bindMapPanel(panel) {
  const readout = panel.querySelector(".map-readout");
  const defaultId = readout?.dataset.default;
  const defaultKind = readout?.dataset.kind || "municipalities";
  fillReadout(readout, defaultKind, defaultId);

  panel.addEventListener("pointerover", (event) => {
    const area = event.target.closest(".map-area");
    if (!area || !panel.contains(area)) return;
    panel.querySelectorAll(".map-area.is-hover").forEach((node) => {
      node.classList.remove("is-hover");
    });
    area.classList.add("is-hover");
    fillReadout(readout, area.dataset.kind, area.dataset.place);
  });

  panel.addEventListener("pointerleave", () => {
    panel.querySelectorAll(".map-area.is-hover").forEach((node) => {
      node.classList.remove("is-hover");
    });
    fillReadout(readout, defaultKind, defaultId);
  });
}

function mountMaps(root) {
  root.querySelectorAll("[data-map]").forEach(renderMap);
  root.querySelectorAll(".map-panel").forEach(bindMapPanel);
}

function setEntity(entity) {
  const app = document.getElementById("app");
  const tpl = document.getElementById(`tpl-${entity}`);
  app.innerHTML = "";
  app.appendChild(tpl.content.cloneNode(true));
  mountCharts(app);
  mountMaps(app);
  document.querySelectorAll(".entity-tab").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.entity === entity);
  });
  history.replaceState(null, "", `#${entity}`);
  window.scrollTo(0, 0);
}

document.querySelectorAll(".entity-tab").forEach((btn) => {
  btn.addEventListener("click", () => setEntity(btn.dataset.entity));
});

document.getElementById("app").addEventListener("click", (event) => {
  const go = event.target.closest("[data-go]");
  if (!go) return;
  event.preventDefault();
  setEntity(go.dataset.go);
});

const initial = location.hash.replace("#", "") || "municipality";
setEntity(
  ["municipality", "region", "company"].includes(initial) ? initial : "municipality",
);
