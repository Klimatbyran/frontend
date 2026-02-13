import { Pen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import type { CompanyDetails, ReportingPeriod } from "@/types/company";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import { getCompanySectorName } from "@/utils/data/industryGrouping";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatEmissionsAbsolute,
  formatEmployeeCount,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { getCompanyDescription } from "@/utils/business/company";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { calculateMeetsParis } from "@/lib/calculations/trends/meetsParis";
import { EmissionsAssessmentButton } from "../emissions-assessment/EmissionsAssessmentButton";
import { OverviewStat } from "./OverviewStat";
import { FinancialsTooltip } from "./FinancialsTooltip";
import { CompanyDescription } from "./CompanyDescription";
import { CompanyOverviewTooltip } from "./CompanyOverviewTooltip";
import { OverviewStatistics } from "./OverviewStatistics";
import { yearFromIsoDate } from "@/utils/date";

interface CompanyOverviewProps {
  company: CompanyDetails;
  selectedPeriod: ReportingPeriod;
  previousPeriod?: ReportingPeriod;
  onYearSelect: (year: string) => void;
  selectedYear: string;
  yearOverYearChange: number | null;
}

export function CompanyOverview({
  company,
  selectedPeriod,
  previousPeriod,
  onYearSelect,
  selectedYear,
  yearOverYearChange,
}: CompanyOverviewProps) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const sectorNames = useSectorNames();
  const { currentLanguage } = useLanguage();
  const { isAIGenerated, isEmissionsAIGenerated } = useVerificationStatus();

  const periodYear = yearFromIsoDate(selectedPeriod.endDate);

  // Check if any data is AI-generated
  const totalEmissionsAIGenerated = isEmissionsAIGenerated(selectedPeriod);
  const yearOverYearAIGenerated =
    isEmissionsAIGenerated(selectedPeriod) ||
    (previousPeriod && isEmissionsAIGenerated(previousPeriod));
  const turnoverAIGenerated = isAIGenerated(selectedPeriod.economy?.turnover);
  const employeesAIGenerated = isAIGenerated(selectedPeriod.economy?.employees);

  // Get the translated sector name using the sector code
  const sectorCode = company.industry?.industryGics?.sectorCode;
  const sectorName = getCompanySectorName(company, sectorNames);

  // Get the translated company description
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

  // Calculate trend analysis and meets Paris status
  const trendAnalysis = calculateTrendline(company);
  const meetsParis = trendAnalysis
    ? calculateMeetsParis(company, trendAnalysis)
    : null; // null = unknown

  return (
    <SectionWithHelp
      helpItems={[
        "totalEmissions",
        "co2units",
        "companySectors",
        "companyMissingData",
        "yearOverYearChange",
        // "onTrackForParis",
        // "historicVsParis",
      ]}
    >
      <div className="flex items-start justify-between mb-4 md:mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Text className="text-4xl lg:text-6xl">{company.name}</Text>
            {token && (
              <div className="flex flex-row gap-2 mt-2 md:mt-0 md:ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => navigate("edit")}
                >
                  Edit
                  <div className="w-5 h-5 rounded-full bg-orange-5/30 text-orange-2 text-xs flex items-center justify-center">
                    <Pen />
                  </div>
                </Button>
                <EmissionsAssessmentButton
                  wikidataId={company.wikidataId}
                  sortedPeriods={sortedPeriods}
                />
              </div>
            )}
          </div>
          <CompanyDescription description={description} />
          <div className="flex flex-row items-center gap-2 my-4">
            <Text
              variant="body"
              className="text-grey text-sm md:text-base lg:text-lg"
            >
              {t("companies.overview.sector")}:
            </Text>
            <Text variant="body" className="text-sm md:text-base lg:text-lg">
              {sectorName}
            </Text>
          </div>
          <div className="my-4 w-full max-w-[180px]">
            <Select value={selectedYear} onValueChange={onYearSelect}>
              <SelectTrigger className="w-full bg-black-1 text-white px-3 py-2 rounded-md">
                <SelectValue placeholder={t("companies.overview.selectYear")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">
                  {t("companies.overview.latestYear")}
                </SelectItem>
                {sortedPeriods.map((period) => {
                  const year = yearFromIsoDate(period.endDate);
                  return period.emissions?.calculatedTotalEmissions === null ||
                    period.emissions?.calculatedTotalEmissions === 0 ? null : (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mb-2 md:mb-4 space-y-4 md:space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:gap-16 md:items-center">
          <OverviewStat
            label={
              <div className="flex items-center gap-2">
                <Text
                  variant="body"
                  className="lg:text-lg md:text-base text-sm"
                >
                  {t("companies.overview.totalEmissions")} {periodYear}
                </Text>
                {sectorCode === "40" && <FinancialsTooltip />}
              </div>
            }
            value={
              !calculatedTotalEmissions
                ? t("companies.overview.noData")
                : formatEmissionsAbsolute(
                    calculatedTotalEmissions,
                    currentLanguage,
                  )
            }
            valueClassName={
              !calculatedTotalEmissions ? "text-grey" : "text-orange-2"
            }
            unit={calculatedTotalEmissions ? t("emissionsUnit") : undefined}
            showAiIcon={totalEmissionsAIGenerated}
          />

          <OverviewStat
            label={
              <div className="flex items-center gap-2">
                <Text className="mb-1 md:mb-2 lg:text-lg md:text-base sm:text-sm">
                  {t("companies.overview.changeSinceLastYear")}
                </Text>
                <CompanyOverviewTooltip
                  yearOverYearChange={yearOverYearChange}
                />
              </div>
            }
            value={
              yearOverYearChange !== null ? (
                <span
                  className={
                    yearOverYearChange < 0 ? "text-orange-2" : "text-pink-3"
                  }
                >
                  {formatPercentChange(
                    yearOverYearChange,
                    currentLanguage,
                    false,
                  )}
                </span>
              ) : (
                <span className="text-grey">
                  {t("companies.overview.noData")}
                </span>
              )
            }
            showAiIcon={yearOverYearAIGenerated}
          />

          <OverviewStat
            label={t("companies.overview.onTrackToMeetParis")}
            value={
              meetsParis === true
                ? t("yes")
                : meetsParis === false
                  ? t("no")
                  : t("unknown")
            }
            valueClassName={
              meetsParis === true
                ? "text-green-3"
                : meetsParis === false
                  ? "text-pink-3"
                  : "text-grey"
            }
          />
        </div>
      </div>

      <OverviewStatistics
        selectedPeriod={selectedPeriod}
        currentLanguage={currentLanguage}
        formattedEmployeeCount={formattedEmployeeCount}
        turnoverAIGenerated={turnoverAIGenerated}
        employeesAIGenerated={employeesAIGenerated}
        className="mt-3 md:mt-0"
      />
    </SectionWithHelp>
  );
}
