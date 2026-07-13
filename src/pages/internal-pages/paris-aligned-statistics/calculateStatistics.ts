import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import {
  calculateMeetsParis,
  get2025Emissions,
  calculateCumulativeEmissions,
  calculateCarbonLawCumulativeEmissions,
} from "@/lib/calculations/trends/meetsParis";
import { calculateCarbonBudgetTonnes } from "@/utils/calculations/carbonBudget";
import type { RankedCompany } from "@/hooks/companies/useCompanies";

export interface ParisAlignedCompanyRow {
  name: string;
  id: string;
  wikidataId: string;
  emissions2025: number;
  carbonBudget: number;
  projectedEmissions: number;
  diffFromBudget: number;
  hasScope3Categories: boolean;
}

export interface ParisAlignedStatistics {
  totalCompaniesWithEmissionsData: number;
  totalCompaniesMeetsParisYes: number;
  totalCompaniesMeetsParisNo: number;
  totalCompaniesMeetsParisUnknown: number;
  totalCompaniesWithSlopeData: number;
  totalCompaniesCalculableMeetsParis: number;
  totalCarbonBudget: number;
  totalProjectedEmissions: number;
  totalTonnesDiffFromBudget: number;
  totalCompaniesMeetsParisYesWithScope3: number;
  totalCompaniesMeetsParisNoWithScope3: number;
  totalCompaniesMeetsParisUnknownWithScope3: number;
  yesCompanies: ParisAlignedCompanyRow[];
}

function hasEmissionsData(company: RankedCompany): boolean {
  return !!company.reportingPeriods?.some(
    (period) =>
      period.emissions &&
      period.emissions.calculatedTotalEmissions !== null &&
      period.emissions.calculatedTotalEmissions !== undefined,
  );
}

function hasScope3Categories(company: RankedCompany): boolean {
  return !!company.reportingPeriods?.some(
    (period) =>
      period.emissions?.scope3?.categories &&
      period.emissions.scope3.categories.length > 0,
  );
}

function getMeetsParisStatus(
  company: RankedCompany,
  trendAnalysis: ReturnType<typeof calculateTrendline>,
  emissions2025: number | null,
): boolean | null {
  if (!trendAnalysis || emissions2025 === null || emissions2025 === undefined) {
    return null;
  }
  if (emissions2025 <= 0) {
    return null;
  }
  return calculateMeetsParis(company, trendAnalysis);
}

function incrementMeetsParisCounts(
  meetsParis: boolean | null,
  hasScope3: boolean,
  counts: {
    yes: number;
    no: number;
    unknown: number;
    yesWithScope3: number;
    noWithScope3: number;
    unknownWithScope3: number;
  },
): void {
  if (meetsParis === true) {
    counts.yes++;
    if (hasScope3) counts.yesWithScope3++;
  } else if (meetsParis === false) {
    counts.no++;
    if (hasScope3) counts.noWithScope3++;
  } else {
    counts.unknown++;
    if (hasScope3) counts.unknownWithScope3++;
  }
}

interface ProcessCalculableCompanyInput {
  company: RankedCompany;
  trendAnalysis: NonNullable<ReturnType<typeof calculateTrendline>>;
  emissions2025: number;
  meetsParis: boolean;
  hasScope3: boolean;
  yesCompanies: ParisAlignedCompanyRow[];
  totals: {
    carbonBudget: number;
    projectedEmissions: number;
    tonnesDiffFromBudget: number;
  };
}

