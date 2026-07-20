import { useCompanies } from "@/hooks/companies/useCompanies";
import { useCompanyParisOverview } from "@/hooks/companies/useCompanyParisOverview";
import type { CompanyKPIValue } from "@/types/company";
import type { RankedCompany } from "@/types/company";
import { isMeetsParisKpi } from "@/utils/insights/meetsParisKpi";

interface UseCompaniesOverviewSourceResult {
  companies: RankedCompany[] | undefined;
  companiesLoading: boolean;
  companiesError: Error | null;
}

export function useCompaniesOverviewSource(
  selectedKPI: CompanyKPIValue,
): UseCompaniesOverviewSourceResult {
  const usesParisOverview = isMeetsParisKpi(selectedKPI);

  const {
    companies: fullCompanies,
    companiesLoading: fullCompaniesLoading,
    companiesError: fullCompaniesError,
  } = useCompanies({ enabled: !usesParisOverview });

  const {
    companies: parisOverviewCompanies,
    companiesLoading: parisOverviewLoading,
    companiesError: parisOverviewError,
  } = useCompanyParisOverview({ enabled: usesParisOverview });

  return {
    companies: usesParisOverview ? parisOverviewCompanies : fullCompanies,
    companiesLoading: usesParisOverview
      ? parisOverviewLoading
      : fullCompaniesLoading,
    companiesError: usesParisOverview ? parisOverviewError : fullCompaniesError,
  };
}
