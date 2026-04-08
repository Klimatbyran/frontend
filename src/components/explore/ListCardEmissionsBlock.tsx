import { useTranslation } from "react-i18next";
import { FinancialsTooltip } from "@/components/companies/detail/overview/FinancialsTooltip";
import { CardInfo } from "@/components/layout/CardInfo";

export function ListCardEmissionsBlock({
  emissionsYear,
  emissionsValue,
  emissionsUnit,
  emissionsIsAIGenerated,
  isFinancialsSector,
  changeRateValue,
  changeRateIsAIGenerated,
  changeRateColor,
  changeRateTooltip,
  isRegion,
  isMunicipality,
}: {
  emissionsYear?: string;
  emissionsValue: string | null;
  emissionsUnit?: string;
  emissionsIsAIGenerated?: boolean;
  isFinancialsSector: boolean;
  changeRateValue: string | null;
  changeRateIsAIGenerated?: boolean;
  changeRateColor?: string;
  changeRateTooltip?: string;
  isRegion: boolean;
  isMunicipality: boolean;
}) {
  const { t } = useTranslation();
  const emissionsTitle = emissionsYear
    ? `${t("companies.card.emissions")} ${emissionsYear}`
    : t("companies.card.emissions");
  const changeTitle =
    isRegion || isMunicipality
      ? t("municipalities.card.changeRate")
      : t("companies.card.emissionsChangeRate");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
      <div>
        <CardInfo
          title={emissionsTitle}
          value={emissionsValue}
          textColor="text-orange-2"
          unit={emissionsUnit}
          isAIGenerated={emissionsIsAIGenerated}
          suffix={isFinancialsSector ? <FinancialsTooltip /> : undefined}
        />
      </div>
      <div>
        <CardInfo
          title={changeTitle}
          value={changeRateValue}
          textColor={changeRateColor || "text-orange-2"}
          isAIGenerated={changeRateIsAIGenerated}
          tooltip={changeRateTooltip}
        />
      </div>
    </div>
  );
}
