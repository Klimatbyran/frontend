import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";
import { CompanyList } from "@/components/companies/list/CompanyList";
import { MunicipalityList } from "@/components/municipalities/list/MunicipalityList";
import { RegionList } from "@/components/regions/list/RegionList";
import type { RankedCompany } from "@/types/company";
import type { Municipality } from "@/types/municipality";
import type { RegionForExplore } from "@/hooks/regions/useRegionsForExplore";

type ExploreFilter = "companies" | "municipalities" | "regions";

function getGlobalUrlSearchParamStr() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  return ["sortBy", "sortDirection", "meetsParisFilter"]
    .filter((param) => urlSearchParams.has(param))
    .map((param) => `${param}=${urlSearchParams.get(param)}`)
    .join("&");
}

function ExploreLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="h-64 bg-black-2 rounded-level-2" />
      ))}
    </div>
  );
}

function ExploreErrorView({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-light text-red-500">{title}</h2>
      <p className="text-grey mt-2">{description}</p>
    </div>
  );
}

function getExploreErrorMessages(t: ReturnType<typeof useTranslation>["t"]) {
  return {
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
}

function ExploreFilterToggles({
  mainFilter,
  globalUrlSearchParamStr,
  onNavigate,
}: {
  mainFilter: ExploreFilter;
  globalUrlSearchParamStr: string;
  onNavigate: (path: string) => void;
}) {
  const { t } = useTranslation();
  const mainFilterToggles = [
    {
      key: "municipalities" as const,
      path: "../municipalities",
      labelKey: "explorePage.municipalities.municipalities",
    },
    {
      key: "regions" as const,
      path: "../regions",
      labelKey: "explorePage.regions.regions",
    },
    {
      key: "companies" as const,
      path: "../companies",
      labelKey: "explorePage.companies.companies",
    },
  ];

  return (
    <div className={cn("flex flex-wrap items-center gap-2 mb-4")}>
      {mainFilterToggles.map(({ key, path, labelKey }) => (
        <Toggle
          key={key}
          onClick={() => {
            if (mainFilter !== key) {
              onNavigate([path, globalUrlSearchParamStr].join("?"));
            }
          }}
          variant="outlineWhite"
          pressed={mainFilter === key}
        >
          {t(labelKey)}
        </Toggle>
      ))}
    </div>
  );
}

function ExploreEntityList({
  mainFilter,
  companies,
  municipalities,
  regions,
}: {
  mainFilter: ExploreFilter;
  companies: RankedCompany[];
  municipalities: Municipality[];
  regions: RegionForExplore[];
}) {
  if (mainFilter === "companies") {
    return <CompanyList companies={companies} />;
  }
  if (mainFilter === "regions") {
    return <RegionList regions={regions} />;
  }
  return <MunicipalityList municipalities={municipalities} />;
}

export {
  ExploreLoadingSkeleton,
  ExploreErrorView,
  ExploreFilterToggles,
  ExploreEntityList,
  getGlobalUrlSearchParamStr,
  getExploreErrorMessages,
};

export type { ExploreFilter };
