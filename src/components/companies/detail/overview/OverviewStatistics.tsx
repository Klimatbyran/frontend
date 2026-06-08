import { t } from "i18next";
import { ArrowUpRight } from "lucide-react";
import { AiIcon } from "@/components/ui/ai-icon";
import { Text } from "@/components/ui/text";
import {
  DetailMetadataField,
  DetailMetadataPanel,
} from "@/components/detail/DetailMetadataPanel";
import { ReportingPeriod } from "@/types/company";
import { localizeUnit } from "@/utils/formatting/localization";

interface OverviewStatisticProps {
  selectedPeriod: ReportingPeriod;
  currentLanguage: "sv" | "en";
  formattedEmployeeCount: string;
  turnoverAIGenerated: boolean;
  employeesAIGenerated: boolean;
  className?: string;
}

export function OverviewStatistics({
  selectedPeriod,
  currentLanguage,
  formattedEmployeeCount,
  turnoverAIGenerated,
  employeesAIGenerated,
  className,
}: OverviewStatisticProps) {
  const formattedTurnover = selectedPeriod.economy?.turnover?.value
    ? (() => {
        const { value } = selectedPeriod.economy.turnover;
        const useMillions = value < 1e9;
        return `${localizeUnit(
          value / (useMillions ? 1e6 : 1e9),
          currentLanguage,
        )} ${t(useMillions ? "companies.overview.million" : "companies.overview.billion")} ${selectedPeriod.economy.turnover.currency}`;
      })()
    : t("companies.overview.notReported");

  return (
    <DetailMetadataPanel className={className}>
      <DetailMetadataField label={t("companies.overview.turnover")}>
        <span className="flex items-center gap-2">
          <Text>{formattedTurnover}</Text>
          {turnoverAIGenerated && <AiIcon size="md" />}
        </span>
      </DetailMetadataField>

      <DetailMetadataField label={t("companies.overview.employees")}>
        <span className="flex items-center gap-2">
          <Text>{formattedEmployeeCount}</Text>
          {employeesAIGenerated && <AiIcon size="md" />}
        </span>
      </DetailMetadataField>

      {selectedPeriod?.reportURL && (
        <div className="flex items-end self-start">
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
    </DetailMetadataPanel>
  );
}
