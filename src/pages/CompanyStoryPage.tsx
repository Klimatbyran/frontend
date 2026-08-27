import { useMemo } from "react";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { CompanyStory } from "@/components/companies/story/CompanyStory";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { computeCompanyStoryMetrics } from "@/utils/data/companyStoryMetrics";

export function CompanyStoryPage() {
  const { companies, companiesLoading, companiesError } = useCompanies();

  const metrics = useMemo(
    () =>
      companies.length > 0 ? computeCompanyStoryMetrics(companies) : null,
    [companies],
  );

  if (companiesLoading) return <PageLoading />;
  if (companiesError) return <PageError />;
  if (!metrics || metrics.companyCount === 0) return <PageNoData />;

  return <CompanyStory metrics={metrics} />;
}
