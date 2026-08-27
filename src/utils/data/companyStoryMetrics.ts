import type { RankedCompany } from "@/types/company";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { calculateMeetsParis } from "@/lib/calculations/trends/meetsParis";
import { toMton } from "@/utils/data/nationStoryMetrics";

/** Carbon Law pace used by Klimatkollen's meetsParis assessment. */
export const PARIS_ANNUAL_REDUCTION_PERCENT = 11.72;

/** One assessed company – a dot in the story's swarm. */
export type CompanyStoryDot = {
  id: string;
  name: string;
  /** Latest reported total emissions (all scopes), tonnes CO₂e */
  emissionsTonnes: number;
  /** Keeps the Carbon Law pace (Klimatkollen's meetsParis assessment) */
  aligned: boolean;
};

export type SectorRaceLane = {
  sectorCode: string;
  companyCount: number;
  alignedCount: number;
  /** Share of the sector's companies keeping the Paris pace, 0–100 */
  alignedShare: number;
  totalMton: number;
};

export type ParisPacePoint = {
  year: number;
  /** Emissions remaining relative to the start year, 0–100 */
  remainingPercent: number;
};

export type CompanyStoryMetrics = {
  /** Companies that could be assessed against the Paris pace */
  companyCount: number;
  /** Latest reported emissions across assessed companies, Mton CO₂e */
  totalMton: number;
  alignedCount: number;
  notAlignedCount: number;
  /** Share of assessed companies keeping the pace, 0–100 */
  alignedCompanyShare: number;
  alignedEmissionsMton: number;
  /** Share of total emissions from companies keeping the pace, 0–100 */
  alignedEmissionsShare: number;
  /** Carbon Law descent 2025–2050, for the pace chart */
  paceCurve: ParisPacePoint[];
  /** Emissions remaining by a given year on the Carbon Law path, 0–100 */
  paceRemainingAt: (year: number) => number;
  /** Years for emissions to halve at the Carbon Law pace */
  halvingYears: number;
  /** Sorted largest emissions first – the swarm's center outwards */
  dots: CompanyStoryDot[];
  /** Sectors sorted by aligned share, best first */
  sectorLanes: SectorRaceLane[];
};

const PACE_START_YEAR = 2025;
const PACE_END_YEAR = 2050;

function latestReportedEmissions(company: RankedCompany): number {
  let best: { endDate: string; tonnes: number } | null = null;
  for (const period of company.reportingPeriods) {
    const tonnes = period.emissions?.calculatedTotalEmissions ?? 0;
    if (tonnes <= 0) continue;
    if (!best || period.endDate > best.endDate) {
      best = { endDate: period.endDate, tonnes };
    }
  }
  return best?.tonnes ?? 0;
}

function buildPaceCurve(): ParisPacePoint[] {
  const keepFactor = 1 - PARIS_ANNUAL_REDUCTION_PERCENT / 100;
  const points: ParisPacePoint[] = [];
  for (let year = PACE_START_YEAR; year <= PACE_END_YEAR; year++) {
    points.push({
      year,
      remainingPercent: 100 * keepFactor ** (year - PACE_START_YEAR),
    });
  }
  return points;
}

export function computeCompanyStoryMetrics(
  companies: RankedCompany[],
): CompanyStoryMetrics {
  const dots: CompanyStoryDot[] = [];
  const sectorAccumulator = new Map<
    string,
    { companyCount: number; alignedCount: number; tonnes: number }
  >();

  companies.forEach((company) => {
    const emissionsTonnes = latestReportedEmissions(company);
    if (emissionsTonnes <= 0) return;

    const trend = calculateTrendline(company);
    if (!trend) return;
    const aligned = calculateMeetsParis(company, trend);

    dots.push({
      id: company.wikidataId,
      name: company.name,
      emissionsTonnes,
      aligned,
    });

    const sectorCode = company.industry?.industryGics?.sectorCode;
    if (sectorCode) {
      const entry = sectorAccumulator.get(sectorCode) ?? {
        companyCount: 0,
        alignedCount: 0,
        tonnes: 0,
      };
      entry.companyCount += 1;
      if (aligned) entry.alignedCount += 1;
      entry.tonnes += emissionsTonnes;
      sectorAccumulator.set(sectorCode, entry);
    }
  });

  dots.sort((a, b) => b.emissionsTonnes - a.emissionsTonnes);

  const totalTonnes = dots.reduce((sum, dot) => sum + dot.emissionsTonnes, 0);
  const alignedDots = dots.filter((dot) => dot.aligned);
  const alignedTonnes = alignedDots.reduce(
    (sum, dot) => sum + dot.emissionsTonnes,
    0,
  );

  const sectorLanes: SectorRaceLane[] = [...sectorAccumulator.entries()]
    .map(([sectorCode, entry]) => ({
      sectorCode,
      companyCount: entry.companyCount,
      alignedCount: entry.alignedCount,
      alignedShare:
        entry.companyCount > 0
          ? (entry.alignedCount / entry.companyCount) * 100
          : 0,
      totalMton: toMton(entry.tonnes),
    }))
    // Tiny sectors make percentages jumpy and the race unfair to read.
    .filter((lane) => lane.companyCount >= 3)
    .sort(
      (a, b) => b.alignedShare - a.alignedShare || b.totalMton - a.totalMton,
    );

  const keepFactor = 1 - PARIS_ANNUAL_REDUCTION_PERCENT / 100;

  return {
    companyCount: dots.length,
    totalMton: toMton(totalTonnes),
    alignedCount: alignedDots.length,
    notAlignedCount: dots.length - alignedDots.length,
    alignedCompanyShare:
      dots.length > 0 ? (alignedDots.length / dots.length) * 100 : 0,
    alignedEmissionsMton: toMton(alignedTonnes),
    alignedEmissionsShare:
      totalTonnes > 0 ? (alignedTonnes / totalTonnes) * 100 : 0,
    paceCurve: buildPaceCurve(),
    paceRemainingAt: (year: number) =>
      100 * keepFactor ** Math.max(0, year - PACE_START_YEAR),
    halvingYears: Math.log(0.5) / Math.log(keepFactor),
    dots,
    sectorLanes,
  };
}
