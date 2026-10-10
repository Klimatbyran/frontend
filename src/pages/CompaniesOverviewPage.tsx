import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  usePageCompaniesOverviewChrome,
  usePageCompaniesOverviewList,
  usePageCompaniesOverviewSummary,
} from "@/hooks/pages/usePageCompaniesOverview";
import { PageHeader } from "@/components/layout/PageHeader";
import { CompaniesOverviewSkeleton } from "@/components/companies/overview/CompaniesOverviewSkeleton";
import InsightsList from "@/components/ranked/InsightsList";
import { CompaniesTable } from "@/components/companies/overview/CompaniesTable";
import { ParisAnswerCard } from "@/components/companies/overview/ParisAnswerCard";
import { ParisExplainer } from "@/components/companies/overview/ParisExplainer";
import { IndustryChipFilter } from "@/components/companies/overview/IndustryChipFilter";
import { IndustryEmissionsPie } from "@/components/companies/overview/IndustryEmissionsPie";
import { ReportingCoverage } from "@/components/companies/overview/ReportingCoverage";
import { useSectorTitles } from "@/hooks/companies/useCompanySectors";
import { ParisScrollProgress } from "@/components/companies/overview/ParisScrollProgress";
import { ScrollReveal } from "@/components/companies/overview/ScrollReveal";
import type { SectorCode } from "@/lib/constants/sectors";
import type { PageOverviewVerdictCompany } from "@/types/pages";
import { useCompaniesOverviewUrlState } from "./companiesOverviewPageUtils";

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
    () => chrome.summary?.industryFilters.map((row) => row.code) ?? [],
    [chrome.summary],
  );

  const urlState = useCompaniesOverviewUrlState(availableSectors);
  const selectedSector = urlState.getSectorFromURL() as SectorCode | null;

  const {
    companies,
    loading: listLoading,
    error: listError,
  } = usePageCompaniesOverviewList({ sector: selectedSector });
  const {
    summary,
    loading: summaryLoading,
    error: summaryError,
  } = usePageCompaniesOverviewSummary({ sector: selectedSector });

  const loading = chrome.loading || listLoading || summaryLoading;
  const error = chrome.error || listError || summaryError;

  if (loading) {
    return <CompaniesOverviewSkeleton />;
  }

  if (error || !chrome.summary || !summary) {
    return (
      <div className="py-24 text-center">
        <h3 className="mb-4 text-xl text-red-500">
          {t("companiesOverviewPage.errorTitle")}
        </h3>
        <p className="text-grey">
          {t("companiesOverviewPage.errorDescription")}
        </p>
      </div>
    );
  }

  const industryRows = chrome.summary.industryFilters;

  return (
    <div className="space-y-8 md:space-y-10">
      <ParisScrollProgress />
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

        <ParisAnswerCard
          key={selectedSector ?? "all"}
          summary={summary.paris}
          parisDots={summary.parisDots}
          industryLabel={selectedSector ? sectorTitles[selectedSector] : null}
        />
      </div>

      <VerdictLists
        doingWell={summary.doingWell}
        fallingBehind={summary.fallingBehind}
      />

      <IndustryEmissionsPie
        rows={industryRows.map((row) => ({
          code: row.code as SectorCode,
          companyCount: row.companyCount,
          emissions: row.emissions,
        }))}
        selected={selectedSector}
      />

      <ReportingCoverage reporting={summary.reporting} />

      <ScrollReveal>
        <CompaniesTable companies={companies} />
      </ScrollReveal>
    </div>
  );
}
