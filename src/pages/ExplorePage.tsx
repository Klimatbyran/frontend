import { useEffect, useState } from "react";
import { useCompanies } from "@/hooks/companies/useCompanies";

import { PageHeader } from "@/components/layout/PageHeader";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "@/hooks/useScreenSize";
import { cn } from "@/lib/utils";
import { CompanyList } from "@/components/companies/list/CompanyList";
import { MunicipalityList } from "@/components/municipalities/list/MunicipalityList";

import { Toggle } from "@/components/ui/toggle";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";

export function ExplorePage() {
  const { t } = useTranslation();
  const screenSize = useScreenSize();
  const [mainFilter, setMainFilter] = useState<"companies" | "municipalities">(
    "companies",
  );

  const { municipalities, municipalitiesLoading, municipalitiesError } =
    useMunicipalities();
  const { companies, companiesLoading, companiesError } = useCompanies();

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
            ? t("companiesPage.errorTitle")
            : t("municipalitiesComparePage.errorTitle")}
        </h2>
        <p className="text-grey mt-2">
          {mainFilter === "companies"
            ? t("companiesPage.errorDescription")
            : t("municipalitiesComparePage.errorDescription")}
        </p>
      </div>
    );
  }

  /* console.log("Main filter:", mainFilter); */

  console.log(mainFilter);

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
        <div className={cn("flex flex-wrap items-center gap-2 mb-2 md:mb-4")}>
          {/* Search Input */}
          <Toggle
            onClick={() => setMainFilter("companies")}
            variant={"outlineWhite"}
            pressed={mainFilter === "companies"}
          >
            {t("explorePage.companies")}
          </Toggle>
          <Toggle
            onClick={() => {
              setMainFilter("municipalities");
            }}
            variant={"outlineWhite"}
            pressed={mainFilter === "municipalities"}
          >
            {t("explorePage.municipalities")}
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
