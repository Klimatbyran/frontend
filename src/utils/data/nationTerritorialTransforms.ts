import type { EmissionDataPoint } from "@/types/municipality";
import {
  calculateCarbonLawCumulativeEmissions,
  calculateCumulativeEmissions,
} from "@/lib/calculations/trends/meetsParis";

const CUTOFF_YEAR = 2015;
const END_YEAR = 2050;
const LAST_YEAR_WITH_SMHI_DATA = 2024;

type YearRecord = Record<number, number>;

export type NationEmissionBreakdown = {
  territorialFossil: YearRecord;
  biogenic: YearRecord;
  consumptionAbroad: YearRecord;
  exportOfOilProducts: YearRecord;
  eCommerce: YearRecord;
};

export type NationDerivedMetrics = {
  emissions: (EmissionDataPoint | null)[];
  approximatedHistoricalEmission: (EmissionDataPoint | null)[];
  trend: (EmissionDataPoint | null)[];
  meetsParis: boolean;
  historicalEmissionChangePercent: number;
};

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function fitLADRegression(points: { year: number; value: number }[]): {
  slope: number;
  shift: number;
} {
  if (points.length < 2) {
    return { slope: 0, shift: points[0]?.value ?? 0 };
  }

  const lastYear = points[points.length - 1].year;
  const lastValue = points[points.length - 1].value;
  const centered = points.map((p) => ({
    x: p.year - lastYear,
    y: p.value,
  }));

  const slopeCandidates = new Set<number>([0]);
  for (let i = 0; i < centered.length; i++) {
    for (let j = i + 1; j < centered.length; j++) {
      const dx = centered[j].x - centered[i].x;
      if (dx !== 0) {
        slopeCandidates.add((centered[j].y - centered[i].y) / dx);
      }
    }
  }

  let bestSlope = 0;
  let bestError = Number.POSITIVE_INFINITY;

  for (const slope of slopeCandidates) {
    const residuals = centered.map((p) => p.y - slope * p.x);
    const intercept = median(residuals);
    const error = centered.reduce(
      (sum, p) => sum + Math.abs(p.y - (intercept + slope * p.x)),
      0,
    );

    if (error < bestError) {
      bestError = error;
      bestSlope = slope;
    }
  }

  // Anchor the trend line at the last observed data point so the projected
  // series is continuous with the historical emissions series. `shift` is the
  // value at the last data year (x = 0 in centered coordinates).
  const shift = lastValue;

  return { slope: bestSlope, shift };
}

function predictWithLAD(
  slope: number,
  shift: number,
  lastYear: number,
  year: number,
): number {
  return slope * (year - lastYear) + shift;
}

function recordToSortedPoints(record: YearRecord): EmissionDataPoint[] {
  return Object.entries(record)
    .map(([year, value]) => ({ year: Number(year), value }))
    .filter((point) => !Number.isNaN(point.year))
    .sort((a, b) => a.year - b.year);
}

function toEmissionArray(
  valuesByYear: Map<number, number>,
): (EmissionDataPoint | null)[] {
  return [...valuesByYear.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, value]) => ({ year, value }));
}

function calculateHistoricalEmissionChangePercent(record: YearRecord): number {
  const startValue = record[CUTOFF_YEAR];
  const endValue = record[LAST_YEAR_WITH_SMHI_DATA];

  if (startValue == null || endValue == null || startValue === 0) {
    return 0;
  }

  const yearSpan = LAST_YEAR_WITH_SMHI_DATA - CUTOFF_YEAR;
  const cagrFraction = (endValue / startValue) ** (1 / yearSpan) - 1;
  return cagrFraction * 100;
}

function calculateMeetsParis(
  slope: number,
  emissionsAtCurrentYear: number,
  currentYear: number,
): boolean {
  if (emissionsAtCurrentYear <= 0) {
    return true;
  }

  const totalTrend = calculateCumulativeEmissions(
    emissionsAtCurrentYear,
    slope,
    currentYear,
    END_YEAR,
  );

  const totalCarbonLaw = calculateCarbonLawCumulativeEmissions(
    emissionsAtCurrentYear,
    currentYear,
    END_YEAR,
  );

  return totalTrend <= totalCarbonLaw;
}

export function computeNationDerivedMetrics(
  territorialFossil: YearRecord,
  currentYear: number = new Date().getFullYear(),
): NationDerivedMetrics {
  const historicalPoints = recordToSortedPoints(territorialFossil).filter(
    (point) => point.year >= CUTOFF_YEAR,
  );

  const emissions = recordToSortedPoints(territorialFossil).map((point) => ({
    year: point.year,
    value: point.value,
  }));

  if (historicalPoints.length === 0) {
    return {
      emissions,
      approximatedHistoricalEmission: [],
      trend: [],
      meetsParis: false,
      historicalEmissionChangePercent: 0,
    };
  }

  const lastDataYear = historicalPoints[historicalPoints.length - 1].year;
  const { slope, shift } = fitLADRegression(historicalPoints);

  const approximatedByYear = new Map<number, number>();
  for (let year = lastDataYear; year <= currentYear; year++) {
    approximatedByYear.set(
      year,
      Math.max(0, predictWithLAD(slope, shift, lastDataYear, year)),
    );
  }

  const trendByYear = new Map<number, number>();
  for (let year = currentYear; year <= END_YEAR; year++) {
    trendByYear.set(
      year,
      Math.max(0, predictWithLAD(slope, shift, lastDataYear, year)),
    );
  }

  const emissionsAtCurrentYear =
    approximatedByYear.get(currentYear) ??
    territorialFossil[currentYear] ??
    predictWithLAD(slope, shift, lastDataYear, currentYear);

  return {
    emissions,
    approximatedHistoricalEmission: toEmissionArray(approximatedByYear),
    trend: toEmissionArray(trendByYear),
    meetsParis: calculateMeetsParis(slope, emissionsAtCurrentYear, currentYear),
    historicalEmissionChangePercent:
      calculateHistoricalEmissionChangePercent(territorialFossil),
  };
}

export function extractYearRecord(
  emissions:
    | ({ year: string | number; value: number } | null)[]
    | Record<string, number>
    | undefined,
): YearRecord {
  const record: YearRecord = {};

  if (!emissions) return record;

  if (Array.isArray(emissions)) {
    emissions.forEach((point) => {
      if (!point) return;
      const year = Number(point.year);
      if (!Number.isNaN(year)) {
        record[year] = point.value;
      }
    });
    return record;
  }

  Object.entries(emissions).forEach(([year, value]) => {
    const parsedYear = Number(year);
    if (!Number.isNaN(parsedYear) && typeof value === "number") {
      record[parsedYear] = value;
    }
  });

  return record;
}
