import type { SupportedLanguage } from "@/lib/languageDetection";

export type StoryLens = "paris" | "pace";

export type TerritoryStoryRow = {
  name: string;
  meetsParis: boolean | null;
  historicalEmissionChangePercent: number | null;
};

export type MunicipalityStoryRow = TerritoryStoryRow & {
  climatePlan: boolean;
};

export type ParisSummary = {
  total: number;
  onTrack: number;
  offTrack: number;
  unknown: number;
  onTrackPercent: number;
};

export type PaceSummary = {
  total: number;
  falling: number;
  rising: number;
  flat: number;
  /** Yearly change for the municipality or region in the middle, already in percent. */
  median: number | null;
};

export type TerritoryExtremes = {
  leading: TerritoryStoryRow[];
  trailing: TerritoryStoryRow[];
};

export type PlanContrast = {
  total: number;
  withPlan: number;
  withoutPlan: number;
  onTrackWithPlan: number;
  onTrackWithoutPlan: number;
  withPlanPercent: number;
  /** Share of the with-plan group that is on track, 0–100. */
  onTrackShareWithPlan: number | null;
  /** Share of the without-plan group that is on track, 0–100. */
  onTrackShareWithoutPlan: number | null;
};

const EXTREME_COUNT = 5;

export function sharePercent(part: number, total: number): number {
  if (total <= 0 || part <= 0) return 0;
  return Math.round((part / total) * 100);
}

export function formatAnnualChange(
  value: number,
  language: SupportedLanguage,
): string {
  const locale = language === "en" ? "en-GB" : "sv-SE";
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  }).format(value / 100);
}

export function summariseParis(rows: TerritoryStoryRow[]): ParisSummary {
  const total = rows.length;
  const onTrack = rows.filter((row) => row.meetsParis === true).length;
  const unknown = rows.filter((row) => row.meetsParis == null).length;

  return {
    total,
    onTrack,
    offTrack: total - onTrack - unknown,
    unknown,
    onTrackPercent: sharePercent(onTrack, total),
  };
}

function numericRows(rows: TerritoryStoryRow[]): TerritoryStoryRow[] {
  return rows.filter(
    (row) => typeof row.historicalEmissionChangePercent === "number",
  );
}

export function medianChange(rows: TerritoryStoryRow[]): number | null {
  const values = numericRows(rows)
    .map((row) => row.historicalEmissionChangePercent as number)
    .sort((a, b) => a - b);

  if (values.length === 0) return null;

  const mid = Math.floor(values.length / 2);
  if (values.length % 2 === 0) {
    return (values[mid - 1] + values[mid]) / 2;
  }
  return values[mid];
}

export function summarisePace(rows: TerritoryStoryRow[]): PaceSummary {
  const numeric = numericRows(rows);
  let falling = 0;
  let rising = 0;
  let flat = 0;

  for (const row of numeric) {
    const change = row.historicalEmissionChangePercent as number;
    if (change < 0) falling += 1;
    else if (change > 0) rising += 1;
    else flat += 1;
  }

  return {
    total: rows.length,
    falling,
    rising,
    flat,
    median: medianChange(rows),
  };
}

function byChangeAscending(a: TerritoryStoryRow, b: TerritoryStoryRow): number {
  const delta =
    (a.historicalEmissionChangePercent ?? 0) -
    (b.historicalEmissionChangePercent ?? 0);
  if (delta !== 0) return delta;
  return a.name.localeCompare(b.name, "sv");
}

function bestCuts(
  rows: TerritoryStoryRow[],
  limit: number,
): TerritoryStoryRow[] {
  return [...rows].sort(byChangeAscending).slice(0, limit);
}

function worstCuts(
  rows: TerritoryStoryRow[],
  limit: number,
): TerritoryStoryRow[] {
  return [...rows].sort((a, b) => byChangeAscending(b, a)).slice(0, limit);
}

/**
 * Paris lens: the lists illustrate the two map colours.
 * Pace lens: the lists are the two ends of the change itself, without
 * repeating a place when the set is smaller than two full lists.
 */
export function summariseExtremes(
  rows: TerritoryStoryRow[],
  lens: StoryLens,
  limit = EXTREME_COUNT,
): TerritoryExtremes {
  const numeric = numericRows(rows);

  if (lens === "paris") {
    return {
      leading: bestCuts(
        numeric.filter((row) => row.meetsParis === true),
        limit,
      ),
      trailing: worstCuts(
        numeric.filter((row) => row.meetsParis === false),
        limit,
      ),
    };
  }

  const leading = bestCuts(numeric, limit);
  const leadingNames = new Set(leading.map((row) => row.name));

  return {
    leading,
    trailing: worstCuts(
      numeric.filter((row) => !leadingNames.has(row.name)),
      limit,
    ),
  };
}

export function summarisePlans(rows: MunicipalityStoryRow[]): PlanContrast {
  const total = rows.length;
  const withPlanRows = rows.filter((row) => row.climatePlan);
  const withoutPlanRows = rows.filter((row) => !row.climatePlan);
  const onTrackWithPlan = withPlanRows.filter(
    (row) => row.meetsParis === true,
  ).length;
  const onTrackWithoutPlan = withoutPlanRows.filter(
    (row) => row.meetsParis === true,
  ).length;

  return {
    total,
    withPlan: withPlanRows.length,
    withoutPlan: withoutPlanRows.length,
    onTrackWithPlan,
    onTrackWithoutPlan,
    withPlanPercent: sharePercent(withPlanRows.length, total),
    onTrackShareWithPlan:
      withPlanRows.length === 0
        ? null
        : sharePercent(onTrackWithPlan, withPlanRows.length),
    onTrackShareWithoutPlan:
      withoutPlanRows.length === 0
        ? null
        : sharePercent(onTrackWithoutPlan, withoutPlanRows.length),
  };
}

/** Legacy `?kpi=` links from the previous overview still open the matching lens. */
export function lensFromSearch(search: string): StoryLens {
  const params = new URLSearchParams(search);
  if (params.get("lens") === "pace") return "pace";
  if (params.get("kpi") === "historicalEmissionChangePercent") return "pace";
  return "paris";
}
