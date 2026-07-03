import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  PieChart,
  Pie,
} from "recharts";
import { useLanguage } from "@/components/LanguageProvider";
import { useChartMotion } from "@/hooks/useChartMotion";
import { useResponsiveChartSize } from "@/hooks/useResponsiveChartSize";
import { KPIValue } from "@/types/rankings";
import { COLORS } from "@/lib/colors";
import { isMissingRankedValue } from "@/utils/insights/rankedListUtils";
import { formatPercent } from "@/utils/formatting/localization";

interface KPIDistributionChartProps<T> {
  data: T[];
  selectedKPI: KPIValue<T>;
  average?: number;
  /** Plural label used in tooltips, e.g. "kommuner" */
  entityLabel?: string;
  /** i18n prefix for KPI labels, e.g. "municipalities.list" */
  translationPrefix?: string;
  /** Caps pie outer radius — use in the stats panel beside map/graph */
  maxOuterRadius?: number;
}

const NUM_BINS = 12;

interface BooleanPieSlice {
  name: string;
  value: number;
  color: string;
}

function BooleanPieTooltip({
  active,
  payload,
  entityLabel,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    payload?: { total?: number };
  }>;
  entityLabel: string;
}) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  if (!active || !payload?.length) return null;

  const item = payload[0];
  const value = item.value ?? 0;
  const total = item.payload?.total;
  const percentage =
    total != null && total > 0
      ? formatPercent(value / total, currentLanguage)
      : null;

  return (
    <div className="bg-black-2 border border-black-1 rounded-lg shadow-xl p-4 text-white pointer-events-none z-50">
      <p className="text-sm font-medium mb-1">{item.name}</p>
      <div className="text-sm text-grey">
        <div>
          {value} {entityLabel}
        </div>
        {percentage && (
          <div>
            {percentage} {t("graphs.pieChart.ofTotal")}
          </div>
        )}
      </div>
    </div>
  );
}

function BooleanKPIPieChart({
  slices,
  entityLabel,
  animationKey,
  maxOuterRadius,
}: {
  slices: BooleanPieSlice[];
  entityLabel: string;
  animationKey: string;
  maxOuterRadius?: number;
}) {
  const { size, containerRef } = useResponsiveChartSize(false, maxOuterRadius);
  const { pieDuration, reduceMotion } = useChartMotion();

  const total = slices.reduce((sum, item) => sum + item.value, 0);
  const pieData = slices.map((item) => ({ ...item, total }));
  const chartHeight = size.outerRadius * 2;
  const pieAnimationKey = pieData
    .map((entry) => `${entry.name}-${entry.value}`)
    .join("|");

  return (
    <div ref={containerRef} className="w-full" style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <PieChart>
          <Pie
            key={`${animationKey}-${pieAnimationKey}`}
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={size.innerRadius}
            outerRadius={size.outerRadius}
            cornerRadius={8}
            paddingAngle={2}
            isAnimationActive={!reduceMotion}
            animationBegin={0}
            animationDuration={pieDuration}
            animationEasing="ease-out"
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`${entry.name}-${index}`}
                fill={entry.color}
                stroke={entry.color}
              />
            ))}
          </Pie>
          <Tooltip
            content={(props) => (
              <BooleanPieTooltip {...props} entityLabel={entityLabel} />
            )}
            animationDuration={0}
            isAnimationActive={false}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function buildHistogramBins(
  values: number[],
  numBins: number,
): { label: string; count: number; min: number; max: number }[] {
  if (!values.length) return [];
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  if (minVal === maxVal) {
    return [
      { label: String(minVal), count: values.length, min: minVal, max: maxVal },
    ];
  }
  const binSize = (maxVal - minVal) / numBins;
  const bins = Array.from({ length: numBins }, (_, i) => {
    const binMin = minVal + i * binSize;
    const binMax = i === numBins - 1 ? maxVal + 0.0001 : binMin + binSize;
    return { label: binMin.toFixed(1), count: 0, min: binMin, max: binMax };
  });
  values.forEach((v) => {
    const idx = Math.min(Math.floor((v - minVal) / binSize), numBins - 1);
    bins[idx].count++;
  });
  return bins;
}

