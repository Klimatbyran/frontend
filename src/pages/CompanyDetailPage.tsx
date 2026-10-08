import { useParams, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { ComparisonDetailChip } from "@/components/compare/ComparisonDetailChip";
import { buildComparisonLinkTo } from "@/utils/compare/comparisonUtils";
import {
  usePageCompanyHeader,
  usePageCompanyHistories,
  usePageCompanyOverview,
  usePageCompanyScope3,
} from "@/hooks/pages/usePageCompanyDetail";
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
import { generateCompanySeoMeta } from "@/utils/seo/entitySeo";
import { getSeoForRoute } from "@/seo/routes";

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string; slug?: string }>();
  const location = useLocation();
  const [selectedYear, setSelectedYear] = useState<string>("latest");
  const { currentLanguage } = useLanguage();

  const yearNumber =
    selectedYear === "latest" ? undefined : Number(selectedYear);

  const {
    header,
    loading: headerLoading,
    error: headerError,
  } = usePageCompanyHeader(id!);
  const {
    overview,
    loading: overviewLoading,
    error: overviewError,
  } = usePageCompanyOverview(id!, yearNumber, !!header);
  const {
    emissionsHistory,
    turnoverHistory,
    loading: historiesLoading,
    error: historiesError,
  } = usePageCompanyHistories(id!, !!header);
  const { scope3 } = usePageCompanyScope3(id!, yearNumber, !!header);

  const loading = headerLoading || overviewLoading || historiesLoading;
  const error = headerError || overviewError || historiesError;

  const latestYear =
    header?.availableYears[0] ?? overview?.year ?? new Date().getFullYear();

  const seoMeta = useMemo(() => {
    if (!header) {
      return getSeoForRoute(location.pathname, { id: id || "" });
    }
    return generateCompanySeoMeta(
      {
        name: header.name,
        industry: header.sectorCode
          ? { industryGics: { sectorCode: header.sectorCode } }
          : null,
        reportingPeriods:
          overview?.totalEmissions != null && overview.year != null
            ? [
                {
                  endDate: `${overview.year}-12-31`,
                  emissions: {
                    calculatedTotalEmissions: overview.totalEmissions,
                  },
                },
              ]
            : [],
      },
      location.pathname,
      { latestYear },
    );
  }, [header, overview, location.pathname, latestYear, id]);

  if (loading) return <PageLoading />;

  if (error) {
    return (
      <PageError
        titleKey="companyDetailPage.errorTitle"
        descriptionKey="companyDetailPage.errorDescription"
      />
    );
  }

  if (!header) {
    return (
      <PageNoData
        titleKey="companyDetailPage.notFoundTitle"
        descriptionKey="companyDetailPage.notFoundDescription"
      />
    );
  }

  const comparisonChip = (
    <ComparisonDetailChip
      linkTo={buildComparisonLinkTo("company", header.wikidataId ?? header.id)}
      variant="company"
      name={header.name}
    />
  );

  const hasPeriods = (header.availableYears?.length ?? 0) > 0;

  if (!hasPeriods || !overview || overview.year == null) {
    return (
      <>
        <Seo meta={seoMeta} />
        <div className="mx-auto max-w-[1400px] space-y-8 md:space-y-16">
          <CompanyOverviewNoData header={header} headerChip={comparisonChip} />
        </div>
      </>
    );
  }

  return (
    <>
      <Seo meta={seoMeta} />
      <div className="mx-auto max-w-[1400px] space-y-8 md:space-y-16">
        <CompanyOverview
          header={header}
          overview={overview}
          headerChip={comparisonChip}
        />
        {overview.emissionsChangeAbsolute != null &&
          overview.emissionsChangeAbsolute > 100 &&
          overview.emissionsChangeStatus != null && (
          <RelatableNumbers
            emissionsChange={overview.emissionsChangeAbsolute}
            currentLanguage={currentLanguage}
            companyName={header.name}
            emissionsChangeStatus={overview.emissionsChangeStatus}
            yearOverYearChange={overview.emissionsChangeLastTwoYears}
          />
        )}
        {emissionsHistory && (
          <EmissionsHistory
            history={emissionsHistory}
            onYearSelect={setSelectedYear}
          />
        )}
        {turnoverHistory && (
          <TurnoverEmissionsHistory
            history={turnoverHistory}
            onYearSelect={setSelectedYear}
          />
        )}
        <CompanyScope3 scope3={scope3} />
      </div>
    </>
  );
}
