import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import type { BenchmarkReference } from "@/types/territoryBenchmarks";
import {
  getPositiveBarRange,
  getSymmetricBarRange,
} from "@/utils/territories/benchmarkUtils";
import { useLanguage } from "@/components/LanguageProvider";
import { formatPercentChange } from "@/utils/formatting/localization";

interface BenchmarkComparisonBarsProps {
  references: BenchmarkReference[];
  unit: string;
  higherIsBetter: boolean;
  symmetric?: boolean;
}

function formatBarValue(
  value: number | null,
  unit: string,
  currentLanguage: ReturnType<typeof useLanguage>["currentLanguage"],
): string {
  if (value === null) return "–";
  if (unit === "%") {
    return formatPercentChange(value, currentLanguage, true);
  }
  return `${value.toFixed(1)}${unit ? ` ${unit}` : ""}`;
}

function getBarWidth(
  value: number | null,
  min: number,
  max: number,
  symmetric: boolean,
): number {
  if (value === null) return 0;
  if (symmetric) {
    const range = Math.max(Math.abs(min), Math.abs(max), 1);
    return (Math.abs(value) / range) * 50;
  }
  if (max === min) return 50;
  return ((value - min) / (max - min)) * 100;
}

function getBarAlignment(value: number | null, symmetric: boolean): string {
  if (!symmetric || value === null) return "justify-start";
  if (value < 0) return "justify-end";
  if (value > 0) return "justify-start";
  return "justify-center";
}

export function BenchmarkComparisonBars({
  references,
  unit,
  higherIsBetter,
  symmetric = unit === "%",
}: BenchmarkComparisonBarsProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const values = references
    .map((reference) => reference.value)
    .filter((value): value is number => value !== null);

  const range = useMemo(
    () =>
      symmetric
        ? getSymmetricBarRange(values)
        : getPositiveBarRange(values),
    [symmetric, values],
  );

  return (
    <div className="space-y-6">
      {references.map((reference) => {
        const width = getBarWidth(
          reference.value,
          range.min,
          range.max,
          symmetric,
        );
        const alignment = getBarAlignment(reference.value, symmetric);

        return (
          <div key={reference.id} className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <Text
                className={`text-sm md:text-base ${
                  reference.isHighlighted ? "text-white" : "text-grey"
                }`}
              >
                {reference.label}
              </Text>
              <Text
                className={`text-lg md:text-2xl font-medium ${
                  reference.isHighlighted
                    ? "text-orange-2"
                    : reference.id === "national" ||
                        reference.id === "regional-average"
                      ? "text-green-3"
                      : "text-blue-3"
                }`}
              >
                {formatBarValue(reference.value, unit, currentLanguage)}
              </Text>
            </div>

            <div
              className={`relative flex h-4 md:h-5 w-full overflow-hidden rounded-full bg-black-1 ${
                symmetric ? "justify-center" : ""
              }`}
            >
              {symmetric && (
                <div className="absolute inset-y-0 left-1/2 w-px bg-black-4" />
              )}
              <div className={`flex w-1/2 ${alignment}`}>
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${reference.colorClass} ${
                    reference.isHighlighted ? "opacity-100" : "opacity-80"
                  }`}
                  style={{ width: `${Math.max(width, reference.value === 0 ? 2 : 4)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}

      <Text className="text-xs text-grey">
        {higherIsBetter
          ? t("territoryBenchmarks.higherIsBetterHint")
          : t("territoryBenchmarks.lowerIsBetterHint")}
      </Text>
    </div>
  );
}
