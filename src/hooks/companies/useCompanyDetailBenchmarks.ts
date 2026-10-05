import { useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { enrichCompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
import type { CompanyDetails } from "@/types/company";
import {
  formatEmissionsAbsoluteCompact,
  formatPercentChange,
} from "@/utils/formatting/localization";
import {
  buildCompanyBenchmarks,
  companyPeerSnapshot,
} from "@/utils/detail/companyBenchmarks";

export function useCompanyDetailBenchmarks(
  company: CompanyDetails,
  meetsParis: boolean | null,
  totalEmissions: number | null,
  yearOverYearChange: number | null,
) {
  const { companies } = useCompanies();
  const { currentLanguage } = useLanguage();

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
          groupCode: company.industry?.industryGics?.groupCode ?? null,
          sectorCode: company.industry?.industryGics?.sectorCode ?? null,
        },
        peers,
        {
          emissions: (value) =>
            formatEmissionsAbsoluteCompact(value, currentLanguage),
          changePercent: (value) => formatPercentChange(value, currentLanguage),
        },
      ),
    [
      company,
      meetsParis,
      totalEmissions,
      yearOverYearChange,
      peers,
      currentLanguage,
    ],
  );
}
