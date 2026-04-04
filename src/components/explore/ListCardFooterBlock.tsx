import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function ListCardFooterBlock({
  isMunicipality,
  climatePlanAdoptedText,
  climatePlanStatusColor,
  climatePlanStatusLabel,
  climatePlanAdoptedColor,
  categoryName,
  baseYear,
}: {
  isMunicipality: boolean;
  climatePlanAdoptedText: string | null;
  climatePlanStatusColor: string;
  climatePlanStatusLabel: string;
  climatePlanAdoptedColor: string;
  categoryName: string;
  baseYear?: number | null;
}) {
  const { t } = useTranslation();
  const row1Label = isMunicipality
    ? t("municipalities.card.climatePlan")
    : t("companies.card.reportingSince");
  const row1Value = isMunicipality
    ? climatePlanStatusLabel
    : (baseYear ?? t("unknown"));
  const row2Label = isMunicipality
    ? t("municipalities.card.climatePlanAdopted")
    : t("companies.card.largestEmissionSource");
  const row2Value = isMunicipality ? climatePlanAdoptedText : categoryName;

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 mt-6">
      <div>
        <div className="flex flex-col gap-2 text-nowrap text-grey text-lg">
          {row1Label}
        </div>
        <div
          className={cn(
            "text-xl font-light line-clamp-2",
            climatePlanStatusColor,
          )}
        >
          {row1Value}
        </div>
      </div>
      <div>
        <div className="flex flex-col gap-2 text-nowrap text-grey text-lg">
          {row2Label}
        </div>
        <div
          className={cn(
            "text-xl font-light line-clamp-2",
            climatePlanAdoptedColor,
          )}
        >
          {row2Value}
        </div>
      </div>
    </div>
  );
}
