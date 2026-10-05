import type { RankedCompany } from "@/types/company";
import { calculateEmissionsChange } from "@/utils/calculations/emissionsCalculations";
import { yearFromIsoDate } from "@/utils/date";
import {
  BENCHMARK_VISUAL,
  buildBooleanBenchmark,
  buildNumericBenchmark,
  type BooleanBenchmarkView,
  type BenchmarkPeerGroup,
  type BenchmarkReference,
  type BenchmarkVisual,
  type NumericBenchmarkView,
} from "./kpiBenchmark";

const MIN_INDUSTRY_PEERS = 5;

export interface CompanyPeerSnapshot {
  wikidataId: string;
  groupCode: string | null;
  sectorCode: string | null;
  meetsParis: boolean | null;
  totalEmissions: number | null;
  yearOverYearChange: number | null;
}

export interface CompanyBenchmarkValues {
  meetsParis: boolean | null;
  totalEmissions: number | null;
  yearOverYearChange: number | null;
  groupCode: string | null;
  sectorCode: string | null;
  wikidataId: string;
}

export interface CompanyBenchmarkSet {
  meetsParis: BooleanBenchmarkView | null;
  totalEmissions: NumericBenchmarkView | null;
  yearOverYearChange: NumericBenchmarkView | null;
}

function finiteOrNull(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * Year-over-year figures beyond this are almost always a broken baseline
 * (a near-zero previous year). They would otherwise set the chart ends and
 * pull every company onto the "better" side.
 */
const MAX_ABS_YEARLY_CHANGE = 200;

function saneYearlyChange(value: number | null): number | null {
  if (value === null || Math.abs(value) > MAX_ABS_YEARLY_CHANGE) return null;
  return value;
}

function positiveOrNull(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

export function companyPeerSnapshot(
  company: RankedCompany,
  meetsParis: boolean | null,
  reportingYear: string,
): CompanyPeerSnapshot {
  const periods = [...(company.reportingPeriods ?? [])].sort(
    (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
  );
  const index = periods.findIndex(
    (period) => yearFromIsoDate(period.endDate) === reportingYear,
  );
  const current = index >= 0 ? periods[index] : undefined;
  const previous = index >= 0 ? periods[index + 1] : undefined;

  return {
    wikidataId: company.wikidataId,
    groupCode: company.industry?.industryGics?.groupCode ?? null,
    sectorCode: company.industry?.industryGics?.sectorCode ?? null,
    meetsParis,
    totalEmissions: positiveOrNull(
      current?.emissions?.calculatedTotalEmissions,
    ),
    yearOverYearChange: current
      ? calculateEmissionsChange(current, previous)
      : null,
  };
}

function comparisonGroup(
  peers: CompanyPeerSnapshot[],
  groupCode: string | null,
  sectorCode: string | null,
): {
  peers: CompanyPeerSnapshot[];
  groupPeerGroup: BenchmarkPeerGroup;
  reference: BenchmarkReference;
} | null {
  if (groupCode) {
    const industry = peers.filter((peer) => peer.groupCode === groupCode);
    if (industry.length >= MIN_INDUSTRY_PEERS) {
      return {
        peers: industry,
        groupPeerGroup: "companiesInIndustry",
        reference: "industry",
      };
    }
  }

  if (sectorCode) {
    const sector = peers.filter((peer) => peer.sectorCode === sectorCode);
    if (sector.length >= MIN_INDUSTRY_PEERS) {
      return {
        peers: sector,
        groupPeerGroup: "companiesInSector",
        reference: "sector",
      };
    }
  }

  return null;
}

function readNumbers(
  peers: CompanyPeerSnapshot[],
  read: (peer: CompanyPeerSnapshot) => number | null,
): number[] {
  return peers.map(read).filter((value): value is number => value !== null);
}

export function buildCompanyBenchmarks(
  values: CompanyBenchmarkValues,
  peers: CompanyPeerSnapshot[],
): CompanyBenchmarkSet {
  const others = peers.filter((peer) => peer.wikidataId !== values.wikidataId);
  const group = comparisonGroup(others, values.groupCode, values.sectorCode);
  const labels = {
    peerGroup: "companies" as const,
    groupPeerGroup: group?.groupPeerGroup,
    reference: group?.reference,
    minGroupSize: MIN_INDUSTRY_PEERS,
  };

  const numeric = (
    value: number | null,
    read: (peer: CompanyPeerSnapshot) => number | null,
    higherIsBetter: boolean | null,
    visual?: BenchmarkVisual,
  ) => {
    if (value === null || !Number.isFinite(value)) return null;
    return buildNumericBenchmark({
      value,
      peers: readNumbers(others, read),
      groupPeers: group ? readNumbers(group.peers, read) : undefined,
      higherIsBetter,
      peersIncludeSubject: false,
      visual,
      ...labels,
    });
  };

  return {
    meetsParis: buildBooleanBenchmark({
      value: values.meetsParis,
      peers: others.map((peer) => peer.meetsParis),
      higherIsBetter: true,
      peerGroup: "companies",
      peersIncludeSubject: false,
      visual: BENCHMARK_VISUAL.paris,
    }),
    totalEmissions: numeric(
      positiveOrNull(values.totalEmissions),
      (peer) => peer.totalEmissions,
      null,
    ),
    yearOverYearChange: numeric(
      saneYearlyChange(finiteOrNull(values.yearOverYearChange)),
      (peer) => saneYearlyChange(peer.yearOverYearChange),
      false,
      BENCHMARK_VISUAL.neutralBar,
    ),
  };
}
