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
import type { CompanyDetails, ReportingPeriod } from "@/types/company";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { generateCompanySeoMeta } from "@/utils/seo/entitySeo";
import { getSeoForRoute } from "@/seo/routes";
import { yearFromIsoDate } from "@/utils/date";
import {
  periodForComparisonYear,
  yearOverYearForComparisonYear,
} from "@/utils/detail/companyPeriodMetrics";

function emissionsChangeStatus(
  selectedPeriod: ReportingPeriod,
  previousPeriod: ReportingPeriod | undefined,
) {
  const prevEmissions = previousPeriod?.emissions?.calculatedTotalEmissions;
  const validEmissionsChangeNumber = prevEmissions
    ? Math.abs(
        selectedPeriod?.emissions?.calculatedTotalEmissions - prevEmissions,
      )
    : null;
  const status =
    selectedPeriod?.emissions?.calculatedTotalEmissions - prevEmissions > 0
      ? "increased"
      : "decreased";
  return { validEmissionsChangeNumber, status };
}

function CompanyDetailContent({
  company,
  seoMeta,
  selectedYear,
  onYearSelect,
  currentLanguage,
}: {
  company: CompanyDetails;
  seoMeta: ReturnType<typeof generateCompanySeoMeta>;
  selectedYear: string;
  onYearSelect: (year: string) => void;
  currentLanguage: string;
}) {
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

  const requestedPeriod = periodForComparisonYear(
    company.reportingPeriods,
    selectedYear,
  );
  const resolvedPeriod =
    requestedPeriod ??
    periodForComparisonYear(company.reportingPeriods, "latest");
  if (!resolvedPeriod) return null;

  const comparisonYear = requestedPeriod ? selectedYear : "latest";
  const yearOverYearChange = yearOverYearForComparisonYear(
    company.reportingPeriods,
    comparisonYear,
  );
  const { validEmissionsChangeNumber, status } = emissionsChangeStatus(
    resolvedPeriod.selected,
    resolvedPeriod.previous,
  );

  return (
    <>
      <Seo meta={seoMeta} />
      <div className="mx-auto max-w-[1400px] space-y-8 md:space-y-16">
        <CompanyOverview
          company={company}
          selectedPeriod={resolvedPeriod.selected}
          previousPeriod={resolvedPeriod.previous}
          yearOverYearChange={yearOverYearChange}
          comparisonYear={comparisonYear}
          headerChip={comparisonChip}
        />
        {validEmissionsChangeNumber && validEmissionsChangeNumber > 100 && (
          <RelatableNumbers
            emissionsChange={validEmissionsChangeNumber}
            currentLanguage={currentLanguage}
            companyName={company.name}
            emissionsChangeStatus={status}
            yearOverYearChange={yearOverYearChange}
          />
        )}
        <EmissionsHistory company={company} onYearSelect={onYearSelect} />
        <TurnoverEmissionsHistory
          company={company}
          onYearSelect={onYearSelect}
        />
        <CompanyScope3 emissions={resolvedPeriod.selected.emissions!} />
      </div>
    </>
  );
}

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string; slug?: string }>();
  const location = useLocation();
  const { company, loading, error } = useCompanyDetails(id!);
  const [selectedYear, setSelectedYear] = useState<string>("latest");
  const { currentLanguage } = useLanguage();

  const latestYear = company?.reportingPeriods?.[0]
    ? Number(yearFromIsoDate(company.reportingPeriods[0].endDate))
    : new Date().getFullYear();

  const seoMeta = useMemo(() => {
    if (!company) {
      return getSeoForRoute(location.pathname, { id: id || "" });
    }
    return generateCompanySeoMeta(company, location.pathname, { latestYear });
  }, [company, location.pathname, latestYear, id]);

  if (loading) return <PageLoading />;

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

  return (
    <CompanyDetailContent
      company={company}
      seoMeta={seoMeta}
      selectedYear={selectedYear}
      onYearSelect={setSelectedYear}
      currentLanguage={currentLanguage}
    />
  );
}
