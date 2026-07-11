import { t } from "i18next";
import { ArrowUpRight } from "lucide-react";
import { AiIcon } from "@/components/ui/ai-icon";
import { Text } from "@/components/ui/text";
import {
  SupplementalDataField,
  SupplementalDataPanel,
} from "@/components/detail/SupplementalDataPanel";
import { ReportingPeriod } from "@/types/company";
import { formatTurnoverValue } from "@/utils/formatting/turnoverFormatting";

interface OverviewStatisticProps {
  selectedPeriod: ReportingPeriod;
  currentLanguage: "sv" | "en";
  sectorName: string;
  formattedEmployeeCount: string;
  turnoverAIGenerated: boolean;
  employeesAIGenerated: boolean;
  className?: string;
}

export function OverviewStatistics({
  selectedPeriod,
  currentLanguage,
  sectorName,
  formattedEmployeeCount,
  turnoverAIGenerated,
  employeesAIGenerated,
  className,
}: OverviewStatisticProps) {
  const formattedTurnover = selectedPeriod.economy?.turnover?.value
    ? formatTurnoverValue(
        selectedPeriod.economy.turnover.value,
        currentLanguage,
        t,
        selectedPeriod.economy.turnover.currency,
      )
    : t("companies.overview.notReported");

  return (
    <SupplementalDataPanel className={className}>
      <SupplementalDataField label={t("companies.overview.sector")}>
        <Text>{sectorName}</Text>
      </SupplementalDataField>

      <SupplementalDataField label={t("companies.overview.turnover")}>
        <span className="flex items-center gap-2">
          <Text>{formattedTurnover}</Text>
          {turnoverAIGenerated && <AiIcon size="md" />}
        </span>
      </SupplementalDataField>

      <SupplementalDataField label={t("companies.overview.employees")}>
        <span className="flex items-center gap-2">
          <Text>{formattedEmployeeCount}</Text>
          {employeesAIGenerated && <AiIcon size="md" />}
        </span>
      </SupplementalDataField>

      {selectedPeriod?.reportURL && (
        <div className="flex items-end @lg:self-end">
          <a
            href={selectedPeriod.reportURL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-2 hover:text-blue-1 transition-colors"
          >
            {t("companies.overview.readAnnualReport")}
            <ArrowUpRight className="w-4 h-4 sm:w-3 sm:h-3" />
          </a>
        </div>
      )}
    </SupplementalDataPanel>
  );
}
