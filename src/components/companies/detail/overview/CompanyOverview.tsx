import { Building2 } from "lucide-react";
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
import { Pen } from "lucide-react";
import {
  useSectorNames,
  SectorCode,
} from "@/hooks/companies/useCompanyFilters";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatEmissionsAbsolute,
  formatEmployeeCount,
  formatPercentChange,
} from "@/utils/localizeUnit";
import { cn } from "@/lib/utils";
import { OverviewStatistics } from "./OverviewStatistics";
import { CompanyOverviewTooltip } from "./CompanyOverviewTooltip";
import { CompanyDescription } from "./CompanyDescription";

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

  const periodYear = new Date(selectedPeriod.endDate).getFullYear();

  // Get the translated sector name using the sector code
  const sectorCode = company.industry?.industryGics?.sectorCode as
    | SectorCode
    | undefined;
  const sectorName = sectorCode
    ? sectorNames[sectorCode]
    : company.industry?.industryGics?.sv?.sectorName ||
      company.industry?.industryGics?.en?.sectorName ||
      t("companies.overview.unknownSector");

  const yearOverYearChange =
    previousPeriod && selectedPeriod.emissions?.calculatedTotalEmissions
      ? ((selectedPeriod.emissions.calculatedTotalEmissions -
          (previousPeriod.emissions?.calculatedTotalEmissions || 0)) /
          (previousPeriod.emissions?.calculatedTotalEmissions || 1)) *
        100
      : null;

  const sortedPeriods = [...company.reportingPeriods].sort(
    (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
  );

  const formattedEmployeeCount = selectedPeriod.economy?.employees?.value
    ? formatEmployeeCount(
        selectedPeriod.economy.employees.value,
        currentLanguage,
      )
    : t("companies.overview.notReported");

  return (
    <div className="bg-black-2 rounded-level-1 p-8 md:p-16">
      <div className="flex items-start justify-between mb-4 md:mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Text className="text-4xl lg:text-6xl">{company.name}</Text>
            <div className="flex flex-col h-full justify-around">
              {token && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 mt-2"
                  onClick={() => navigate("edit")}
                >
                  Edit
                  <div className="w-5 h-5 rounded-full bg-orange-5/30 text-orange-2 text-xs flex items-center justify-center">
                    <Pen />
                  </div>
                </Button>
              )}
            </div>
          </div>
          <CompanyDescription description={company.description} />
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
        <div className="hidden md:flex w-16 h-16 rounded-full bg-blue-5/30 items-center justify-center">
          <Building2 className="w-8 h-8 text-blue-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-16">
        <div>
          <Text variant="body" className="mb-2 lg:text-lg md:text-base text-sm">
            {t("companies.overview.totalEmissions")} {periodYear}
          </Text>
          <div className="flex items-baseline gap-4">
            <Text
              className={cn(
                "text-3xl md:text-4xl lg:text-6xl font-light tracking-tighter leading-none",
                selectedPeriod.emissions?.calculatedTotalEmissions === 0
                  ? "text-grey"
                  : "text-orange-2",
              )}
            >
              {!selectedPeriod.emissions ||
              selectedPeriod.emissions?.calculatedTotalEmissions === 0
                ? t("companies.overview.noData")
                : formatEmissionsAbsolute(
                    selectedPeriod.emissions.calculatedTotalEmissions,
                    currentLanguage,
                  )}
              <span className="text-sm md:text-lg lg:text-2xl ml-2 text-grey">
                {t(
                  selectedPeriod.emissions?.calculatedTotalEmissions === 0
                    ? " "
                    : "emissionsUnit",
                )}
              </span>
            </Text>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Text className="mb-2 lg:text-lg md:text-base sm:text-sm">
              {t("companies.overview.changeSinceLastYear")}
            </Text>
            <CompanyOverviewTooltip yearOverYearChange={yearOverYearChange} />
          </div>
          <Text className="text-3xl md:text-4xl lg:text-6xl font-light tracking-tighter leading-none">
            {yearOverYearChange !== null ? (
              <span
                className={
                  yearOverYearChange < 0 ? "text-green-3" : "text-pink-3"
                }
              >
                {formatPercentChange(
                  Math.ceil(yearOverYearChange) / 100,
                  currentLanguage,
                )}
              </span>
            ) : (
              <span className="text-grey">
                {t("companies.overview.noData")}
              </span>
            )}
          </Text>
        </div>
      </div>

      <OverviewStatistics
        selectedPeriod={selectedPeriod}
        currentLanguage={currentLanguage}
        formattedEmployeeCount={formattedEmployeeCount}
      />
    </div>
  );
}
