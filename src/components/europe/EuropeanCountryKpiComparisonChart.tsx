import { useMemo } from "react";
import { motion } from "framer-motion";
import { Text } from "@/components/ui/text";
import { InfoTooltip } from "@/components/layout/InfoTooltip";
import { useChartMotion } from "@/hooks/useChartMotion";
import { COLORS } from "@/lib/colors";

type ComparisonDatum = {
  key: string;
  label: string;
  value: number;
  formattedValue: string;
  fill: string;
};

export type EuropeanCountryKpiComparisonChartProps = {
  title: string;
  countryLabel: string;
  europeanAverageLabel: string;
  countryValue: number;
  averageValue: number;
  formatValue: (value: number) => string;
  lowerIsBetter?: boolean;
  info?: boolean;
  infoText?: string;
};

function getCountryBarColor(
  countryValue: number,
  averageValue: number,
  lowerIsBetter: boolean,
): string {
  const isBetter = lowerIsBetter
    ? countryValue < averageValue
    : countryValue > averageValue;

  return isBetter ? COLORS.blue3 : COLORS.pink3;
}

function getBarWidth(value: number, maxMagnitude: number): number {
  return Math.max((Math.abs(value) / maxMagnitude) * 100, 4);
}

export function EuropeanCountryKpiComparisonChart({
  title,
  countryLabel,
  europeanAverageLabel,
  countryValue,
  averageValue,
  formatValue,
  lowerIsBetter = true,
  info = false,
  infoText,
}: EuropeanCountryKpiComparisonChartProps) {
  const { reduceMotion, barDuration, fadeDuration, stagger, ease } =
    useChartMotion();

  const data = useMemo((): ComparisonDatum[] => {
    return [
      {
        key: "country",
        label: countryLabel,
        value: countryValue,
        formattedValue: formatValue(countryValue),
        fill: getCountryBarColor(countryValue, averageValue, lowerIsBetter),
      },
      {
        key: "average",
        label: europeanAverageLabel,
        value: averageValue,
        formattedValue: formatValue(averageValue),
        fill: COLORS.orange2,
      },
    ];
  }, [
    averageValue,
    countryLabel,
    countryValue,
    europeanAverageLabel,
    formatValue,
    lowerIsBetter,
  ]);

  const maxMagnitude = useMemo(
    () =>
      Math.max(Math.abs(countryValue), Math.abs(averageValue), Number.EPSILON),
    [averageValue, countryValue],
  );

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex min-w-0 gap-2">
        <Text className="text-base leading-snug break-words md:text-lg">
          {title}
        </Text>
        {info && infoText && (
          <span className="shrink-0 text-grey">
            <InfoTooltip ariaLabel="Additional information">
              <p>{infoText}</p>
            </InfoTooltip>
          </span>
        )}
      </div>
      <div className="space-y-3">
        {data.map((item, index) => (
          <motion.div
            key={item.key}
            className="min-w-0 space-y-1"
            initial={reduceMotion ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: fadeDuration,
              delay: stagger(index, 0.06),
              ease,
            }}
          >
            <div className="flex min-w-0 items-baseline justify-between gap-3 text-xs">
              <span className="min-w-0 truncate text-white/70">
                {item.label}
              </span>
              <span className="shrink-0 text-right tabular-nums text-grey">
                {item.formattedValue}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black-1">
              <motion.div
                className="h-full rounded-full"
                initial={reduceMotion ? false : { width: 0 }}
                animate={{
                  width: `${getBarWidth(item.value, maxMagnitude)}%`,
                }}
                transition={{
                  duration: barDuration,
                  delay: stagger(index, 0.08),
                  ease,
                }}
                style={{ backgroundColor: item.fill }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
