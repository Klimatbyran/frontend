import { useTranslation } from "react-i18next";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { useCompanyFilters } from "@/hooks/companies/useCompanyFilters";
import { useParams } from "react-router-dom";
import SectorOverview from "@/components/companies/sectors/SectorOverview";
import {
  useIndustryGroupNames,
  useSectorTitles,
} from "@/hooks/companies/useCompanySectors";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSEO } from "@/components/SEO/PageSEO";
import { buildAbsoluteUrl } from "@/utils/seo";
import { useLanguage } from "@/components/LanguageProvider";
import {
  SectorError,
  SectorLoading,
} from "@/components/companies/sectors/SectorPageStates";
import { NotFoundPage } from "./NotFoundPage";
import { isIndustryGroupCode, isSectorCode } from "@/lib/constants/sectors";

export function SectorDetailPage() {
  const { code } = useParams<{ code: string }>();
  const { t } = useTranslation();
  const { companies, companiesLoading, companiesError } = useCompanies();
  const sectorTitles = useSectorTitles();
  const industryGroupNames = useIndustryGroupNames();
  const { currentLanguage } = useLanguage();

  const isIndustryGroup = code != null && isIndustryGroupCode(code);
  const isSector = code != null && isSectorCode(code);

  const categoryCompanies = companies.filter((company) => {
    const industryGics = company.industry?.industryGics;
    if (isIndustryGroup) {
      return industryGics?.groupCode === code;
    }
    return industryGics?.sectorCode === code;
  });

  const { filteredCompanies, filterGroups, activeFilters } = useCompanyFilters(
    categoryCompanies,
    { includeSectorFilter: false },
  );

  const categoryTitle = isIndustryGroup
    ? industryGroupNames[code]
    : isSector
      ? sectorTitles[code]
      : undefined;

  const canonicalUrl = buildAbsoluteUrl(`/${currentLanguage}/sectors/${code}`);

  if (code == undefined || (!isIndustryGroup && !isSector)) {
    return <NotFoundPage />;
  }

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
      <PageSEO
        title={`${categoryTitle} - Klimatkollen`}
        description={t("sectorsOverviewPage.description")}
        canonicalUrl={canonicalUrl}
      />
      <PageHeader variant="title-only" title={categoryTitle ?? code} />
      <SectorOverview
        companies={filteredCompanies}
        filterGroups={filterGroups}
        activeFilters={activeFilters}
        isSectorView={true}
      />
    </>
  );
}
