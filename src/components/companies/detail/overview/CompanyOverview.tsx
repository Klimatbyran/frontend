import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { PageCompanyHeader, PageCompanyOverview } from "@/types/pages";
import {
  useIndustryGroupNames,
  useSectorNames,
} from "@/hooks/companies/useCompanySectors";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmployeeCount } from "@/utils/formatting/localization";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { getCompanyDescription } from "@/utils/business/company";
import { CompanyDescription } from "./CompanyDescription";
import { OverviewStatistics } from "./OverviewStatistics";
import { CompanyDetailHeader } from "../CompanyDetailHeader";
import {
  CompanyOverviewActions,
  CompanyOverviewMainStats,
} from "./CompanyOverviewParts";
import { periodsFromAvailableYears } from "@/utils/pages/companyDetailAdapters";
import type { IndustryGroupCode } from "@/lib/constants/sectors";

interface CompanyOverviewProps {
  header: PageCompanyHeader;
  overview: PageCompanyOverview;
  headerChip?: ReactNode;
}

export function CompanyOverview({
  header,
  overview,
  headerChip,
}: CompanyOverviewProps) {
  const { t } = useTranslation();
  const sectorNames = useSectorNames();
  const industryGroupNames = useIndustryGroupNames();
  const { currentLanguage } = useLanguage();

  const sectorCode = overview.sectorCode ?? header.sectorCode ?? undefined;
  const industryGroupCode =
    overview.industryGroupCode ?? header.industryGroupCode;
  const sectorName = sectorCode
    ? (sectorNames[sectorCode] ?? sectorCode)
    : t("companies.overview.notReported");
  const industryGroupName = industryGroupCode
    ? (industryGroupNames[industryGroupCode as IndustryGroupCode] ??
      industryGroupCode)
    : t("companies.overview.notReported");
  const description = getCompanyDescription(header, currentLanguage);
  const sortedPeriods = periodsFromAvailableYears(header.availableYears);
  const formattedEmployeeCount =
    overview.employees != null
      ? formatEmployeeCount(overview.employees, currentLanguage)
      : t("companies.overview.notReported");
  const periodYear = overview.year?.toString() ?? "";

  return (
    <SectionWithHelp
      helpItems={[
        "onTrackForParis",
        "totalEmissions",
        "co2units",
        "companySectors",
        "companyMissingData",
        "yearOverYearChange",
      ]}
    >
      <div className="mb-4 space-y-4 md:mb-12">
        <CompanyDetailHeader
          name={header.name}
          logoUrl={header.logoUrl}
          headerChip={headerChip}
        />
        <CompanyOverviewActions
          companyId={header.id}
          sortedPeriods={sortedPeriods}
        />
        <CompanyDescription description={description} />
      </div>

      <CompanyOverviewMainStats
        periodYear={periodYear}
        sectorCode={sectorCode}
        calculatedTotalEmissions={overview.totalEmissions}
        currentLanguage={currentLanguage}
        totalEmissionsAIGenerated={overview.emissionsIsAIGenerated}
        yearOverYearChange={overview.emissionsChangeLastTwoYears}
        yearOverYearAIGenerated={overview.changeRateIsAIGenerated}
        meetsParis={overview.meetsParis}
      />

      <OverviewStatistics
        currentLanguage={currentLanguage}
        sectorName={sectorName}
        industryGroupName={industryGroupName}
        formattedEmployeeCount={formattedEmployeeCount}
        turnover={overview.turnover}
        turnoverCurrency={overview.turnoverCurrency}
        turnoverAIGenerated={overview.turnoverIsAIGenerated}
        employeesAIGenerated={overview.employeesIsAIGenerated}
        reportURL={overview.reportURL}
        className="lg:flex lg:justify-between"
      />
    </SectionWithHelp>
  );
}
