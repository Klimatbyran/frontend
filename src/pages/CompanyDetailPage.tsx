import { useParams, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import { generateCompanySeoMeta } from "@/utils/seo/entitySeo";
import {
  getCompanySectorName,
  industryGicsForSeo,
} from "@/utils/data/industryGrouping";
import { getSeoForRoute } from "@/seo/routes";
import { getCompanyUrlSegment } from "@/utils/companyRouting";
import type {
  PageCompanyEmissionsHistory,
  PageCompanyScope3,
  PageCompanyTurnoverHistory,
} from "@/types/pages";

function SectionLoadError({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();

  return (
    <section className="rounded-level-2 bg-black-2 px-6 py-10 text-center">
      <h2 className="mb-2 text-xl text-red-500">{t(titleKey)}</h2>
      <p className="text-grey">{t("companyDetailPage.errorDescription")}</p>
    </section>
  );
}

function CompanyDetailCharts({
  emissionsHistory,
  turnoverHistory,
  emissionsError,
  turnoverError,
  scope3,
  scope3Error,
  onYearSelect,
}: {
  emissionsHistory: PageCompanyEmissionsHistory | undefined;
  turnoverHistory: PageCompanyTurnoverHistory | undefined;
  emissionsError: unknown;
  turnoverError: unknown;
  scope3: PageCompanyScope3 | undefined;
  scope3Error: unknown;
  onYearSelect: (year: string) => void;
}) {
  return (
    <>
      {emissionsHistory ? (
        <EmissionsHistory
          history={emissionsHistory}
          onYearSelect={onYearSelect}
        />
      ) : (
        emissionsError && (
          <SectionLoadError titleKey="companyDetailPage.emissionsHistoryErrorTitle" />
        )
      )}
      {turnoverHistory ? (
        <TurnoverEmissionsHistory
          history={turnoverHistory}
          onYearSelect={onYearSelect}
        />
      ) : (
        turnoverError && (
          <SectionLoadError titleKey="companyDetailPage.turnoverHistoryErrorTitle" />
        )
      )}
      {scope3 ? (
        <CompanyScope3 scope3={scope3} />
      ) : (
        scope3Error && (
          <SectionLoadError titleKey="companyDetailPage.scope3ErrorTitle" />
        )
      )}
    </>
  );
}

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string; slug?: string }>();
  const location = useLocation();
  const [selectedYear, setSelectedYear] = useState<string>("latest");
  const { currentLanguage } = useLanguage();
  const sectorNames = useSectorNames();

  useEffect(() => {
    setSelectedYear("latest");
  }, [id]);

  const {
    header,
    loading: headerLoading,
    error: headerError,
  } = usePageCompanyHeader(id!);

  const availableYears = header?.availableYears ?? [];
  const yearNumber = useMemo(() => {
    if (selectedYear === "latest") return undefined;
    const year = Number(selectedYear);
    if (!Number.isFinite(year) || !availableYears.includes(year)) {
      return undefined;
    }
    return year;
  }, [selectedYear, availableYears]);

  const hasYearData = (header?.availableYears.length ?? 0) > 0;
  const detailSectionsEnabled = !!header && hasYearData;

  const {
    overview,
    loading: overviewLoading,
    error: overviewError,
  } = usePageCompanyOverview(id!, yearNumber, !!header);
  const {
    emissionsHistory,
    turnoverHistory,
    loading: historiesLoading,
    emissionsError,
    turnoverError,
  } = usePageCompanyHistories(id!, detailSectionsEnabled);
  const {
    scope3,
    loading: scope3Loading,
    error: scope3Error,
  } = usePageCompanyScope3(id!, yearNumber, detailSectionsEnabled);

  // Year changes keep previous overview/scope3 for the same company only.
  // Histories and scope 3 stay behind the loader until the first response,
  // so those sections do not appear after the rest of the page.
  const loading =
    headerLoading || overviewLoading || historiesLoading || scope3Loading;
  const error = headerError || (!overview && overviewError);

  const latestYear = useMemo(() => {
    if (availableYears.length > 0) {
      return Math.max(...availableYears);
    }
    return overview?.year ?? new Date().getFullYear();
  }, [availableYears, overview?.year]);

  const seoMeta = useMemo(() => {
    if (!header) {
      return getSeoForRoute(location.pathname, { id: id || "" });
    }
    const seoYear = overview?.year ?? latestYear;
    const sectorCode = header.sectorCode ?? overview?.sectorCode ?? null;
    const industry = industryGicsForSeo(
      sectorCode,
      getCompanySectorName(sectorCode, sectorNames),
    );
    return generateCompanySeoMeta(
      {
        name: header.name,
        industry,
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
      { latestYear: seoYear },
    );
  }, [header, overview, location.pathname, latestYear, id, sectorNames]);

  if (error) {
    return (
      <PageError
        titleKey="companyDetailPage.errorTitle"
        descriptionKey="companyDetailPage.errorDescription"
      />
    );
  }

  if (loading) return <PageLoading />;

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
      linkTo={buildComparisonLinkTo("company", getCompanyUrlSegment(header))}
      variant="company"
      name={header.name}
    />
  );

  const hasPeriods = availableYears.length > 0;

  // Only the true empty company — not a year that failed to resolve.
  if (!hasPeriods) {
    return (
      <>
        <Seo meta={seoMeta} />
        <div className="mx-auto max-w-[1400px] space-y-8 md:space-y-16">
          <CompanyOverviewNoData header={header} headerChip={comparisonChip} />
        </div>
      </>
    );
  }

  if (!overview || overview.year == null) {
    return (
      <>
        <Seo meta={seoMeta} />
        <div className="mx-auto max-w-[1400px] space-y-8 md:space-y-16">
          <CompanyOverviewNoData header={header} headerChip={comparisonChip} />
          <CompanyDetailCharts
            emissionsHistory={emissionsHistory}
            turnoverHistory={turnoverHistory}
            emissionsError={emissionsError}
            turnoverError={turnoverError}
            scope3={scope3}
            scope3Error={scope3Error}
            onYearSelect={setSelectedYear}
          />
        </div>
      </>
    );
  }

  const changeTons = overview.emissionsChangeAbsolute;

  return (
    <>
      <Seo meta={seoMeta} />
      <div className="mx-auto max-w-[1400px] space-y-8 md:space-y-16">
        <CompanyOverview
          header={header}
          overview={overview}
          headerChip={comparisonChip}
        />
        {changeTons != null &&
          Math.abs(changeTons) > 100 &&
          overview.emissionsChangeStatus != null && (
            <RelatableNumbers
              emissionsChange={Math.abs(changeTons)}
              currentLanguage={currentLanguage}
              companyName={header.name}
              emissionsChangeStatus={overview.emissionsChangeStatus}
              yearOverYearChange={overview.emissionsChangeLastTwoYears}
            />
          )}
        <CompanyDetailCharts
          emissionsHistory={emissionsHistory}
          turnoverHistory={turnoverHistory}
          emissionsError={emissionsError}
          turnoverError={turnoverError}
          scope3={scope3}
          scope3Error={scope3Error}
          onYearSelect={setSelectedYear}
        />
      </div>
    </>
  );
}
