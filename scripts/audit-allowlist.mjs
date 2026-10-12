#!/usr/bin/env node

import { execFileSync } from "node:child_process";

/**
 * Advisories with no published fix. Both are build-time only:
 *
 * - braces: 3.0.3 is the latest release, and GHSA-vfj7-8cjw-p6xm covers
 *   every published version. Tailwind 3 pulls it in through chokidar and
 *   micromatch. The proposed 3.0.4 fix was withdrawn.
 * - sprintf-js: 1.1.3 is the latest release, and GHSA-hp3w-g68c-fv3c covers
 *   every published version. vite-plugin-markdown pulls it in through
 *   front-matter and js-yaml 3.
 *
 * Anything moderate or higher outside this set still fails the audit.
 */
const ALLOWED = new Set(["GHSA-vfj7-8cjw-p6xm", "GHSA-hp3w-g68c-fv3c"]);

function ghsaIds(via) {
  const ids = [];
  for (const item of via ?? []) {
    if (item && typeof item === "object" && typeof item.url === "string") {
      const match = item.url.match(/GHSA-[0-9a-z-]+/i);
      if (match) ids.push(match[0]);
    }
  }
  return ids;
}

function isAllowed(name, vulns, stack = new Set()) {
  if (stack.has(name)) return false;
  const info = vulns[name];
  if (!info) return false;

  const ids = ghsaIds(info.via);
  const dependencies = (info.via ?? []).filter(
    (item) => typeof item === "string",
  );

  if (ids.some((id) => !ALLOWED.has(id))) return false;

  stack.add(name);
  const dependenciesAllowed = dependencies.every((dependency) =>
    isAllowed(dependency, vulns, stack),
  );
  stack.delete(name);

  if (!dependenciesAllowed) return false;
  return ids.length > 0 || dependencies.length > 0;
}

let raw = "";
try {
  raw = execFileSync("npm", ["audit", "--json"], { encoding: "utf8" });
} catch (error) {
  raw = error.stdout?.toString() ?? "";
  if (!raw) {
    console.error(error.stderr?.toString() || error.message);
    process.exit(1);
  }
}

const report = JSON.parse(raw);
const vulns = report.vulnerabilities ?? {};
const blocked = [];

for (const [name, info] of Object.entries(vulns)) {
  if (info.severity === "low" || info.severity === "info") continue;
  if (!isAllowed(name, vulns)) {
    blocked.push(`${name} (${info.severity})`);
  }
}

if (blocked.length > 0) {
  console.error(
    "npm audit found vulnerabilities outside the known unfixed set:",
  );
  for (const line of blocked) console.error(`- ${line}`);
  process.exit(1);
}

console.log(
  `npm audit: only known unfixed advisories remain (${[...ALLOWED].join(", ")})`,
);