function processCalculableCompany({
  company,
  trendAnalysis,
  emissions2025,
  meetsParis,
  hasScope3,
  yesCompanies,
  totals,
}: ProcessCalculableCompanyInput): void {
  if (!trendAnalysis.coefficients) return;

  const slope =
    "slope" in trendAnalysis.coefficients
      ? trendAnalysis.coefficients.slope
      : trendAnalysis.coefficients.a;

  const companyCumulativeEmissions = calculateCumulativeEmissions(
    emissions2025,
    slope,
    2025,
    2050,
  );
  const carbonLawCumulativeEmissions = calculateCarbonLawCumulativeEmissions(
    emissions2025,
    2025,
    2050,
  );
  const tonnesDiff = calculateCarbonBudgetTonnes(company, trendAnalysis);

  if (meetsParis) {
    yesCompanies.push({
      name: company.name,
      id: company.id,
      wikidataId: company.wikidataId,
      emissions2025,
      carbonBudget: carbonLawCumulativeEmissions,
      projectedEmissions: companyCumulativeEmissions,
      diffFromBudget: companyCumulativeEmissions - carbonLawCumulativeEmissions,
      hasScope3Categories: hasScope3,
    });
  }

  totals.carbonBudget += carbonLawCumulativeEmissions;
  totals.projectedEmissions += companyCumulativeEmissions;

  if (tonnesDiff !== null) {
    if (tonnesDiff === -1_000_000) {
      totals.tonnesDiffFromBudget +=
        companyCumulativeEmissions - carbonLawCumulativeEmissions;
    } else {
      totals.tonnesDiffFromBudget += tonnesDiff;
    }
  }
}

export function calculateParisAlignedStatistics(
  companies: RankedCompany[],
): ParisAlignedStatistics | null {
  if (!companies || companies.length === 0) {
    return null;
  }

  const meetsParisCounts = {
    yes: 0,
    no: 0,
    unknown: 0,
    yesWithScope3: 0,
    noWithScope3: 0,
    unknownWithScope3: 0,
  };
  const yesCompanies: ParisAlignedCompanyRow[] = [];
  const emissionTotals = {
    carbonBudget: 0,
    projectedEmissions: 0,
    tonnesDiffFromBudget: 0,
  };

  let totalCompaniesWithEmissionsData = 0;
  let totalCompaniesWithSlopeData = 0;
  let totalCompaniesCalculableMeetsParis = 0;

  companies.forEach((company) => {
    if (hasEmissionsData(company)) {
      totalCompaniesWithEmissionsData++;
    }

    const trendAnalysis = calculateTrendline(company);
    const hasSlopeData =
      company.futureEmissionsTrendSlope !== null &&
      company.futureEmissionsTrendSlope !== undefined;

    if (hasSlopeData) {
      totalCompaniesWithSlopeData++;
    }

    const emissions2025 = trendAnalysis
      ? get2025Emissions(company, trendAnalysis)
      : null;
    const scope3 = hasScope3Categories(company);
    const meetsParis = getMeetsParisStatus(
      company,
      trendAnalysis,
      emissions2025,
    );

    incrementMeetsParisCounts(meetsParis, scope3, meetsParisCounts);

    if (meetsParis !== null && trendAnalysis) {
      totalCompaniesCalculableMeetsParis++;

      if (
        emissions2025 !== null &&
        emissions2025 !== undefined &&
        trendAnalysis.coefficients
      ) {
        processCalculableCompany({
          company,
          trendAnalysis,
          emissions2025,
          meetsParis,
          hasScope3: scope3,
          yesCompanies,
          totals: emissionTotals,
        });
      }
    }
  });

  return {
    totalCompaniesWithEmissionsData,
    totalCompaniesMeetsParisYes: meetsParisCounts.yes,
    totalCompaniesMeetsParisNo: meetsParisCounts.no,
    totalCompaniesMeetsParisUnknown: meetsParisCounts.unknown,
    totalCompaniesWithSlopeData,
    totalCompaniesCalculableMeetsParis,
    totalCarbonBudget: emissionTotals.carbonBudget,
    totalProjectedEmissions: emissionTotals.projectedEmissions,
    totalTonnesDiffFromBudget: emissionTotals.tonnesDiffFromBudget,
    totalCompaniesMeetsParisYesWithScope3: meetsParisCounts.yesWithScope3,
    totalCompaniesMeetsParisNoWithScope3: meetsParisCounts.noWithScope3,
    totalCompaniesMeetsParisUnknownWithScope3:
      meetsParisCounts.unknownWithScope3,
    yesCompanies: yesCompanies.sort((a, b) => a.name.localeCompare(b.name)),
  };
}
