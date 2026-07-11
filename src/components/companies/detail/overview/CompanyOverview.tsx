import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { CompanyDetails, ReportingPeriod } from "@/types/company";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import { getCompanySectorName } from "@/utils/data/industryGrouping";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmployeeCount } from "@/utils/formatting/localization";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { getCompanyDescription } from "@/utils/business/company";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { calculateMeetsParis } from "@/lib/calculations/trends/meetsParis";
import { CompanyDescription } from "./CompanyDescription";
import { OverviewStatistics } from "./OverviewStatistics";
import { yearFromIsoDate } from "@/utils/date";
import { CompanyDetailHeader } from "../CompanyDetailHeader";
import {
  CompanyOverviewActions,
  CompanyOverviewMainStats,
} from "./CompanyOverviewParts";

interface CompanyOverviewProps {
  company: CompanyDetails;
  selectedPeriod: ReportingPeriod;
  previousPeriod?: ReportingPeriod;
  yearOverYearChange: number | null;
  headerChip?: ReactNode;
}

export function CompanyOverview({
  company,
  selectedPeriod,
  previousPeriod,
  yearOverYearChange,
  headerChip,
}: CompanyOverviewProps) {
  const { t } = useTranslation();
  const sectorNames = useSectorNames();
  const { currentLanguage } = useLanguage();
  const { isAIGenerated, isEmissionsAIGenerated } = useVerificationStatus();

  const periodYear = yearFromIsoDate(selectedPeriod.endDate);
  const totalEmissionsAIGenerated = isEmissionsAIGenerated(selectedPeriod);
  const yearOverYearAIGenerated =
    isEmissionsAIGenerated(selectedPeriod) ||
    (previousPeriod && isEmissionsAIGenerated(previousPeriod));
  const turnoverAIGenerated = isAIGenerated(selectedPeriod.economy?.turnover);
  const employeesAIGenerated = isAIGenerated(selectedPeriod.economy?.employees);
  const sectorCode = company.industry?.industryGics?.sectorCode;
  const sectorName = getCompanySectorName(company, sectorNames);
  const description = getCompanyDescription(company, currentLanguage);
  const sortedPeriods = [...company.reportingPeriods].sort(
    (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
  );
  const formattedEmployeeCount = selectedPeriod.economy?.employees?.value
    ? formatEmployeeCount(
        selectedPeriod.economy.employees.value,
        currentLanguage,
      )
    : t("companies.overview.notReported");
  const calculatedTotalEmissions =
    selectedPeriod.emissions?.calculatedTotalEmissions || null;
  const trendAnalysis = calculateTrendline(company);
  const meetsParis = trendAnalysis
    ? calculateMeetsParis(company, trendAnalysis)
    : null;

  return (
    <SectionWithHelp
      helpItems={[
        "totalEmissions",
        "co2units",
        "companySectors",
        "companyMissingData",
        "yearOverYearChange",
      ]}
    >
      <div className="mb-4 space-y-4 md:mb-12">
        <CompanyDetailHeader
          name={company.name}
          logoUrl={company.logoUrl}
          headerChip={headerChip}
        />
        <CompanyOverviewActions
          companyId={company.id}
          sortedPeriods={sortedPeriods}
        />
        <CompanyDescription description={description} />
      </div>

      <CompanyOverviewMainStats
        periodYear={periodYear}
        sectorCode={sectorCode}
        calculatedTotalEmissions={calculatedTotalEmissions}
        currentLanguage={currentLanguage}
        totalEmissionsAIGenerated={totalEmissionsAIGenerated}
        yearOverYearChange={yearOverYearChange}
        yearOverYearAIGenerated={!!yearOverYearAIGenerated}
        meetsParis={meetsParis}
      />

      <OverviewStatistics
        selectedPeriod={selectedPeriod}
        currentLanguage={currentLanguage}
        sectorName={sectorName}
        formattedEmployeeCount={formattedEmployeeCount}
        turnoverAIGenerated={turnoverAIGenerated}
        employeesAIGenerated={employeesAIGenerated}
        className="mt-3 md:mt-0"
      />
    </SectionWithHelp>
  );
}
