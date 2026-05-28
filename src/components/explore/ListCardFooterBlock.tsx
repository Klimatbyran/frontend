import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function ListCardFooterBlock({
  isMunicipality,
  climatePlanAdoptedText,
  climatePlanStatusColor,
  climatePlanStatusLabel,
  climatePlanAdoptedColor,
  hasScope3Coverage,
  baseYear,
}: {
  isMunicipality: boolean;
  climatePlanAdoptedText: string | null;
  climatePlanStatusColor: string;
  climatePlanStatusLabel: string;
  climatePlanAdoptedColor: string;
  hasScope3Coverage: boolean;
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
    : t("companies.card.scope3Coverage");
  const row2Value = isMunicipality
    ? climatePlanAdoptedText
    : hasScope3Coverage
      ? t("yes")
      : t("no");
  const row2Color = isMunicipality
    ? climatePlanAdoptedColor
    : hasScope3Coverage
      ? "text-green-3"
      : "text-pink-3";

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
        <div className={cn("text-xl font-light line-clamp-2", row2Color)}>
          {row2Value}
        </div>
      </div>
    </div>
  );
}
