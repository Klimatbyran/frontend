import { useLanguage } from "@/components/LanguageProvider";
import { AiIcon } from "@/components/ui/ai-icon";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import type { TwoFuturesRow } from "@/components/territories/emissionsGraph/twoFuturesChartData";

export const FUTURE_LINE_DASH = "4 4";

type TooltipRow = {
  dataKey?: string;
  value?: number;
  name?: string;
  color?: string;
  payload?: TwoFuturesRow;
};

export type TwoFuturesTooltipLabels = Record<
  "history" | "historyEstimated" | "trend" | "paris",
  string
>;

function isAnchorEstimate(entry: TooltipRow, payload: TooltipRow[]) {
  if (entry.dataKey !== "historyEstimated") return false;
  return payload.some(
    (other) => other.dataKey === "history" && other.value != null,
  );
}

export function TwoFuturesTooltip({
  active,
  payload,
  label,
  unit,
  labels,
}: {
  active?: boolean;
  payload?: TooltipRow[];
  label?: string | number;
  unit: string;
  labels: TwoFuturesTooltipLabels;
}) {
  const { currentLanguage } = useLanguage();
  if (!active || !payload?.length) return null;

  const rows = payload.filter(
    (entry) =>
      entry.value != null &&
      entry.dataKey !== "parisBase" &&
      entry.dataKey !== "gap" &&
      !isAnchorEstimate(entry, payload),
  );

  return (
    <div className="rounded-md border border-white/10 bg-black-2 px-3 py-2 text-sm shadow-lg">
      <p className="mb-2 font-medium text-white">{label}</p>
      <ul className="space-y-1">
        {rows.map((entry) => {
          const key = entry.dataKey as keyof TwoFuturesTooltipLabels;
          const name = labels[key] ?? entry.name;
          const showAi =
            entry.dataKey === "history" && entry.payload?.historyIsAIGenerated;
          const swatchIsSolid = entry.dataKey === "history";
          return (
            <li
              key={entry.dataKey}
              className="flex items-center justify-between gap-4 tabular-nums"
            >
              <span className="flex items-center gap-2 text-grey">
                <span
                  className="h-0.5 w-4"
                  style={
                    swatchIsSolid
                      ? { background: entry.color }
                      : {
                          background: "transparent",
                          borderTop: `2px dashed ${entry.color}`,
                        }
                  }
                  aria-hidden
                />
                {name}
              </span>
              <span className="flex items-center gap-1 text-white">
                {formatEmissionsAbsolute(entry.value!, currentLanguage)} {unit}
                {showAi && <AiIcon size="sm" />}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
