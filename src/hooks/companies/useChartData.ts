import { useMemo } from "react";
import { RankedCompany } from "@/types/company";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";

const extractYears = (companies: RankedCompany[]): string[] => {
  const years = new Set<string>();
  companies.forEach((company) => {
    company.reportingPeriods.forEach((period) => {
      years.add(period.endDate.substring(0, 4));
    });
  });
  return Array.from(years).sort();
};

const getEmissionsFromPeriod = (
  period: RankedCompany["reportingPeriods"][number],
): { scope1: number; scope2: number; scope3: number } => {
  if (!period?.emissions) {
    return { scope1: 0, scope2: 0, scope3: 0 };
  }

  return {
    scope1: period.emissions.scope1?.total || 0,
    scope2: period.emissions.scope2?.calculatedTotalEmissions || 0,
    scope3: period.emissions.scope3?.calculatedTotalEmissions || 0,
  };
};

const calculateSectorScopesForYear = (
  companies: RankedCompany[],
  sectorCode: string,
  year: string,
): { scope1: number; scope2: number; scope3: number } => {
  let scope1 = 0;
  let scope2 = 0;
  let scope3 = 0;

  const sectorCompanies = companies.filter(
    (company) => company.industry?.industryGics?.sectorCode === sectorCode,
  );

  sectorCompanies.forEach((company) => {
    const periodForYear = company.reportingPeriods.find((period) =>
      period.endDate.startsWith(year),
    );

    if (periodForYear) {
      const emissions = getEmissionsFromPeriod(periodForYear);
      scope1 += emissions.scope1;
      scope2 += emissions.scope2;
      scope3 += emissions.scope3;
    }
  });

  return { scope1, scope2, scope3 };
};

const buildYearData = (
  year: string,
  companies: RankedCompany[],
  selectedSectors: string[],
  sectorNames: Record<string, string>,
): Record<string, unknown> => {
  const yearData: Record<string, unknown> = { year };

  selectedSectors.forEach((sectorCode) => {
    const sectorName = sectorNames[sectorCode as keyof typeof sectorNames];
    const { scope1, scope2, scope3 } = calculateSectorScopesForYear(
      companies,
      sectorCode,
      year,
    );

    yearData[`${sectorName}_scope1`] = scope1;
    yearData[`${sectorName}_scope2`] = scope2;
    yearData[`${sectorName}_scope3`] = scope3;
  });

  return yearData;
};

const createCompanyDataItem = (
  company: RankedCompany,
  selectedYear: string,
): {
  name: string;
  value: number;
  sectorCode: string | undefined;
  wikidataId: string | undefined;
  total: number;
} | null => {
  const periodForYear = company.reportingPeriods.find((period) =>
    period.endDate.startsWith(selectedYear),
  );

  if (!periodForYear) {
    return null;
  }

  const emissions = getEmissionsFromPeriod(periodForYear);
  const totalEmissions = emissions.scope1 + emissions.scope2 + emissions.scope3;

  if (totalEmissions === 0) {
    return null;
  }

  return {
    name: company.name,
    value: totalEmissions,
    sectorCode: company.industry?.industryGics?.sectorCode,
    wikidataId: company.wikidataId,
    total: totalEmissions,
  };
};

const normalizeAndSortPieData = <T extends { value: number }>(
  data: T[],
): Array<T & { total: number }> => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return data
    .map((item) => ({ ...item, total }))
    .sort((a, b) => b.value / b.total - a.value / a.total);
};

const buildCompanyPieData = (
  companies: RankedCompany[],
  selectedSector: string,
  selectedYear: string,
) => {
  const sectorCompanies = companies.filter(
    (company) => company.industry?.industryGics?.sectorCode === selectedSector,
  );

  const companyData = sectorCompanies
    .map((company) => createCompanyDataItem(company, selectedYear))
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return normalizeAndSortPieData(companyData);
};

const buildSectorPieData = (
  chartData: Array<Record<string, unknown>>,
  selectedYear: string,
  selectedSectors: string[],
  sectorNames: Record<string, string>,
) => {
  const yearData = chartData.find((d) => d.year === selectedYear);
  if (!yearData) return [];

  const sectorTotals = selectedSectors
    .map((sectorCode) => {
      const sectorName = sectorNames[sectorCode as keyof typeof sectorNames];
      const scope1 = (yearData[`${sectorName}_scope1`] as number) || 0;
      const scope2 = (yearData[`${sectorName}_scope2`] as number) || 0;
      const scope3 = (yearData[`${sectorName}_scope3`] as number) || 0;
      const value = scope1 + scope2 + scope3;

      return {
        name: sectorName,
        value,
        sectorCode,
        scope1,
        scope2,
        scope3,
      };
    })
    .filter((item) => item.value > 0);

  const totalEmissions = sectorTotals.reduce(
    (sum, sector) => sum + sector.value,
    0,
  );
  return sectorTotals
    .map((sector) => ({ ...sector, total: totalEmissions }))
    .sort((a, b) => b.value / b.total - a.value / a.total);
};

const calculateTotalEmissions = (
  pieChartData: Array<{ value: number }>,
): number => {
  return pieChartData.reduce((sum, item) => sum + item.value, 0);
};

const extractUniqueYears = (
  chartData: Array<Record<string, unknown>>,
): string[] => {
  return Array.from(new Set(chartData.map((d) => d.year as string))).sort();
};

export const useChartData = (
  companies: RankedCompany[],
  selectedSectors: string[],
  selectedSector: string | null,
  selectedYear: string,
) => {
  const sectorNames = useSectorNames();

  const chartData = useMemo(() => {
    const years = extractYears(companies);
    return years.map((year) =>
      buildYearData(year, companies, selectedSectors, sectorNames),
    );
  }, [companies, selectedSectors, sectorNames]);

  const pieChartData = useMemo(() => {
    if (selectedSector) {
      return buildCompanyPieData(companies, selectedSector, selectedYear);
    }
    return buildSectorPieData(
      chartData,
      selectedYear,
      selectedSectors,
      sectorNames,
    );
  }, [
    chartData,
    selectedYear,
    selectedSectors,
    selectedSector,
    companies,
    sectorNames,
  ]);

  const totalEmissions = useMemo(
    () => calculateTotalEmissions(pieChartData),
    [pieChartData],
  );

  const years = useMemo(() => extractUniqueYears(chartData), [chartData]);

  return { chartData, pieChartData, totalEmissions, years };
};
