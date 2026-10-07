import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { enrichCompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
import { useCompanies } from "@/hooks/companies/useCompanies";
import {
  buildCompanyKpiCards,
  type CompanyKpiSubject,
} from "@/utils/detail/companyKpiCards";
import type { PlacementStatus } from "@/utils/insights/kpiPlacement";

function placementStatus(loading: boolean, error: unknown): PlacementStatus {
  if (loading) return "loading";
  if (error) return "error";
  return "ready";
}

export function useCompanyKpiCards(
  subject: CompanyKpiSubject,
  comparisonYear: string,
) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { companies, companiesLoading, companiesError } = useCompanies();
  const {
    wikidataId,
    meetsParis,
    yearOverYearChange,
    totalEmissions,
    periodYear,
    totalEmissionsAi,
    yearOverYearAi,
    sectorCode,
  } = subject;

  const peers = useMemo(
    () => companies.map((company) => enrichCompanyWithKPIs(company)),
    [companies],
  );

  const stableSubject = useMemo<CompanyKpiSubject>(
    () => ({
      wikidataId,
      meetsParis,
      yearOverYearChange,
      totalEmissions,
      periodYear,
      totalEmissionsAi,
      yearOverYearAi,
      sectorCode,
    }),
    [
      wikidataId,
      meetsParis,
      yearOverYearChange,
      totalEmissions,
      periodYear,
      totalEmissionsAi,
      yearOverYearAi,
      sectorCode,
    ],
  );

  return useMemo(
    () =>
      buildCompanyKpiCards(
        stableSubject,
        peers,
        comparisonYear,
        placementStatus(companiesLoading, companiesError),
        t,
        currentLanguage,
      ),
    [
      stableSubject,
      peers,
      comparisonYear,
      companiesLoading,
      companiesError,
      t,
      currentLanguage,
    ],
  );
}
