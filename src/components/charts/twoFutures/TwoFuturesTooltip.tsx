import { useLanguage } from "@/components/LanguageProvider";
import { ChartTooltipContainer } from "@/components/charts/ChartTooltipContainer";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import type { TwoFuturesRow } from "@/components/territories/emissionsGraph/twoFuturesChartData";
import { ChartTooltipList } from "../ChartTooltipList";

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
  labels,
}: {
  active?: boolean;
  payload?: TooltipRow[];
  label?: string | number;
  labels: TwoFuturesTooltipLabels;
}) {
  const { currentLanguage } = useLanguage();
  if (!active || !payload?.length) return null;

  const entries = payload
    .filter(
      (entry) =>
        entry.value != null &&
        entry.dataKey !== "parisBase" &&
        entry.dataKey !== "gap" &&
        !isAnchorEstimate(entry, payload),
    )
    .map((entry) => ({
      ...entry,
      name:
        labels[entry.dataKey as keyof TwoFuturesTooltipLabels] ?? entry.name,
      isAIGenerated:
        entry.dataKey === "history" && entry.payload?.historyIsAIGenerated,
      isSwatchSolid: entry.dataKey === "history",
    }));

  return (
    <ChartTooltipContainer>
      <ChartTooltipList
        label={String(label)}
        entries={entries}
        showAIIndicators={true}
        showSwatch={true}
        formatValue={(entry) =>
          formatEmissionsAbsolute(entry.value!, currentLanguage)
        }
      />
    </ChartTooltipContainer>
  );
}
