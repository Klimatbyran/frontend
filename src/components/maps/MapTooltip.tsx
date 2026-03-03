import { useTranslation } from "react-i18next";
import { KPIValue, MapEntityType } from "@/types/rankings";

export function MapTooltip({
  name,
  value,
  rank,
  unit,
  total,
  nullValue,
  selectedKPI,
  onClick,
}: {
  entityType: MapEntityType;
  name: string;
  value: number | boolean | null | undefined;
  rank: number | null;
  unit: string;
  total: number;
  nullValue?: string;
  selectedKPI?: KPIValue;
  onClick?: () => void;
}) {
  const { t } = useTranslation();

  const description =
    value !== null && value !== undefined
      ? typeof value === "boolean"
        ? value
          ? (selectedKPI?.booleanLabels?.true ?? t("yes"))
          : (selectedKPI?.booleanLabels?.false ?? t("no"))
        : `${(value as number).toFixed(1)}${unit}`
      : nullValue;

  return (
    <div
      className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm p-4 rounded-2xl"
      onClick={onClick}
    >
      <p className="text-white font-medium text-xl">{name}</p>
      <div className="space-y-1 mt-2">
        <p className="text-white/70">
          <span className="text-orange-2">{description}</span>
        </p>
        <p className="text-white/50 text-sm">
          {t("rankedList.rank", {
            rank: String(rank),
            total: String(total),
          })}
        </p>
      </div>
    </div>
  );
}
