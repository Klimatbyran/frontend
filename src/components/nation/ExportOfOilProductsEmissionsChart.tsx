import { useEffect, useMemo, useState } from "react";
import { useMotionValueEvent, type MotionValue } from "framer-motion";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation, Trans } from "react-i18next";
import { Lightbulb } from "lucide-react";
import { CardHeader } from "@/components/layout/CardHeader";
import { InfoTooltip } from "@/components/layout/InfoTooltip";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { useLanguage } from "@/components/LanguageProvider";
import { useScreenSize } from "@/hooks/useScreenSize";
import {
  ChartArea,
  ChartWrapper,
  getChartContainerProps,
  getResponsiveChartMargin,
  getXAxisProps,
  getYAxisProps,
} from "@/components/charts";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import { emissionsToSwedishCitizenEquivalent } from "@/utils/calculations/relatableNumbersCalc";
import { DEFAULT_STATISTICAL_GRADIENT_COLORS } from "@/utils/ui/colorGradients";
import { getNationStoryScrollBarScale } from "@/components/nation/story/nationStoryScrollAnimation";
import type { YearValuePoint } from "@/hooks/nation/useNationDetails";

const MAP_GRADIENT_STOPS = [
  DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientStart,
  DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientMidLow,
  DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientMidHigh,
  DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientEnd,
] as const;

// Legend swatch runs light (low) → dark (high) left-to-right so the
// label order "Lägre … Högre" reads naturally alongside the gradient.
const MAP_GRADIENT_CSS = `linear-gradient(to right, 
  ${DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientEnd} 0%,
  ${DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientMidHigh} 33%,
  ${DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientMidLow} 66%,
  ${DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientStart} 100%)`;

type ChartDatum = {
  year: number;
  valueKt: number;
  displayValueKt: number;
  fill: string;
};

function getBarColor(
  value: number,
  minValue: number,
  maxValue: number,
): string {
  if (maxValue === minValue) {
    return DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientMidHigh;
  }

  const ratio = (value - minValue) / (maxValue - minValue);
  const t = 1 - ratio;
  const scaled = t * (MAP_GRADIENT_STOPS.length - 1);
  const index = Math.min(MAP_GRADIENT_STOPS.length - 2, Math.floor(scaled));
  const localT = scaled - index;
  const from = MAP_GRADIENT_STOPS[index];
  const to = MAP_GRADIENT_STOPS[index + 1];

  return `color-mix(in srgb, ${from} ${(1 - localT) * 100}%, ${to} ${localT * 100}%)`;
}

function toChartData(points: YearValuePoint[]): ChartDatum[] {
  const valuesKt = points.map((point) => point.value / 1000);
  const minValue = Math.min(...valuesKt);
  const maxValue = Math.max(...valuesKt);

  return points.map((point) => {
    const valueKt = point.value / 1000;

    return {
      year: point.year,
      valueKt,
      displayValueKt: valueKt,
      fill: getBarColor(valueKt, minValue, maxValue),
    };
  });
}

function getLatestYearPoint(data: YearValuePoint[]): YearValuePoint | null {
  return data.length > 0 ? data[data.length - 1] : null;
}

function CitizenComparisonCallout({
  year,
  formattedCount,
}: {
  year: number;
  formattedCount: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="-mt-2 mb-6 flex gap-3 rounded-level-2 border border-yellow-3/35 bg-yellow-3/5 px-4 py-4 @lg:-mt-4 @lg:mb-8 @lg:px-5 @lg:py-5">
      <Lightbulb
        className="mt-0.5 shrink-0 text-yellow-3"
        height={28}
        width={28}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-yellow-3">
          {t("nation.exportOfOilProducts.citizenComparisonLabel")}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-white @lg:text-base">
          <Trans
            i18nKey="nation.exportOfOilProducts.citizenComparisonHighlight"
            values={{ count: formattedCount }}
            components={{
              highlight: (
                <span className="text-xl font-semibold tabular-nums text-orange-2 @lg:text-2xl" />
              ),
              tooltip: (
                <InfoTooltip
                  ariaLabel={t(
                    "nation.exportOfOilProducts.citizenComparisonTooltipAria",
                  )}
                  className="ml-1 inline-block h-4 w-4 shrink-0 align-middle"
                >
                  {t("nation.exportOfOilProducts.citizenComparisonTooltip", {
                    year,
                  })}
                </InfoTooltip>
              ),
            }}
          />
        </p>
      </div>
    </div>
  );
}

type ExportOfOilProductsTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: ChartDatum }>;
  label?: string | number;
  unit?: string;
};

