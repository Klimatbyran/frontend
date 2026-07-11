import { useParams, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { ComparisonDetailChip } from "@/components/compare/ComparisonDetailChip";
import { buildComparisonLinkTo } from "@/utils/compare/comparisonUtils";
import { useCompanyDetails } from "@/hooks/companies/useCompanyDetails";
import { CompanyOverview } from "@/components/companies/detail/overview/CompanyOverview";
import { CompanyOverviewNoData } from "@/components/companies/detail/overview/CompanyOverviewNoData";
import { EmissionsHistory } from "@/components/companies/detail/history/EmissionsHistory";
import { TurnoverEmissionsHistory } from "@/components/companies/detail/history/TurnoverEmissionsHistory";
import { Seo } from "@/components/SEO/Seo";
import { CompanyScope3 } from "@/components/companies/detail/CompanyScope3";
import { useLanguage } from "@/components/LanguageProvider";
import RelatableNumbers from "@/components/relatableNumbers";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { calculateEmissionsChange } from "@/utils/calculations/emissionsCalculations";
import { generateCompanySeoMeta } from "@/utils/seo/entitySeo";
import { getSeoForRoute } from "@/seo/routes";
import { yearFromIsoDate } from "@/utils/date";

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string; slug?: string }>();
  const location = useLocation();
  // The id parameter is always the Wikidata ID (Q-number)
  // It's either directly from /companies/:id or extracted from /foretag/:slug-:id
  const { company, loading, error } = useCompanyDetails(id!);
  const [selectedYear, setSelectedYear] = useState<string>("latest");
  const { currentLanguage } = useLanguage();

  // SEO meta: must run unconditionally (hooks rules). Fallback to route-level when no company.
  const latestYear = company?.reportingPeriods?.[0]
    ? Number(yearFromIsoDate(company.reportingPeriods[0].endDate))
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

  if (!company) {
    return (
      <PageNoData
        titleKey="companyDetailPage.notFoundTitle"
        descriptionKey="companyDetailPage.notFoundDescription"
      />
    );
  }

  const comparisonChip = (
    <ComparisonDetailChip
      linkTo={buildComparisonLinkTo("company", company.wikidataId)}
      variant="company"
      name={company.name}
    />
  );

  if (!company.reportingPeriods?.length) {
    return (
      <>
        <Seo meta={seoMeta} />
        <div className="mx-auto max-w-[1400px] space-y-8 md:space-y-16">
          <CompanyOverviewNoData
            company={company}
            headerChip={comparisonChip}
          />
        </div>
      </>
    );
  }

  const sortedPeriods = [...company.reportingPeriods].sort(
    (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
  );

  const selectedPeriod =
    selectedYear === "latest"
      ? sortedPeriods[0]
      : sortedPeriods.find(
          (p) => yearFromIsoDate(p.endDate) === selectedYear,
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

      <div className="mx-auto max-w-[1400px] space-y-8 md:space-y-16">
        <CompanyOverview
          company={company}
          selectedPeriod={selectedPeriod}
          previousPeriod={previousPeriod}
          yearOverYearChange={yearOverYearChange}
          headerChip={comparisonChip}
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

        <EmissionsHistory company={company} onYearSelect={setSelectedYear} />
        <TurnoverEmissionsHistory
          company={company}
          onYearSelect={setSelectedYear}
        />
        <CompanyScope3 emissions={selectedPeriod.emissions!} />
      </div>
    </>
  );
}
