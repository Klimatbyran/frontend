import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { enrichCompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
import type { CompanyDetails } from "@/types/company";
import {
  formatEmissionsAbsoluteCompact,
  formatEmployeeCount,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { formatTurnoverValue } from "@/utils/formatting/turnoverFormatting";
import {
  buildCompanyBenchmarks,
  companyPeerSnapshot,
} from "@/utils/detail/companyBenchmarks";

export function useCompanyDetailBenchmarks(
  company: CompanyDetails,
  meetsParis: boolean | null,
  totalEmissions: number | null,
  yearOverYearChange: number | null,
  turnover: number | null,
  employees: number | null,
) {
  const { companies } = useCompanies();
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();

  const peers = useMemo(
    () =>
      companies.map((item) =>
        companyPeerSnapshot(
          item,
          enrichCompanyWithKPIs(item).meetsParis ?? null,
        ),
      ),
    [companies],
  );

  return useMemo(
    () =>
      buildCompanyBenchmarks(
        {
          meetsParis,
          totalEmissions,
          yearOverYearChange,
          turnover,
          employees,
          groupCode: company.industry?.industryGics?.groupCode ?? null,
          sectorCode: company.industry?.industryGics?.sectorCode ?? null,
        },
        peers,
        {
          emissions: (value) =>
            formatEmissionsAbsoluteCompact(value, currentLanguage),
          changePercent: (value) => formatPercentChange(value, currentLanguage),
          turnover: (value) => formatTurnoverValue(value, currentLanguage, t),
          employees: (value) => formatEmployeeCount(value, currentLanguage),
        },
      ),
    [
      company,
      meetsParis,
      totalEmissions,
      yearOverYearChange,
      turnover,
      employees,
      peers,
      currentLanguage,
      t,
    ],
  );
}
