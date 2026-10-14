import { useTranslation } from "react-i18next";
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
    value === "companies" || value === "municipalities" || value === "regions"
  );
}

function getActiveError(
  mainFilter: ExploreFilter,
  municipalitiesError: unknown,
  regionsError: unknown,
) {
  if (mainFilter === "municipalities") {
    return municipalitiesError;
  }
  if (mainFilter === "regions") {
    return regionsError;
  }
  return null;
}

export function ExplorePage() {
  const { t } = useTranslation();
  const screenSize = useScreenSize();
  const navigate = useNavigate();
  const { mainFilter: mainFilterParam } = useParams();
  const isMunicipalitiesTab = mainFilterParam === "municipalities";
  const isRegionsTab = mainFilterParam === "regions";

  const { municipalities, municipalitiesLoading, municipalitiesError } =
    useMunicipalities({ enabled: isMunicipalitiesTab });
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
    (isMunicipalitiesTab &&
      municipalitiesLoading &&
      municipalities.length === 0) ||
    (isRegionsTab && regionsLoading && regions.length === 0);
  const activeError = getActiveError(
    mainFilter,
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
      <PageHeader variant="title-only" title={t("explorePage.title")} />

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
        municipalities={municipalities}
        regions={regions}
      />
    </>
  );
}
