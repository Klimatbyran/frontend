import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";

export const FUTURE_LINE_DASH = "4 4";

type TooltipRow = {
  dataKey?: string;
  value?: number;
  name?: string;
  color?: string;
};

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
  labels: Record<"history" | "trend" | "paris", string>;
}) {
  const { currentLanguage } = useLanguage();
  if (!active || !payload?.length) return null;

  const rows = payload.filter(
    (entry) =>
      entry.value != null &&
      entry.dataKey !== "parisBase" &&
      entry.dataKey !== "gap",
  );

  return (
    <div className="rounded-md border border-white/10 bg-black-2 px-3 py-2 text-sm shadow-lg">
      <p className="mb-2 font-medium text-white">{label}</p>
      <ul className="space-y-1">
        {rows.map((entry) => {
          const key = entry.dataKey as keyof typeof labels;
          const name = labels[key] ?? entry.name;
          return (
            <li
              key={entry.dataKey}
              className="flex items-center justify-between gap-4 tabular-nums"
            >
              <span className="flex items-center gap-2 text-grey">
                <span
                  className="h-0.5 w-4"
                  style={
                    entry.dataKey === "history"
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
              <span className="text-white">
                {formatEmissionsAbsolute(entry.value!, currentLanguage)} {unit}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
