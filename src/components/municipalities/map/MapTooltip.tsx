import { t } from "i18next";

export function MapTooltip({
  name,
  value,
  rank,
  label,
  unit,
  total,
  nullValue,
}: {
  name: string;
  value: number | null;
  rank: number | null;
  label: string;
  unit: string;
  total: number;
  nullValue?: string;
}) {
  return (
    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm p-4 rounded-2xl">
      <p className="text-white font-medium text-xl">{name}</p>
      <div className="space-y-1 mt-2">
        <p className="text-white/70">
          {label}:{" "}
          <span className="text-orange-2">
            {value !== null ? `${value.toFixed(1)}${unit}` : nullValue}
          </span>
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
