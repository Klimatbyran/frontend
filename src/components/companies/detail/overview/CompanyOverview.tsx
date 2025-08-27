import { Pen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import type { CompanyDetails, ReportingPeriod } from "@/types/company";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  useSectorNames,
  SectorCode,
} from "@/hooks/companies/useCompanyFilters";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatEmissionsAbsolute,
  formatEmployeeCount,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { cn } from "@/lib/utils";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { AiIcon } from "@/components/ui/ai-icon";
import { OverviewStatistics } from "./OverviewStatistics";
import { CompanyOverviewTooltip } from "./CompanyOverviewTooltip";
import { CompanyDescription } from "./CompanyDescription";
import { calculateRateOfChange } from "@/utils/calculations/general";
import { EmissionsAssessmentButton } from "../emissions-assessment/EmissionsAssessmentButton";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { getCompanyDescription } from "@/utils/business/company";

interface CompanyOverviewProps {
  company: CompanyDetails;
  selectedPeriod: ReportingPeriod;
  previousPeriod?: ReportingPeriod;
  onYearSelect: (year: string) => void;
  selectedYear: string;
}

export function CompanyOverview({
  company,
  selectedPeriod,
  previousPeriod,
  onYearSelect,
  selectedYear,
}: CompanyOverviewProps) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const sectorNames = useSectorNames();
  const { currentLanguage } = useLanguage();
  const { isAIGenerated, isEmissionsAIGenerated } = useVerificationStatus();

  const periodYear = new Date(selectedPeriod.endDate).getFullYear();

  // Check if any data is AI-generated
  const totalEmissionsAIGenerated = isEmissionsAIGenerated(selectedPeriod);
  const yearOverYearAIGenerated =
    isEmissionsAIGenerated(selectedPeriod) ||
    (previousPeriod && isEmissionsAIGenerated(previousPeriod));
  const turnoverAIGenerated = isAIGenerated(selectedPeriod.economy?.turnover);
  const employeesAIGenerated = isAIGenerated(selectedPeriod.economy?.employees);

  // Get the translated sector name using the sector code
  const sectorCode = company.industry?.industryGics?.sectorCode as
    | SectorCode
    | undefined;
  const sectorName = sectorCode
    ? sectorNames[sectorCode]
    : company.industry?.industryGics?.sv?.sectorName ||
      company.industry?.industryGics?.en?.sectorName ||
      t("companies.overview.unknownSector");

  // Get the translated company description
  const description = getCompanyDescription(company, currentLanguage);

  const yearOverYearChange = calculateRateOfChange(
    selectedPeriod?.emissions?.calculatedTotalEmissions,
    previousPeriod?.emissions?.calculatedTotalEmissions,
  );

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
                  const year = new Date(period.endDate)
                    .getFullYear()
                    .toString();
                  return (
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

      <div className="flex flex-col mb-6 gap-4 md:flex-row md:gap-12 md:items-start md:mb-12">
        <div className="flex-1">
          <Text
            variant="body"
            className="mb-1 md:mb-2 lg:text-lg md:text-base text-sm"
          >
            {t("companies.overview.totalEmissions")} {periodYear}
          </Text>

          <Text
            className={cn(
              "text-3xl md:text-4xl lg:text-6xl font-light tracking-tighter leading-none",
              !calculatedTotalEmissions ? "text-grey" : "text-orange-2",
            )}
          >
            {!calculatedTotalEmissions
              ? t("companies.overview.noData")
              : formatEmissionsAbsolute(
                  calculatedTotalEmissions,
                  currentLanguage,
                )}
            <span className="text-lg lg:text-2xl md:text-lg sm:text-sm ml-2 text-grey">
              {t(calculatedTotalEmissions ? " " : "emissionsUnit")}
            </span>
            {totalEmissionsAIGenerated && (
              <span className="ml-2 absolute">
                <AiIcon size="md" className="absolute top-0 " />
              </span>
            )}
          </Text>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Text className="mb-1 md:mb-2 lg:text-lg md:text-base sm:text-sm">
              {t("companies.overview.changeSinceLastYear")}
            </Text>
            <CompanyOverviewTooltip yearOverYearChange={yearOverYearChange} />
          </div>
          <Text className="text-3xl md:text-4xl lg:text-6xl font-light tracking-tighter leading-none">
            {yearOverYearChange !== null ? (
              <span
                className={
                  yearOverYearChange < 0 ? "text-orange-2" : "text-pink-3"
                }
              >
                {formatPercentChange(yearOverYearChange, currentLanguage, true)}
              </span>
            ) : (
              <span className="text-grey">
                {t("companies.overview.noData")}
              </span>
            )}
            {yearOverYearAIGenerated && (
              <span className="ml-2 absolute">
                <AiIcon size="md" className="absolute top-0" />
              </span>
            )}
          </Text>
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
