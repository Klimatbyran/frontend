import { AiIcon } from "@/components/ui/ai-icon";
import { Text } from "@/components/ui/text";
import { ReportingPeriod } from "@/types/company";
import { localizeUnit } from "@/utils/localizeUnit";
import { t } from "i18next";
import { ArrowUpRight } from "lucide-react";

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
  return (
    <div className={className ? `@container ${className}` : "@container"}>
      <div className="mt-8 @md:mt-12 bg-black-1 rounded-level-2 p-6">
        <div className="grid grid-cols-1 @md:grid-cols-3 gap-4 @md:gap-8">
          <div>
            <Text className="md:mb-2 font-bold">
              {t("companies.overview.turnover")}
            </Text>
            <span className="flex items-center gap-2">
              <Text>
                {selectedPeriod.economy?.turnover?.value
                  ? `${localizeUnit(
                      selectedPeriod.economy.turnover.value / 1e9,
                      currentLanguage,
                    )} mdr ${selectedPeriod.economy.turnover.currency}`
                  : t("companies.overview.notReported")}
              </Text>
              {turnoverAIGenerated && <AiIcon size="md" />}
            </span>
          </div>

          <div>
            <Text className="md:mb-2 font-bold">
              {t("companies.overview.employees")}
            </Text>
            <span className="flex items-center gap-2">
              <Text>{formattedEmployeeCount}</Text>
              {employeesAIGenerated && <AiIcon size="md" />}
            </span>
          </div>

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
        </div>
      </div>
    </div>
  );
}
