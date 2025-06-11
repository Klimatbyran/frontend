import { Building2, Pen, AlertTriangle } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
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
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { AiIcon } from "@/components/ui/ai-icon";
import { OverviewStatistics } from "./OverviewStatistics";
import { CompanyOverviewTooltip } from "./CompanyOverviewTooltip";
import { CompanyDescription } from "./CompanyDescription";
import { calculateRateOfChange } from "@/lib/calculations/general";
import { ProgressiveDataGuide } from "@/data-guide/ProgressiveDataGuide";
import { EmissionsAssessmentDialog } from "../assessment/EmissionsAssessmentDialog";
import { YearSelectionModal } from "../assessment/YearSelectionModal";

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
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showYearSelectionModal, setShowYearSelectionModal] = useState(false);
  const [assessment, setAssessment] = useState<any>(null);
  const [isLoadingAssessment, setIsLoadingAssessment] = useState(false);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const sectorNames = useSectorNames();
  const { currentLanguage } = useLanguage();
  const { isAIGenerated, isEmissionsAIGenerated } = useVerificationStatus();
  const [assessmentError, setAssessmentError] = useState<string | null>(null);

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

  const handleAssessEmissions = async () => {
    setIsLoadingAssessment(true);
    setAssessmentError(null);
    try {
      const response = await fetch('/api/emissions-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          wikidataId: company.wikidataId,
          years: selectedYears
        }),
      }); 
      if (!response.ok) {
        const errorData = await response.json();
        if (
          response.status === 400 &&
          errorData.message === 'No reporting periods found for the specified years'
        ) {
          setAssessmentError('No reporting periods found for the selected years. Please choose different years.');
          setShowYearSelectionModal(true);
          return;
        } else {
          throw new Error(errorData.message || 'Failed to assess emissions');
        }
      }
      const data = await response.json();
      setAssessment(data.assessment);
      setShowAssessmentModal(true);
    } catch (error: any) {
      setAssessmentError(error.message || 'Failed to assess emissions');
    } finally {
      setIsLoadingAssessment(false);
    }
  };

  const handleYearSelection = (year: string) => {
    setSelectedYears(prev => {
      if (prev.includes(year)) {
        return prev.filter(y => y !== year);
      }
      return [...prev, year];
    });
  };

  return (
    <div className="bg-black-2 rounded-level-1 p-8 md:p-16">
      <div className="flex flex-col md:flex-row justify-between items-start mb-4 md:mb-12">
        <div className="flex-1 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:gap-4">
            <Text className="text-4xl lg:text-6xl">{company.name}</Text>
            {token && (
              <div className="flex flex-row gap-2 mt-2 md:mt-0 md:ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => navigate("edit")}
                  disabled={isLoadingAssessment}
                >
                  Edit
                  <div className="w-5 h-5 rounded-full bg-orange-5/30 text-orange-2 text-xs flex items-center justify-center">
                    <Pen />
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setAssessmentError(null);
                    setSelectedYears([]);
                    setShowYearSelectionModal(true);
                  }}
                  disabled={isLoadingAssessment}
                >
                  {isLoadingAssessment ? "Assessing..." : "Assess emissions"}
                  <div className="w-5 h-5 rounded-full bg-blue-5/30 text-blue-2 text-xs flex items-center justify-center">
                    <AlertTriangle />
                  </div>
                </Button>
              </div>
            )}
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
      </div>

      <div className="flex flex-col mb-6 gap-4 md:flex-row md:gap-12 md:items-start md:mb-12">
        <div className="flex-1">
          <Text
            variant="body"
            className="mb-1 md:mb-2 lg:text-lg md:text-base text-sm"
          >
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
              <span className="text-lg lg:text-2xl md:text-lg sm:text-sm ml-2 text-grey">
                {t(
                  selectedPeriod.emissions?.calculatedTotalEmissions === 0
                    ? " "
                    : "emissionsUnit",
                )}
              </span>
            </Text>
            {totalEmissionsAIGenerated && (
              <span className="ml-2">
                <AiIcon size="md" />
              </span>
            )}
          </div>
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
              <span className="ml-2">
                <AiIcon size="md" />
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

      <ProgressiveDataGuide
        items={[
          "totalEmissions",
          "co2units",
          "companySectors",
          "companyMissingData",
          "yearOverYearChange",
        ]}
      />

      <YearSelectionModal
        isOpen={showYearSelectionModal}
        onOpenChange={setShowYearSelectionModal}
        selectedYears={selectedYears}
        onYearSelection={handleYearSelection}
        onAssess={handleAssessEmissions}
        sortedPeriods={sortedPeriods}
        assessmentError={assessmentError}
      />

      <EmissionsAssessmentDialog
        isOpen={showAssessmentModal}
        onOpenChange={setShowAssessmentModal}
        assessment={assessment}
      />
    </div>
  );
}
