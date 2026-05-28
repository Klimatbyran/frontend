import type {
  AIGeneratable,
  CompanyDetails,
  CompanyWithIndustryGics,
  ReportingPeriod,
  ReportingPeriodFromList,
} from "@/types/company";
import type { RankedCompany } from "@/types/company";
import { yearFromIsoDate } from "@/utils/date";

export type IndustryPeerGroupKey =
  | { type: "industry"; code: string }
  | { type: "sector"; code: string };

export type IntensityTrendDirection =
  | "increasing"
  | "decreasing"
  | "stable"
  | "unknown";

export interface EmissionsIntensityPoint {
  year: number;
  intensity: number;
  emissions: number;
  turnover: number;
  currency: string;
  isAIGenerated: boolean;
}

export interface IntensityTrend {
  direction: IntensityTrendDirection;
  changePercent: number | null;
  latestYear: number;
  previousYear: number | null;
  latestIntensity: number;
  previousIntensity: number | null;
}

export interface LatestIntensityResult {
  intensity: number;
  year: number;
  emissions: number;
  turnover: number;
  currency: string;
}

export interface IntensityComparison {
  company: LatestIntensityResult;
  industryAverage: number | null;
  industryCompanyCount: number;
  allCompaniesAverage: number | null;
  allCompaniesCount: number;
}

const TURNOVER_MILLION = 1_000_000;
export const INTENSITY_TREND_STABLE_THRESHOLD_PERCENT = 5;

export function getPeerGroupKey(
  company: CompanyWithIndustryGics,
): IndustryPeerGroupKey | null {
  const gics = company.industry?.industryGics;
  if (!gics) {
    return null;
  }

  if (gics.industryCode) {
    return { type: "industry", code: gics.industryCode };
  }

  if (gics.sectorCode) {
    return { type: "sector", code: gics.sectorCode };
  }

  return null;
}

export function matchesPeerGroup(
  company: CompanyWithIndustryGics,
  peerGroupKey: IndustryPeerGroupKey,
): boolean {
  const gics = company.industry?.industryGics;
  if (!gics) {
    return false;
  }

  if (peerGroupKey.type === "industry") {
    return gics.industryCode === peerGroupKey.code;
  }

  return gics.sectorCode === peerGroupKey.code;
}

function buildIntensityPoint(
  period: ReportingPeriod | ReportingPeriodFromList,
  isEmissionsAIGenerated: (period: ReportingPeriod | ReportingPeriodFromList) => boolean,
  isAIGenerated: (data: AIGeneratable | undefined | null) => boolean,
): EmissionsIntensityPoint | null {
  const emissions = period.emissions?.calculatedTotalEmissions;
  const turnover = period.economy?.turnover?.value;
  const currency = period.economy?.turnover?.currency;

  if (emissions == null || turnover == null || turnover <= 0 || !currency) {
    return null;
  }

  return {
    year: Number(yearFromIsoDate(period.endDate)),
    intensity: emissions / (turnover / TURNOVER_MILLION),
    emissions,
    turnover,
    currency,
    isAIGenerated:
      isEmissionsAIGenerated(period) ||
      isAIGenerated(period.economy?.turnover),
  };
}

export function getEmissionsIntensityHistory(
  periods: ReportingPeriod[] | ReportingPeriodFromList[],
  isEmissionsAIGenerated: (period: ReportingPeriod | ReportingPeriodFromList) => boolean,
  isAIGenerated: (data: AIGeneratable | undefined | null) => boolean,
): EmissionsIntensityPoint[] {
  return periods
    .map((period) =>
      buildIntensityPoint(period, isEmissionsAIGenerated, isAIGenerated),
    )
    .filter((point): point is EmissionsIntensityPoint => point !== null)
    .sort((a, b) => a.year - b.year);
}

export function getIntensityTrend(
  history: EmissionsIntensityPoint[],
): IntensityTrend {
  if (history.length === 0) {
    return {
      direction: "unknown",
      changePercent: null,
      latestYear: 0,
      previousYear: null,
      latestIntensity: 0,
      previousIntensity: null,
    };
  }

  const sorted = [...history].sort((a, b) => b.year - a.year);
  const latest = sorted[0];

  if (sorted.length < 2) {
    return {
      direction: "unknown",
      changePercent: null,
      latestYear: latest.year,
      previousYear: null,
      latestIntensity: latest.intensity,
      previousIntensity: null,
    };
  }

  const previous = sorted[1];
  const changePercent =
    ((latest.intensity - previous.intensity) / previous.intensity) * 100;

  let direction: IntensityTrendDirection = "stable";
  if (Math.abs(changePercent) >= INTENSITY_TREND_STABLE_THRESHOLD_PERCENT) {
    direction = changePercent > 0 ? "increasing" : "decreasing";
  }

  return {
    direction,
    changePercent,
    latestYear: latest.year,
    previousYear: previous.year,
    latestIntensity: latest.intensity,
    previousIntensity: previous.intensity,
  };
}

export function getLatestReportedIntensity(
  periods: ReportingPeriod[] | ReportingPeriodFromList[],
): LatestIntensityResult | null {
  const sortedPeriods = [...periods].sort(
    (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
  );

  for (const period of sortedPeriods) {
    const point = buildIntensityPoint(
      period,
      () => false,
      () => false,
    );
    if (point) {
      const { intensity, year, emissions, turnover, currency } = point;
      return { intensity, year, emissions, turnover, currency };
    }
  }

  return null;
}

function averagePositiveValues(values: number[]): number | null {
  const positive = values.filter((value) => value > 0);
  if (positive.length === 0) {
    return null;
  }

  return positive.reduce((sum, value) => sum + value, 0) / positive.length;
}

export function getIntensityComparison(
  company: CompanyDetails,
  allCompanies: RankedCompany[],
): IntensityComparison | null {
  const companyLatest = getLatestReportedIntensity(company.reportingPeriods);
  if (!companyLatest) {
    return null;
  }

  const peerGroupKey = getPeerGroupKey(company);
  const industryCompanies = peerGroupKey
    ? allCompanies.filter((peer) => matchesPeerGroup(peer, peerGroupKey))
    : [];

  const industryIntensities = industryCompanies
    .map((peer) => getLatestReportedIntensity(peer.reportingPeriods))
    .filter(
      (result): result is LatestIntensityResult =>
        result != null && result.intensity > 0,
    )
    .map((result) => result.intensity);

  const allIntensities = allCompanies
    .map((peer) => getLatestReportedIntensity(peer.reportingPeriods))
    .filter(
      (result): result is LatestIntensityResult =>
        result != null && result.intensity > 0,
    )
    .map((result) => result.intensity);

  return {
    company: companyLatest,
    industryAverage: averagePositiveValues(industryIntensities),
    industryCompanyCount: industryIntensities.length,
    allCompaniesAverage: averagePositiveValues(allIntensities),
    allCompaniesCount: allIntensities.length,
  };
}

export function getIntensityUnitCurrency(
  currencies: string[],
): string | null {
  if (currencies.length === 0) {
    return null;
  }

  const unique = new Set(currencies);
  return unique.size === 1 ? currencies[0] : null;
}
