import { useTranslation } from "react-i18next";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { PageHeader } from "@/components/layout/PageHeader";
import { useScreenSize } from "@/hooks/useScreenSize";
import { cn } from "@/lib/utils";
import { CompanyList } from "@/components/companies/list/CompanyList";
import { MunicipalityList } from "@/components/municipalities/list/MunicipalityList";
import { Toggle } from "@/components/ui/toggle";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router";
import { NotFoundPage } from "./NotFoundPage";

export function ExplorePage() {
  const { t } = useTranslation();
  const screenSize = useScreenSize();
  const navigate = useNavigate();
  const { mainFilter } = useParams();
  const { municipalities, municipalitiesLoading, municipalitiesError } =
    useMunicipalities();
  const { companies, companiesLoading, companiesError } = useCompanies();

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

  if (mainFilter !== "companies" && mainFilter !== "municipalities") {
    return <NotFoundPage />;
  }

  if (municipalitiesLoading || companiesLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-black-2 rounded-level-2" />
        ))}
      </div>
    );
  }

  if (companiesError || municipalitiesError) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-light text-red-500">
          {mainFilter === "companies"
            ? t("explorePage.companies.errorTitle")
            : t("explorePage.municipalities.errorTitle")}
        </h2>
        <p className="text-grey mt-2">
          {mainFilter === "companies"
            ? t("explorePage.companies.errorDescription")
            : t("explorePage.municipalities.errorDescription")}
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={t("explorePage.title")}
        description={t("explorePage.description")}
        className="-ml-4"
      />

      {/* Filters & Sorting Section */}
      <div
        className={cn(
          screenSize.isMobile ? "relative" : "sticky top-0 z-10",
          "bg-black shadow-md",
        )}
      >
        <div className="absolute inset-0 w-full bg-black -z-10" />

        {/* Wrapper for Filters, Search, and Badges */}
        <div className={cn("flex flex-wrap items-center gap-2 mb-4")}>
          {/* Search Input */}
          <Toggle
            onClick={() => {
              if (mainFilter !== "companies") {
                navigate(["../companies", globalUrlSearchParamStr].join("?"), {
                  relative: "path",
                });
              }
            }}
            variant={"outlineWhite"}
            pressed={mainFilter === "companies"}
          >
            {t("explorePage.companies.companies")}
          </Toggle>
          <Toggle
            onClick={() => {
              if (mainFilter !== "municipalities") {
                navigate(
                  ["../municipalities", globalUrlSearchParamStr].join("?"),
                  { relative: "path" },
                );
              }
            }}
            variant={"outlineWhite"}
            pressed={mainFilter === "municipalities"}
          >
            {t("explorePage.municipalities.municipalities")}
          </Toggle>
        </div>
      </div>

      {mainFilter === "companies" ? (
        <CompanyList companies={companies} />
      ) : (
        <MunicipalityList municipalities={municipalities} />
      )}
    </>
  );
}
