import { t } from "i18next";
import { KPIValue } from "@/types/municipality";

export function MapTooltip({
  name,
  value,
  rank,
  unit,
  total,
  nullValue,
  selectedKPI,
}: {
  name: string;
  value: number | boolean | null | undefined;
  rank: number | null;
  unit: string;
  total: number;
  nullValue?: string;
  selectedKPI?: KPIValue;
}) {
  const booleanLabelTrue = t(
    `municipalities.list.kpis.${selectedKPI?.key}.booleanLabels.true`,
  );
  const booleanLabelFalse = t(
    `municipalities.list.kpis.${selectedKPI?.key}.booleanLabels.false`,
  );

  const description =
    value !== null && value !== undefined
      ? typeof value === "boolean"
        ? value
          ? booleanLabelTrue || t("yes")
          : booleanLabelFalse || t("no")
        : `${(value as number).toFixed(1)}${unit}`
      : nullValue;

  return (
    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm p-4 rounded-2xl">
      <p className="text-white font-medium text-xl">{name}</p>
      <div className="space-y-1 mt-2">
        <p className="text-white/70">
          <span className="text-orange-2">{description}</span>
        </p>
        <p className="text-white/50 text-sm">
          {t("municipalities.list.rankedList.rank", {
            rank: String(rank),
            total: String(total),
          })}
        </p>
      </div>
    </div>
  );
}
