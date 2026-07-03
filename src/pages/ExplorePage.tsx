import { useTranslation } from "react-i18next";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { PageHeader } from "@/components/layout/PageHeader";
import { useScreenSize } from "@/hooks/useScreenSize";
import { cn } from "@/lib/utils";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import { useRegionsForExplore } from "@/hooks/regions/useRegionsForExplore";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router";
import { NotFoundPage } from "./NotFoundPage";
import {
  ExploreEntityList,
  ExploreErrorView,
  ExploreFilterToggles,
  ExploreLoadingSkeleton,
  getExploreErrorMessages,
  getGlobalUrlSearchParamStr,
  type ExploreFilter,
} from "./ExplorePageParts";

function isExploreFilter(value?: string): value is ExploreFilter {
  return (
    value === "companies" ||
    value === "municipalities" ||
    value === "regions"
  );
}

function getActiveError(
  mainFilter: ExploreFilter,
  companiesError: unknown,
  municipalitiesError: unknown,
  regionsError: unknown,
) {
  if (mainFilter === "companies") {
    return companiesError;
  }
  if (mainFilter === "municipalities") {
    return municipalitiesError;
  }
  return regionsError;
}

export function ExplorePage() {
  const { t } = useTranslation();
  const screenSize = useScreenSize();
  const navigate = useNavigate();
  const { mainFilter: mainFilterParam } = useParams();
  const isCompaniesTab = mainFilterParam === "companies";
  const isMunicipalitiesTab = mainFilterParam === "municipalities";
  const isRegionsTab = mainFilterParam === "regions";

  const { municipalities, municipalitiesLoading, municipalitiesError } =
    useMunicipalities({ enabled: isMunicipalitiesTab });
  const { companies, companiesLoading, companiesError } = useCompanies({
    enabled: isCompaniesTab,
  });
  const {
    regions,
    loading: regionsLoading,
    error: regionsError,
  } = useRegionsForExplore({ enabled: isRegionsTab });

  const globalUrlSearchParamStr = getGlobalUrlSearchParamStr();

  if (!isExploreFilter(mainFilterParam)) {
    return <NotFoundPage />;
  }

  const mainFilter = mainFilterParam;
  const isLoading =
    (isCompaniesTab && companiesLoading && companies.length === 0) ||
    (isMunicipalitiesTab &&
      municipalitiesLoading &&
      municipalities.length === 0) ||
    (isRegionsTab && regionsLoading && regions.length === 0);
  const activeError = getActiveError(
    mainFilter,
    companiesError,
    municipalitiesError,
    regionsError,
  );

  if (isLoading) {
    return <ExploreLoadingSkeleton />;
  }

  if (activeError) {
    const errorMessages = getExploreErrorMessages(t);
    const { title, description } = errorMessages[mainFilter];
    return <ExploreErrorView title={title} description={description} />;
  }

  return (
    <>
      <PageHeader
        title={t("explorePage.title")}
        description={t("explorePage.description")}
        className="-ml-4"
      />

      <div
        className={cn(
          screenSize.isMobile ? "relative" : "sticky top-0 z-10",
          "bg-black shadow-md",
        )}
      >
        <ExploreFilterToggles
          mainFilter={mainFilter}
          globalUrlSearchParamStr={globalUrlSearchParamStr}
          onNavigate={(path) => navigate(path, { relative: "path" })}
        />
      </div>

      <ExploreEntityList
        mainFilter={mainFilter}
        companies={companies}
        municipalities={municipalities}
        regions={regions}
      />
    </>
  );
}
