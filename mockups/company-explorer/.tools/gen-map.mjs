/**
 * Regenerates ../map-data.js from Natural Earth country outlines.
 *
 * Only needed if the map frame or country list changes — map-data.js is
 * committed, so the mockup itself has no dependencies. Requires world-atlas,
 * topojson-client and d3-geo, which are NOT project dependencies:
 *   npm i --no-save world-atlas topojson-client d3-geo
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import * as topojson from "topojson-client";
import { geoMercator, geoPath } from "d3-geo";

const require = createRequire(import.meta.url);
const atlasPath = require.resolve("world-atlas/countries-50m.json");
const topo = JSON.parse(readFileSync(atlasPath, "utf8"));
const geo = topojson.feature(topo, topo.objects.countries);

const byName = new Map(geo.features.map((f) => [f.properties.name, f]));

const DATA_COUNTRIES = ["Sweden", "Norway", "Finland", "Denmark", "Iceland"];
const CONTEXT = [
  "Greenland",
  "Faroe Is.",
  "Estonia",
  "Latvia",
  "Lithuania",
  "Russia",
  "Belarus",
  "Poland",
  "Germany",
  "Netherlands",
  "Belgium",
  "United Kingdom",
  "Ireland",
];

// One window covering all five countries including Iceland. Norway's Natural
// Earth geometry reaches up to Svalbard, so the SVG clips to this frame.
const BBOX = { lon: [-26.5, 34], lat: [52.5, 71.6] };
const MAIN_W = 660;

// A MultiPoint of the window corners: no polygon winding-order surprises,
// which d3-geo would otherwise read as "everything except this rectangle".
const bbox = {
  type: "Feature",
  geometry: {
    type: "MultiPoint",
    coordinates: [
      [BBOX.lon[0], BBOX.lat[0]],
      [BBOX.lon[1], BBOX.lat[0]],
      [BBOX.lon[1], BBOX.lat[1]],
      [BBOX.lon[0], BBOX.lat[1]],
    ],
  },
};

// Height follows from the window's own aspect ratio, so the frame has no
// letterboxed dead space on any side.
const probe = geoMercator().fitWidth(MAIN_W, bbox);
const pb = geoPath(probe).bounds(bbox);
const MAIN_H = Math.round(pb[1][1] - pb[0][1]);

const projection = geoMercator().fitExtent(
  [
    [0, 0],
    [MAIN_W, MAIN_H],
  ],
  bbox,
);
const path = geoPath(projection);

const LABEL_POINTS = {
  Sweden: [15.4, 62.0],
  Norway: [9.2, 61.0],
  Finland: [26.2, 63.4],
  Denmark: [9.4, 56.1],
  Iceland: [-18.6, 64.9],
};

const out = { main: { width: MAIN_W, height: MAIN_H, data: {}, context: {} } };

for (const name of DATA_COUNTRIES) {
  out.main.data[name] = {
    d: path(byName.get(name)),
    label: projection(LABEL_POINTS[name]).map((n) => Math.round(n * 10) / 10),
  };
}
for (const name of CONTEXT) {
  const f = byName.get(name);
  if (!f) {
    console.warn("context country not found:", name);
    continue;
  }
  const d = path(f);
  if (d) out.main.context[name] = { d };
}

writeFileSync(
  new URL("./nordic-paths.json", import.meta.url),
  JSON.stringify(out, null, 2),
);

console.log(`frame ${MAIN_W} x ${MAIN_H} (aspect ${(MAIN_W / MAIN_H).toFixed(2)})`);
console.log(
  "labels:",
  JSON.stringify(
    Object.fromEntries(Object.entries(out.main.data).map(([k, v]) => [k, v.label])),
  ),
);
console.log("context:", Object.keys(out.main.context).join(", "));
