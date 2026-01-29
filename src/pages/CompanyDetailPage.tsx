import { useParams, useLocation } from "react-router-dom";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCompanyDetails } from "@/hooks/companies/useCompanyDetails";
import { CompanyOverview } from "@/components/companies/detail/overview/CompanyOverview";
import { EmissionsHistory } from "@/components/companies/detail/history/EmissionsHistory";
import { Seo } from "@/components/SEO/Seo";
import { CompanyScope3 } from "@/components/companies/detail/CompanyScope3";
import { useLanguage } from "@/components/LanguageProvider";
import RelatableNumbers from "@/components/relatableNumbers";
import type { Scope3Category } from "@/types/company";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { calculateEmissionsChange } from "@/utils/calculations/emissionsCalculations";
import { generateCompanySeoMeta } from "@/utils/seo/entitySeo";
import { getSeoForRoute } from "@/seo/routes";

export function CompanyDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string; slug?: string }>();
  const location = useLocation();
  // The id parameter is always the Wikidata ID (Q-number)
  // It's either directly from /companies/:id or extracted from /foretag/:slug-:id
  const { company, loading, error } = useCompanyDetails(id!);
  const [selectedYear, setSelectedYear] = useState<string>("latest");
  const { currentLanguage } = useLanguage();

  // SEO meta: must run unconditionally (hooks rules). Fallback to route-level when no company.
  const latestYear = company?.reportingPeriods?.[0]
    ? new Date(company.reportingPeriods[0].endDate).getFullYear()
    : new Date().getFullYear();

  const seoMeta = useMemo(() => {
    if (!company) {
      return getSeoForRoute(location.pathname, { id: id || "" });
    }
    return generateCompanySeoMeta(company, location.pathname, {
      latestYear,
    });
  }, [company, location.pathname, latestYear, id]);

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <PageError
        titleKey="companyDetailPage.errorTitle"
        descriptionKey="companyDetailPage.errorDescription"
      />
    );
  }

  if (!company || !company.reportingPeriods.length) {
    return (
      <PageNoData
        titleKey="companyDetailPage.notFoundTitle"
        descriptionKey="companyDetailPage.notFoundDescription"
      />
    );
  }

  const sortedPeriods = [...company.reportingPeriods].sort(
    (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
  );

  const selectedPeriod =
    selectedYear === "latest"
      ? sortedPeriods[0]
      : sortedPeriods.find(
          (p) => new Date(p.endDate).getFullYear().toString() === selectedYear,
        ) || sortedPeriods[0];

  const selectedIndex = sortedPeriods.findIndex(
    (p) => p.endDate === selectedPeriod.endDate,
  );
  const previousPeriod =
    selectedIndex < sortedPeriods.length - 1
      ? sortedPeriods[selectedIndex + 1]
      : undefined;

  const prevEmissions = previousPeriod?.emissions?.calculatedTotalEmissions;

  const validEmissionsChangeNumber = prevEmissions
    ? Math.abs(
        selectedPeriod?.emissions?.calculatedTotalEmissions - prevEmissions,
      )
    : null;

  const emissionsChangeStatus =
    selectedPeriod?.emissions?.calculatedTotalEmissions - prevEmissions > 0
      ? "increased"
      : "decreased";

  // Calculate emissions change from previous period
  const yearOverYearChange = calculateEmissionsChange(
    selectedPeriod,
    previousPeriod,
  );

  return (
    <>
      {/* Only render SEO when data is available, otherwise Layout will use route-level SEO */}
      {company && <Seo meta={seoMeta} />}

      <div className="space-y-8 md:space-y-16 max-w-[1400px] mx-auto">
        <CompanyOverview
          company={company}
          selectedPeriod={selectedPeriod}
          previousPeriod={previousPeriod}
          onYearSelect={setSelectedYear}
          selectedYear={selectedYear}
          yearOverYearChange={yearOverYearChange}
        />
        {validEmissionsChangeNumber && validEmissionsChangeNumber > 100 && (
          <RelatableNumbers
            emissionsChange={validEmissionsChangeNumber}
            currentLanguage={currentLanguage}
            companyName={company.name}
            emissionsChangeStatus={emissionsChangeStatus}
            yearOverYearChange={yearOverYearChange}
          />
        )}

        <EmissionsHistory company={company} />
        <CompanyScope3
          emissions={selectedPeriod.emissions!}
          historicalData={sortedPeriods
            .filter(
              (period) =>
                period.emissions?.scope3?.categories &&
                period.emissions.scope3.categories.length > 0,
            )
            .map((period) => ({
              year: new Date(period.endDate).getFullYear(),
              total: period.emissions!.scope3!.calculatedTotalEmissions!,
              unit:
                period.emissions!.scope3!.statedTotalEmissions?.unit ||
                t("emissionsUnit"),
              categories: period
                .emissions!.scope3!.categories!.filter(
                  (cat: Scope3Category) => cat.total !== null,
                )
                .map((cat: Scope3Category) => ({
                  category: cat.category,
                  total: cat.total as number,
                  unit: cat.unit,
                })),
            }))
            .sort((a, b) => a.year - b.year)}
        />
      </div>
    </>
  );
}
