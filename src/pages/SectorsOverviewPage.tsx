import { useTranslation } from "react-i18next";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { useCompanyFilters } from "@/hooks/companies/useCompanyFilters";
import SectorOverview from "@/components/companies/sectors/SectorOverview";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  SectorError,
  SectorLoading,
} from "@/components/companies/sectors/SectorPageStates";

export function SectorsOverviewPage() {
  const { t } = useTranslation();
  const { companies, companiesLoading, companiesError } = useCompanies();

  const { filteredCompanies, filterGroups, activeFilters } = useCompanyFilters(
    companies,
    { includeSectorFilter: false },
  );

  if (companiesLoading) {
    return <SectorLoading />;
  }

  if (companiesError) {
    return (
      <SectorError
        title={t("sectorsOverviewPage.errorTitle")}
        description={t("sectorsOverviewPage.errorDescription")}
      />
    );
  }

  return (
    <>
      <PageHeader variant="title-only" title={t("sectorsOverviewPage.title")} />
      <SectorOverview
        companies={filteredCompanies}
        filterGroups={filterGroups}
        activeFilters={activeFilters}
        isSectorView={false}
      />
    </>
  );
}
