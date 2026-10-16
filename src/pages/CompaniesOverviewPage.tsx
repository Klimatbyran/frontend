import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import {
  usePageCompaniesOverviewChrome,
  usePageCompaniesOverviewSummary,
} from "@/hooks/pages/usePageCompaniesOverview";
import { sectorBaseColor } from "@/lib/constants/companyColors";
import { OverviewPageError } from "@/components/pageStates/Error";
import { OverviewPageRoot } from "@/components/layout/OverviewPageRoot";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  CompaniesOverviewSkeleton,
  ParisAnswerCardSkeleton,
  ReportingCoverageSkeleton,
  VerdictListsSkeleton,
} from "@/components/companies/overview/CompaniesOverviewSkeleton";
import InsightsList from "@/components/ranked/InsightsList";
import { CompaniesTable } from "@/components/companies/overview/CompaniesTable";
import { ParisAnswerCard } from "@/components/companies/overview/ParisAnswerCard";
import { ParisExplainer } from "@/components/companies/overview/ParisExplainer";
import { IndustryChipFilter } from "@/components/companies/overview/IndustryChipFilter";
import { IndustryEmissionsPie } from "@/components/companies/overview/IndustryEmissionsPie";
import { ReportingCoverage } from "@/components/companies/overview/ReportingCoverage";
import { useSectorTitles } from "@/hooks/companies/useCompanySectors";
import { OverviewScrollProgress } from "@/components/layout/OverviewScrollProgress";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import type { SectorCode } from "@/lib/constants/sectors";
import type { PageOverviewVerdictCompany } from "@/types/pages";
import { useCompaniesOverviewUrlState } from "./companiesOverviewPageUtils";

function ParisSummaryPending() {
  const { t } = useTranslation();

  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">
        {t("companiesOverviewPage.paris.loading")}
      </span>
      <div aria-hidden="true">
        <ParisAnswerCardSkeleton />
      </div>
    </div>
  );
}

function VerdictLists({
  doingWell,
  fallingBehind,
}: {
  doingWell: PageOverviewVerdictCompany[];
  fallingBehind: PageOverviewVerdictCompany[];
}) {
  const { t } = useTranslation();

  if (doingWell.length === 0 && fallingBehind.length === 0) return null;

  return (
    <div className="grid min-w-0 grid-cols-1 items-start gap-6 md:grid-cols-2">
      {doingWell.length > 0 && (
        <ScrollReveal>
          <InsightsList<PageOverviewVerdictCompany>
            title={t("companiesOverviewPage.paris.doingWellTitle")}
            entities={doingWell}
            dataPointKey="emissionsChangeFromBaseYear"
            unit="%"
            totalCount={doingWell.length}
            entityType="companies"
            nameKey="name"
            showBars
            deferAnimationUntilVisible
            colorItem={() => "var(--blue-3)"}
          />
        </ScrollReveal>
      )}
      {fallingBehind.length > 0 && (
        <ScrollReveal delay={0.08}>
          <InsightsList<PageOverviewVerdictCompany>
            title={t("companiesOverviewPage.paris.fallingBehindTitle")}
            entities={fallingBehind}
            dataPointKey="emissionsChangeFromBaseYear"
            unit="%"
            totalCount={fallingBehind.length}
            entityType="companies"
            nameKey="name"
            showBars
            deferAnimationUntilVisible
            colorItem={() => "var(--pink-3)"}
          />
        </ScrollReveal>
      )}
    </div>
  );
}

export function CompaniesOverviewPage() {
  const { t } = useTranslation();
  const sectorTitles = useSectorTitles();
  const chrome = usePageCompaniesOverviewChrome();

  const availableSectors = useMemo(
    () =>
      chrome.summary?.industryFilters
        .filter((row) => sectorBaseColor(row.code))
        .map((row) => row.code) ?? [],
    [chrome.summary],
  );

  const location = useLocation();
  const sectorParam = useMemo(
    () => new URLSearchParams(location.search).get("sector"),
    [location.search],
  );
  /** Avoid fetching "all" before chrome validates a sector from the URL. */
  const sectorResolutionPending = Boolean(sectorParam && chrome.loading);

  const urlState = useCompaniesOverviewUrlState(availableSectors);
  const selectedSector = urlState.getSectorFromURL() as SectorCode | null;
  const overviewDataEnabled = !sectorResolutionPending;

  const { summary, error: summaryError } = usePageCompaniesOverviewSummary({
    sector: selectedSector,
    enabled: overviewDataEnabled,
  });

  const error = chrome.error || summaryError;

  if (!chrome.summary && !error) {
    return <CompaniesOverviewSkeleton />;
  }

  if (error || !chrome.summary) {
    return (
      <OverviewPageError
        titleKey="companiesOverviewPage.errorTitle"
        descriptionKey="companiesOverviewPage.errorDescription"
      />
    );
  }

  const industryRows = chrome.summary.industryFilters.filter((row) =>
    sectorBaseColor(row.code),
  );

  return (
    <OverviewPageRoot leadIn={<OverviewScrollProgress />}>
      {/* A step tighter than the page stack, so the chips sit closer to the cards. */}
      <div className="space-y-5 md:space-y-7">
        <div className="space-y-5">
          {/* Layout already applies `container mx-auto px-4`; PageHeader's own
              max-width and padding would inset the title past the cards. */}
          <PageHeader
            className="mx-0 mb-0 max-w-none p-0 md:mb-0"
            title={t("companiesOverviewPage.paris.title")}
            description={t("companiesOverviewPage.paris.lead")}
          />
          <ParisExplainer />
        </div>

        <IndustryChipFilter
          options={industryRows.map((row) => ({
            code: row.code as SectorCode,
            companyCount: row.companyCount,
          }))}
          selected={selectedSector}
          totalCount={chrome.summary.companyCount}
          onSelect={(code) => urlState.setSectorInURL(code)}
        />

        {summary ? (
          <ParisAnswerCard
            key={selectedSector ?? "all"}
            summary={summary.paris}
            parisDots={summary.parisDots}
            industryLabel={selectedSector ? sectorTitles[selectedSector] : null}
          />
        ) : (
          <ParisSummaryPending />
        )}
      </div>

      {summary ? (
        <VerdictLists
          doingWell={summary.doingWell}
          fallingBehind={summary.fallingBehind}
        />
      ) : (
        <VerdictListsSkeleton />
      )}

      <IndustryEmissionsPie rows={industryRows} selected={selectedSector} />

      {summary ? (
        <ReportingCoverage reporting={summary.reporting} />
      ) : (
        <ReportingCoverageSkeleton />
      )}

      <ScrollReveal>
        <CompaniesTable sector={selectedSector} enabled={overviewDataEnabled} />
      </ScrollReveal>
    </OverviewPageRoot>
  );
}