function findClosestBinIndex(
  bins: { min: number; max: number }[],
  average: number,
): number {
  return bins.reduce((best, bin, i) => {
    const binMid = (bin.min + bin.max) / 2;
    const bestMid = (bins[best].min + bins[best].max) / 2;
    return Math.abs(binMid - average) < Math.abs(bestMid - average) ? i : best;
  }, 0);
}

/** Color a histogram bin: good side = blue-3, bad side = pink-3, avg bin = orange-2 */
function binColor(
  binIndex: number,
  averageBinIndex: number | undefined,
  binMid: number,
  average: number | undefined,
  higherIsBetter: boolean,
): string {
  if (averageBinIndex !== undefined && binIndex === averageBinIndex) {
    return COLORS.orange2;
  }
  // "good" side depends on KPI direction
  const isGoodSide = higherIsBetter
    ? binMid > (average ?? 0)
    : binMid < (average ?? 0);
  return isGoodSide ? COLORS.blue3 : COLORS.pink3;
}

function HistogramTooltip({
  active,
  payload,
  unit,
  entityLabel,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  unit: string;
  entityLabel: string;
}) {
  if (!active || !payload?.length) return null;
  const bin = payload[0]?.payload;
  if (!bin) return null;
  return (
    <div className="bg-black-1 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-white/60 mb-1">
        {Number(bin.min).toFixed(1)}
        {unit} – {Number(bin.max).toFixed(1)}
        {unit}
      </p>
      <p className="text-white font-semibold">
        {bin.count} {entityLabel}
      </p>
    </div>
  );
}

function useBooleanValues<T>(
  data: T[],
  selectedKPI: KPIValue<T>,
  t: ReturnType<typeof useTranslation>["t"],
  translationPrefix?: string,
) {
  return useMemo(() => {
    if (!selectedKPI.isBoolean) return null;

    const getValue = (item: T) => item[selectedKPI.key];
    const trueCount = data.filter(
      (item) => getValue(item) === true,
    ).length;
    const falseCount = data.filter(
      (item) => getValue(item) === false,
    ).length;
    const unknownCount = data.filter((item) =>
      isMissingRankedValue(getValue(item), true),
    ).length;
    const kpiKey = String(selectedKPI.key);
    const trueLabel = translationPrefix
      ? t(`${translationPrefix}.kpis.${kpiKey}.booleanLabels.true`)
      : selectedKPI.booleanLabels?.true || t("yes");
    const falseLabel = translationPrefix
      ? t(`${translationPrefix}.kpis.${kpiKey}.booleanLabels.false`)
      : selectedKPI.booleanLabels?.false || t("no");
    const unknownLabel = translationPrefix
      ? t(`${translationPrefix}.kpis.${kpiKey}.nullValues`, {
          defaultValue: t("unknown"),
        })
      : selectedKPI.nullValues || t("unknown");
    // When higherIsBetter: true = good (blue), false = bad (pink).
    // When !higherIsBetter: true = bad (pink), false = good (blue).
    const trueColor = selectedKPI.higherIsBetter ? COLORS.blue3 : COLORS.pink3;
    const falseColor = selectedKPI.higherIsBetter ? COLORS.pink3 : COLORS.blue3;
    const slices: BooleanPieSlice[] = [
      {
        name: trueLabel,
        value: trueCount,
        color: trueColor,
      },
      {
        name: falseLabel,
        value: falseCount,
        color: falseColor,
      },
    ];
    if (unknownCount > 0) {
      slices.push({
        name: unknownLabel,
        value: unknownCount,
        color: COLORS.grey,
      });
    }
    return slices;
  }, [data, selectedKPI, t, translationPrefix]);
}

