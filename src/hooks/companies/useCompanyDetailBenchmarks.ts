import { useMemo } from "react";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { enrichCompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
import type { CompanyDetails } from "@/types/company";
import {
  buildCompanyBenchmarks,
  companyPeerSnapshot,
} from "@/utils/detail/companyBenchmarks";

export function useCompanyDetailBenchmarks(
  company: CompanyDetails,
  meetsParis: boolean | null,
  totalEmissions: number | null,
  yearOverYearChange: number | null,
  reportingYear: string,
) {
  const { companies } = useCompanies();

  const peers = useMemo(
    () =>
      companies.map((item) =>
        companyPeerSnapshot(
          item,
          enrichCompanyWithKPIs(item).meetsParis ?? null,
          reportingYear,
        ),
      ),
    [companies, reportingYear],
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
          wikidataId: company.wikidataId,
        },
        peers,
      ),
    [company, meetsParis, totalEmissions, yearOverYearChange, peers],
  );
}
