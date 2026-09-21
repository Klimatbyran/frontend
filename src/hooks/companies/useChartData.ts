import { useMemo } from "react";
import { RankedCompany } from "@/types/company";
import { getCompanyUrlSegment } from "@/utils/companyRouting";
import { useIndustryGroupNames } from "@/hooks/companies/useCompanySectors";
import {
  INDUSTRY_GROUP_CODES,
  getSectorCodeFromIndustryGroup,
} from "@/lib/constants/sectors";

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

const calculateIndustryGroupScopesForYear = (
  companies: RankedCompany[],
  groupCode: string,
  year: string,
): { scope1: number; scope2: number; scope3: number } => {
  let scope1 = 0;
  let scope2 = 0;
  let scope3 = 0;

  const groupCompanies = companies.filter(
    (company) => company.industry?.industryGics?.groupCode === groupCode,
  );

  groupCompanies.forEach((company) => {
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

const createCompanyDataItem = (
  company: RankedCompany,
  selectedYear: string,
): {
  key: string;
  name: string;
  value: number;
  sectorCode: string | undefined;
  groupCode: string | undefined;
  wikidataId: string | undefined;
  companyId: string;
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
    key: company.id,
    name: company.name,
    value: totalEmissions,
    sectorCode: company.industry?.industryGics?.sectorCode,
    groupCode: company.industry?.industryGics?.groupCode,
    wikidataId: getCompanyUrlSegment(company),
    companyId: company.id,
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
  selectedYear: string,
) => {
  const companyData = companies
    .map((company) => createCompanyDataItem(company, selectedYear))
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return normalizeAndSortPieData(companyData);
};

const buildIndustryGroupPieData = (
  companies: RankedCompany[],
  selectedYear: string,
  industryGroupNames: Record<string, string>,
) => {
  const groupTotals = INDUSTRY_GROUP_CODES.map((groupCode) => {
    const groupName = industryGroupNames[groupCode];
    const { scope1, scope2, scope3 } = calculateIndustryGroupScopesForYear(
      companies,
      groupCode,
      selectedYear,
    );
    const value = scope1 + scope2 + scope3;

    return {
      key: groupCode,
      name: groupName,
      value,
      sectorCode: getSectorCodeFromIndustryGroup(groupCode),
      groupCode,
      scope1,
      scope2,
      scope3,
    };
  }).filter((item) => item.value > 0);

  const totalEmissions = groupTotals.reduce(
    (sum, group) => sum + group.value,
    0,
  );
  return groupTotals
    .map((group) => ({ ...group, total: totalEmissions }))
    .sort((a, b) => b.value / b.total - a.value / a.total);
};

export const useChartData = (
  companies: RankedCompany[],
  isSectorView: boolean,
  selectedYear: string,
) => {
  const industryGroupNames = useIndustryGroupNames();

  const pieChartData = useMemo(
    () =>
      isSectorView
        ? buildCompanyPieData(companies, selectedYear)
        : buildIndustryGroupPieData(
            companies,
            selectedYear,
            industryGroupNames,
          ),
    [companies, selectedYear, isSectorView, industryGroupNames],
  );

  const totalEmissions = useMemo(
    () => pieChartData.reduce((sum, item) => sum + item.value, 0),
    [pieChartData],
  );

  return { pieChartData, totalEmissions };
};