export function KPIDistributionChart<T>({
  data,
  selectedKPI,
  average,
  entityLabel,
  translationPrefix,
  maxOuterRadius,
}: KPIDistributionChartProps<T>) {
  const { t } = useTranslation();
  const label = entityLabel ?? t("header.municipalities").toLowerCase();

  const values = useMemo(
    () =>
      data
        .map((m) => m[selectedKPI.key])
        .filter((v): v is number => typeof v === "number" && !isNaN(v)),
    [data, selectedKPI.key],
  );

  const booleanValues = useBooleanValues(
    data,
    selectedKPI,
    t,
    translationPrefix,
  );

  const bins = useMemo(
    () => (!selectedKPI.isBoolean ? buildHistogramBins(values, NUM_BINS) : []),
    [values, selectedKPI.isBoolean],
  );

  if (selectedKPI.isBoolean && booleanValues) {
    const slices = booleanValues.filter((d) => d.value > 0);
    if (!slices.length) return null;

    return (
      <BooleanKPIPieChart
        slices={slices}
        entityLabel={label}
        animationKey={String(selectedKPI.key)}
        maxOuterRadius={maxOuterRadius}
      />
    );
  }

  if (!bins.length) return null;

  const unit = selectedKPI.unit || "";
  const maxCount = Math.max(...bins.map((b) => b.count));
  const averageBinIndex =
    average !== undefined ? findClosestBinIndex(bins, average) : undefined;

  // Both keys now translate to just "Bättre" / "Sämre"
  const betterLabel = t(
    "municipalities.list.insights.distribution.higherBetter",
  );
  const worseLabel = t("municipalities.list.insights.distribution.higherWorse");

  // For lowerIsBetter KPIs (e.g. emissions), blue bars are on the LEFT (low values).
  // For higherIsBetter KPIs, blue bars are on the RIGHT (high values).
  // Legend order reflects this so "Sämre" is always next to the pink side.
  const leftLabel = selectedKPI.higherIsBetter ? worseLabel : betterLabel;
  const leftColor = selectedKPI.higherIsBetter ? COLORS.pink3 : COLORS.blue3;
  const rightLabel = selectedKPI.higherIsBetter ? betterLabel : worseLabel;
  const rightColor = selectedKPI.higherIsBetter ? COLORS.blue3 : COLORS.pink3;

  return (
    <div>
      <ResponsiveContainer
        key={String(selectedKPI.key)}
        width="100%"
        height={220}
      >
        <BarChart
          data={bins}
          margin={{ top: 16, right: 4, bottom: 4, left: 4 }}
        >
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tickFormatter={(v) => `${Number(v).toFixed(0)}${unit}`}
          />
          <YAxis hide domain={[0, maxCount]} />
          <Tooltip
            content={(props) => (
              <HistogramTooltip
                active={props.active}
                payload={props.payload}
                unit={unit}
                entityLabel={label}
              />
            )}
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
          />
          <Bar
            dataKey="count"
            radius={[3, 3, 0, 0]}
            maxBarSize={32}
            isAnimationActive
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {bins.map((bin, i) => {
              const binMid = (bin.min + bin.max) / 2;
              const color = binColor(
                i,
                averageBinIndex,
                binMid,
                average,
                selectedKPI.higherIsBetter,
              );
              const opacity = 0.5 + (bin.count / maxCount) * 0.5;
              return <Cell key={i} fill={color} fillOpacity={opacity} />;
            })}
          </Bar>
          {average !== undefined && (
            <ReferenceLine
              x={bins[averageBinIndex!]?.label}
              stroke={COLORS.orange3}
              strokeWidth={2}
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
              label={{
                value: `Ø ${average.toFixed(1)}${unit}`,
                position: "top",
                fontSize: 11,
                fill: COLORS.orange3,
              }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
      {/* Color legend — order mirrors the histogram: bad side matches its colour */}
      <div className="flex items-center justify-between mt-3 px-1 gap-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-sm shrink-0"
            style={{ backgroundColor: leftColor }}
          />
          <span className="text-xs text-white/40">{leftLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-sm shrink-0"
            style={{ backgroundColor: COLORS.orange2 }}
          />
          <span className="text-xs text-white/40">
            {t("municipalities.list.insights.distribution.average")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-sm shrink-0"
            style={{ backgroundColor: rightColor }}
          />
          <span className="text-xs text-white/40">{rightLabel}</span>
        </div>
      </div>
    </div>
  );
}
