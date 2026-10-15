import { t } from "i18next";
import { ArrowUpRight } from "lucide-react";
import { AiIcon } from "@/components/ui/ai-icon";
import { Text } from "@/components/ui/text";
import {
  SupplementalDataField,
  SupplementalDataPanel,
} from "@/components/detail/SupplementalDataPanel";
import { formatTurnoverValue } from "@/utils/formatting/turnoverFormatting";

interface OverviewStatisticProps {
  currentLanguage: "sv" | "en";
  sectorName: string;
  industryGroupName: string;
  formattedEmployeeCount: string;
  turnover: number | null;
  turnoverCurrency: string | null;
  turnoverAIGenerated: boolean;
  employeesAIGenerated: boolean;
  reportURL: string | null;
  className?: string;
}

export function OverviewStatistics({
  currentLanguage,
  sectorName,
  industryGroupName,
  formattedEmployeeCount,
  turnover,
  turnoverCurrency,
  turnoverAIGenerated,
  employeesAIGenerated,
  reportURL,
  className,
}: OverviewStatisticProps) {
  const formattedTurnover =
    turnover != null
      ? formatTurnoverValue(
          turnover,
          currentLanguage,
          t,
          turnoverCurrency ?? undefined,
        )
      : t("companies.overview.notReported");

  return (
    <SupplementalDataPanel className={className}>
      <SupplementalDataField label={t("companies.overview.sector")}>
        <Text>{sectorName}</Text>
      </SupplementalDataField>

      <SupplementalDataField label={t("companies.overview.industryGroup")}>
        <Text>{industryGroupName}</Text>
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

      {reportURL && (
        <div>
          <div className="md:mb-2">
            <a
              href={reportURL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-2 hover:text-blue-1 transition-colors"
            >
              {t("companies.overview.readAnnualReport")}
              <ArrowUpRight className="w-4 h-4 sm:w-3 sm:h-3" />
            </a>
          </div>
        </div>
      )}
    </SupplementalDataPanel>
  );
}
