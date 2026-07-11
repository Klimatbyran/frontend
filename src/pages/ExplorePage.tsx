import { useTranslation } from "react-i18next";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { PageHeader } from "@/components/layout/PageHeader";
import { useScreenSize } from "@/hooks/useScreenSize";
import { cn } from "@/lib/utils";
import { CompanyList } from "@/components/companies/list/CompanyList";
import { MunicipalityList } from "@/components/municipalities/list/MunicipalityList";
import { RegionList } from "@/components/regions/list/RegionList";
import { Toggle } from "@/components/ui/toggle";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import { useRegionsForExplore } from "@/hooks/regions/useRegionsForExplore";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router";
import { NotFoundPage } from "./NotFoundPage";

export function ExplorePage() {
  const { t } = useTranslation();
  const screenSize = useScreenSize();
  const navigate = useNavigate();
  const { mainFilter } = useParams();
  const isCompaniesTab = mainFilter === "companies";
  const isMunicipalitiesTab = mainFilter === "municipalities";
  const isRegionsTab = mainFilter === "regions";

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

  // Filter out search params that are not applicable to both municipalities and companies
  const urlSearchParams = new URLSearchParams(window.location.search);
  const globalUrlSearchParamStr = [
    "sortBy",
    "sortDirection",
    "meetsParisFilter",
  ]
    .filter((s) => urlSearchParams.has(s))
    .map((s) => `${s}=${urlSearchParams.get(s)}`)
    .join("&");

  if (
    mainFilter !== "companies" &&
    mainFilter !== "municipalities" &&
    mainFilter !== "regions"
  ) {
    return <NotFoundPage />;
  }

  const isLoading =
    (isCompaniesTab && companiesLoading && companies.length === 0) ||
    (isMunicipalitiesTab &&
      municipalitiesLoading &&
      municipalities.length === 0) ||
    (isRegionsTab && regionsLoading && regions.length === 0);

  const activeError = isCompaniesTab
    ? companiesError
    : isMunicipalitiesTab
      ? municipalitiesError
      : isRegionsTab
        ? regionsError
        : null;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-black-2 rounded-level-2" />
        ))}
      </div>
    );
  }

  if (activeError) {
    const errorMessages = {
      companies: {
        title: t("explorePage.companies.errorTitle"),
        description: t("explorePage.companies.errorDescription"),
      },
      regions: {
        title: t("explorePage.regions.errorTitle"),
        description: t("explorePage.regions.errorDescription"),
      },
      municipalities: {
        title: t("explorePage.municipalities.errorTitle"),
        description: t("explorePage.municipalities.errorDescription"),
      },
    };
    const { title, description } = errorMessages[mainFilter];
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-light text-red-500">{title}</h2>
        <p className="text-grey mt-2">{description}</p>
      </div>
    );
  }

  const mainFilterToggles = [
    {
      key: "municipalities",
      path: "../municipalities",
      labelKey: "explorePage.municipalities.municipalities",
    },
    {
      key: "regions",
      path: "../regions",
      labelKey: "explorePage.regions.regions",
    },
    {
      key: "companies",
      path: "../companies",
      labelKey: "explorePage.companies.companies",
    },
  ] as const;

  return (
    <>
      <PageHeader
        variant="sr-only"
        title={t("explorePage.title")}
        description={t("explorePage.description")}
      />

      {/* Filters & Sorting Section */}
      <div
        className={cn(
          screenSize.isMobile ? "relative" : "sticky top-0 z-10",
          "bg-black shadow-md",
        )}
      >
        {/* Wrapper for Filters, Search, and Badges */}
        <div className={cn("flex flex-wrap items-center gap-2 mb-4")}>
          {mainFilterToggles.map(({ key, path, labelKey }) => (
            <Toggle
              key={key}
              onClick={() => {
                if (mainFilter !== key) {
                  navigate([path, globalUrlSearchParamStr].join("?"), {
                    relative: "path",
                  });
                }
              }}
              variant="outlineWhite"
              pressed={mainFilter === key}
            >
              {t(labelKey)}
            </Toggle>
          ))}
        </div>
      </div>

      {
        {
          companies: <CompanyList companies={companies} />,
          regions: <RegionList regions={regions} />,
          municipalities: <MunicipalityList municipalities={municipalities} />,
        }[mainFilter]
      }
    </>
  );
}
