import { useMemo } from "react";
import { RankedCompany } from "@/types/company";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { calculateMeetsParis } from "@/lib/calculations/trends/meetsParis";
import { useTrendAnalysis } from "@/hooks/companies/useTrendAnalysis";

const getEmissionsForYear = (
  company: RankedCompany,
  year: string,
): number => {
  const period = company.reportingPeriods.find((p) =>
    p.endDate.startsWith(year),
  );
  if (!period?.emissions) return 0;

  return (
    (period.emissions.scope1?.total || 0) +
    (period.emissions.scope2?.calculatedTotalEmissions || 0) +
    (period.emissions.scope3?.calculatedTotalEmissions || 0)
  );
};

export const useSectorOverviewStats = (
  companies: RankedCompany[],
  selectedSectors: string[],
  selectedYear: string,
) => {
  const trends = useTrendAnalysis(companies, selectedSectors);

  return useMemo(() => {
    const uniqueSectors = new Set(
      companies
        .map((c) => c.industry?.industryGics?.sectorCode)
        .filter(Boolean),
    );

    const totalEmissions = companies.reduce(
      (sum, company) => sum + getEmissionsForYear(company, selectedYear),
      0,
    );

    const companiesWithEmissions = companies.filter(
      (c) => getEmissionsForYear(c, selectedYear) > 0,
    ).length;

    let meetsParisYes = 0;
    let meetsParisNo = 0;
    let meetsParisUnknown = 0;

    companies.forEach((company) => {
      const trendAnalysis = calculateTrendline(company);
      const meetsParis = trendAnalysis
        ? calculateMeetsParis(company, trendAnalysis)
        : null;

      if (meetsParis === true) meetsParisYes++;
      else if (meetsParis === false) meetsParisNo++;
      else meetsParisUnknown++;
    });

    const reducingCount = trends.decreasing.length;
    const increasingCount = trends.increasing.length;
    const noComparableCount = trends.noComparable.length;
    const trendTotal = reducingCount + increasingCount + noComparableCount;

    return {
      companyCount: companies.length,
      sectorCount: uniqueSectors.size,
      totalEmissions,
      companiesWithEmissions,
      reducingCount,
      increasingCount,
      noComparableCount,
      reducingPercent:
        trendTotal > 0 ? reducingCount / trendTotal : 0,
      meetsParisYes,
      meetsParisNo,
      meetsParisUnknown,
      meetsParisPercent:
        companies.length > 0 ? meetsParisYes / companies.length : 0,
    };
  }, [companies, selectedSectors, selectedYear, trends]);
};
