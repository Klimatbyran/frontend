import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { PageHeader } from "@/components/layout/PageHeader";
import { CompaniesOverviewSkeleton } from "@/components/companies/overview/CompaniesOverviewSkeleton";
import InsightsList from "@/components/ranked/InsightsList";
import { CompaniesTable } from "@/components/companies/overview/CompaniesTable";
import { ParisAnswerCard } from "@/components/companies/overview/ParisAnswerCard";
import { ParisExplainer } from "@/components/companies/overview/ParisExplainer";
import { IndustryChipFilter } from "@/components/companies/overview/IndustryChipFilter";
import { IndustryEmissionsPie } from "@/components/companies/overview/IndustryEmissionsPie";
import { ReportingCoverage } from "@/components/companies/overview/ReportingCoverage";
import { CompanyRegionMapSection } from "@/components/companies/CompanyRegionMapSection";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import { enrichCompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
import type { CompanyWithKPIs } from "@/types/company";
import type { SectorCode } from "@/lib/constants/sectors";
import {
  buildIndustryBreakdown,
  fastestCutters,
  furthestBehind,
  isSwedishCompany,
  summariseParis,
} from "@/hooks/companies/parisOverviewUtils";
import { useCompaniesOverviewUrlState } from "./companiesOverviewPageUtils";

function VerdictLists({ companies }: { companies: CompanyWithKPIs[] }) {
  const { t } = useTranslation();
  const doingWell = fastestCutters(companies);
  const fallingBehind = furthestBehind(companies);

  if (doingWell.length === 0 && fallingBehind.length === 0) return null;

  return (
    <div className="grid items-start gap-6 md:grid-cols-2">
      {doingWell.length > 0 && (
        <InsightsList<CompanyWithKPIs>
          title={t("companiesOverviewPage.paris.doingWellTitle")}
          entities={doingWell}
          dataPointKey="emissionsChangeFromBaseYear"
          unit="%"
          totalCount={doingWell.length}
          entityType="companies"
          nameKey="name"
          showBars
          colorItem={() => "var(--blue-3)"}
        />
      )}
      {fallingBehind.length > 0 && (
        <InsightsList<CompanyWithKPIs>
          title={t("companiesOverviewPage.paris.fallingBehindTitle")}
          entities={fallingBehind}
          dataPointKey="emissionsChangeFromBaseYear"
          unit="%"
          totalCount={fallingBehind.length}
          entityType="companies"
          nameKey="name"
          showBars
          colorItem={() => "var(--pink-3)"}
        />
      )}
    </div>
  );
}

export function CompaniesOverviewPage() {
  const { t } = useTranslation();
  const { companies, companiesLoading, companiesError } = useCompanies();
  const sectorNames = useSectorNames();

  // Sweden-only page: scope once, so nothing downstream reasons about country.
  const swedishCompanies = useMemo<CompanyWithKPIs[]>(
    () =>
      (companies ?? [])
        .filter(isSwedishCompany)
        .map((company) => enrichCompanyWithKPIs(company)),
    [companies],
  );

  const availableSectors = useMemo(
    () =>
      Array.from(
        new Set(
          swedishCompanies
            .map((company) => company.industry?.industryGics?.sectorCode)
            .filter((code): code is string => Boolean(code)),
        ),
      ).sort(),
    [swedishCompanies],
  );

  const urlState = useCompaniesOverviewUrlState(availableSectors);
  const selectedSector = urlState.getSectorFromURL() as SectorCode | null;

  // The industry breakdown ignores the industry filter so it stays usable as
  // a selector after one has been picked.
  const industryRows = useMemo(
    () => buildIndustryBreakdown(swedishCompanies),
    [swedishCompanies],
  );

  const inView = useMemo(
    () =>
      selectedSector
        ? swedishCompanies.filter(
            (company) =>
              company.industry?.industryGics?.sectorCode === selectedSector,
          )
        : swedishCompanies,
    [swedishCompanies, selectedSector],
  );

  const summary = useMemo(() => summariseParis(inView), [inView]);

  if (companiesLoading) {
    return <CompaniesOverviewSkeleton />;
  }

  if (companiesError) {
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

  return (
    <div className="space-y-8 md:space-y-10">
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
            code: row.code,
            companyCount: row.companyCount,
          }))}
          selected={selectedSector}
          totalCount={swedishCompanies.length}
          onSelect={(code) => urlState.setSectorInURL(code)}
        />

        <ParisAnswerCard
          key={selectedSector ?? "all"}
          summary={summary}
          industryLabel={selectedSector ? sectorNames[selectedSector] : null}
        />
      </div>

      <VerdictLists companies={inView} />

      <ReportingCoverage companies={inView} />

      <IndustryEmissionsPie rows={industryRows} selected={selectedSector} />

      <CompaniesTable companies={inView} />

      <CompanyRegionMapSection companies={inView} />
    </div>
  );
}