function ExportOfOilProductsTooltip({
  active,
  payload,
  label,
  unit,
}: ExportOfOilProductsTooltipProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();

  if (!active || !payload?.length || !payload[0]?.payload) {
    return null;
  }

  const { valueKt } = payload[0].payload;
  const formattedValue = formatEmissionsAbsolute(
    valueKt * 1000,
    currentLanguage,
  );

  return (
    <div
      className={`${isMobile ? "max-w-[220px]" : "max-w-[300px]"} bg-black-1 px-4 py-3 rounded-level-2 grid grid-cols-[1fr_auto] text-xs z-[60] relative`}
    >
      <div className="text-sm font-medium mb-2 grid grid-cols-subgrid col-span-2">
        <span>{label}</span>
        <span className="flex justify-end mr-1">
          {unit || t("emissionsUnit")}
        </span>
      </div>
      <div className="text-grey mr-2">
        {t("nation.exportOfOilProducts.title")}
      </div>
      <div
        className="flex pl-2 justify-end tabular-nums"
        style={{ color: payload[0]?.payload?.fill }}
      >
        {formattedValue}
      </div>
    </div>
  );
}

export function ExportOfOilProductsEmissionsChart({
  data,
  scrollYProgress,
  hideHeader = false,
  className,
}: {
  data: YearValuePoint[];
  scrollYProgress?: MotionValue<number>;
  hideHeader?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();
  const [scrollProgress, setScrollProgress] = useState(
    () => scrollYProgress?.get() ?? 0,
  );

  useEffect(() => {
    if (!scrollYProgress) {
      return;
    }

    setScrollProgress(scrollYProgress.get());
  }, [scrollYProgress]);

  useMotionValueEvent(scrollYProgress ?? null, "change", (value) => {
    setScrollProgress(value);
  });

  const chartData = useMemo(() => toChartData(data), [data]);
  const yAxisMax = useMemo(() => {
    const maxValueKt = Math.max(...chartData.map((point) => point.valueKt), 0);
    return maxValueKt > 0 ? maxValueKt * 1.05 : "auto";
  }, [chartData]);
  const animatedChartData = useMemo(() => {
    if (!scrollYProgress) {
      return chartData;
    }

    return chartData.map((point, index) => ({
      ...point,
      displayValueKt:
        point.valueKt *
        getNationStoryScrollBarScale(scrollProgress, index, chartData.length),
    }));
  }, [chartData, scrollProgress, scrollYProgress]);
  const latestYearPoint = useMemo(() => getLatestYearPoint(data), [data]);
  const latestCitizenEquivalent = useMemo(() => {
    if (!latestYearPoint) return null;
    return emissionsToSwedishCitizenEquivalent(
      latestYearPoint.value,
      currentLanguage,
    );
  }, [latestYearPoint, currentLanguage]);
  const xAxisTicks = useMemo(
    () => chartData.map((point) => point.year).filter((year) => year % 5 === 0),
    [chartData],
  );
  const showCitizenComparison =
    latestYearPoint !== null && latestCitizenEquivalent !== null;

  if (chartData.length === 0) {
    return null;
  }

  return (
    <SectionWithHelp helpItems={[]} className={className}>
      {!hideHeader && (
        <CardHeader
          title={t("nation.exportOfOilProducts.title")}
          description={t("nation.exportOfOilProducts.description")}
          className="[&>div]:mb-4 [&>div]:@lg:mb-6"
        />
      )}

      {showCitizenComparison && latestYearPoint && latestCitizenEquivalent && (
        <CitizenComparisonCallout
          year={latestYearPoint.year}
          formattedCount={latestCitizenEquivalent.formattedCount}
        />
      )}

      <div
        className={
          hideHeader
            ? showCitizenComparison
              ? "mt-2"
              : "mt-0"
            : showCitizenComparison
              ? "mt-2"
              : "mt-8"
        }
        style={{ height: isMobile ? "min(240px, 35vh)" : "340px" }}
      >
        <ChartWrapper>
          <ChartArea className="min-h-0 h-full">
            <ResponsiveContainer {...getChartContainerProps()}>
              <BarChart
                data={animatedChartData}
                margin={getResponsiveChartMargin(isMobile)}
              >
                <XAxis
                  {...getXAxisProps("year", undefined, xAxisTicks)}
                  interval={0}
                  tickFormatter={(year) => year}
                />
                <YAxis {...getYAxisProps(currentLanguage, [0, yAxisMax])} />

                <Tooltip
                  content={
                    <ExportOfOilProductsTooltip unit={t("emissionsUnit")} />
                  }
                  cursor={{ fill: "var(--black-1)", opacity: 0.35 }}
                  wrapperStyle={{ outline: "none", zIndex: 60 }}
                />

                <Bar
                  dataKey="displayValueKt"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={isMobile ? 10 : 16}
                  isAnimationActive={!scrollYProgress}
                  animationBegin={0}
                  animationDuration={600}
                  animationEasing="ease-out"
                >
                  {animatedChartData.map((entry) => (
                    <Cell key={entry.year} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartArea>
        </ChartWrapper>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3 text-xs text-grey">
        <span>{t("nation.exportOfOilProducts.legendLow")}</span>
        <div
          className="h-5 w-40 rounded-full"
          style={{ background: MAP_GRADIENT_CSS }}
        />
        <span>{t("nation.exportOfOilProducts.legendHigh")}</span>
      </div>
    </SectionWithHelp>
  );
}
