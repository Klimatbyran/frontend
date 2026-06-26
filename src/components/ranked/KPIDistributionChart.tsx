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
  Legend,
} from "recharts";
import { KPIValue } from "@/types/rankings";
import { COLORS } from "@/lib/colors";

interface KPIDistributionChartProps<T> {
  data: T[];
  selectedKPI: KPIValue<T>;
  average?: number;
  /** Plural label used in tooltips, e.g. "kommuner" */
  entityLabel?: string;
}

const NUM_BINS = 12;

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

/** Color a histogram bin: good side = blue-3, bad side = pink-3, near avg = orange-2 */
function binColor(
  binMid: number,
  average: number | undefined,
  binWidth: number,
  higherIsBetter: boolean,
): string {
  if (
    average !== undefined &&
    Math.abs(binMid - average) < Math.abs(binWidth) * 0.75
  ) {
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
) {
  return useMemo(() => {
    if (!selectedKPI.isBoolean) return null;
    const trueCount = data.filter((m) => m[selectedKPI.key] === true).length;
    const falseCount = data.filter((m) => m[selectedKPI.key] === false).length;
    return [
      {
        name: selectedKPI.booleanLabels?.true || t("yes"),
        value: trueCount,
        fill: COLORS.blue3,
      },
      {
        name: selectedKPI.booleanLabels?.false || t("no"),
        value: falseCount,
        fill: COLORS.pink3,
      },
    ];
  }, [data, selectedKPI, t]);
}

export function KPIDistributionChart<T>({
  data,
  selectedKPI,
  average,
  entityLabel,
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

  const booleanValues = useBooleanValues(data, selectedKPI, t);

  const bins = useMemo(
    () => (!selectedKPI.isBoolean ? buildHistogramBins(values, NUM_BINS) : []),
    [values, selectedKPI.isBoolean],
  );

  if (selectedKPI.isBoolean && booleanValues) {
    const total = booleanValues.reduce((s, d) => s + d.value, 0);
    return (
      <div className="flex flex-col items-center">
        <ResponsiveContainer key={String(selectedKPI.key)} width="100%" height={180}>
          <PieChart>
            <Pie
              data={booleanValues}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
              isAnimationActive
              animationBegin={0}
              animationDuration={900}
              animationEasing="ease-out"
            >
              {booleanValues.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload: p }) => {
                if (!active || !p?.length) return null;
                const item = p[0];
                const pct =
                  total > 0
                    ? ((Number(item.value) / total) * 100).toFixed(1)
                    : 0;
                return (
                  <div className="bg-black-1 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
                    <p className="text-white font-semibold">{item.name}</p>
                    <p className="text-white/60">
                      {item.value} {label} ({pct}%)
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (!bins.length) return null;

  const unit = selectedKPI.unit || "";
  const maxCount = Math.max(...bins.map((b) => b.count));
  const binWidth = bins[1] ? bins[1].min - bins[0].min : 1;

  const goodLabel = selectedKPI.higherIsBetter
    ? t("municipalities.list.insights.distribution.higherBetter")
    : t("municipalities.list.insights.distribution.lowerBetter");
  const badLabel = selectedKPI.higherIsBetter
    ? t("municipalities.list.insights.distribution.lowerWorse")
    : t("municipalities.list.insights.distribution.higherWorse");

  return (
    <div>
      <ResponsiveContainer key={String(selectedKPI.key)} width="100%" height={220}>
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
          {average !== undefined &&
            (() => {
              const closestIdx = bins.reduce((best, bin, i) => {
                const binMid = (bin.min + bin.max) / 2;
                const bestMid = (bins[best].min + bins[best].max) / 2;
                return Math.abs(binMid - average) < Math.abs(bestMid - average)
                  ? i
                  : best;
              }, 0);
              return (
                <ReferenceLine
                  x={bins[closestIdx]?.label}
                  stroke={COLORS.orange2}
                  strokeDasharray="3 3"
                  label={{
                    value: `Ø ${average.toFixed(1)}${unit}`,
                    position: "top",
                    fontSize: 11,
                    fill: COLORS.orange2,
                  }}
                />
              );
            })()}
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
                binMid,
                average,
                binWidth,
                selectedKPI.higherIsBetter,
              );
              const opacity = 0.5 + (bin.count / maxCount) * 0.5;
              return <Cell key={i} fill={color} fillOpacity={opacity} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Color legend */}
      <div className="flex items-center justify-between mt-3 px-1 gap-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-sm shrink-0"
            style={{ backgroundColor: COLORS.blue3 }}
          />
          <span className="text-xs text-white/40">{goodLabel}</span>
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
            style={{ backgroundColor: COLORS.pink3 }}
          />
          <span className="text-xs text-white/40">{badLabel}</span>
        </div>
      </div>
    </div>
  );
}
