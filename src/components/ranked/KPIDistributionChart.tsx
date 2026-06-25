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

interface KPIDistributionChartProps<T> {
  data: T[];
  selectedKPI: KPIValue<T>;
  average?: number;
  /** Plural label used in the tooltip, e.g. "kommuner" */
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
    <div className="bg-black-2 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-white/70 mb-1">
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

  const booleanValues = useMemo(() => {
    if (!selectedKPI.isBoolean) return null;
    const trueCount = data.filter((m) => m[selectedKPI.key] === true).length;
    const falseCount = data.filter((m) => m[selectedKPI.key] === false).length;
    return [
      {
        name: selectedKPI.booleanLabels?.true || t("yes"),
        value: trueCount,
        fill: "#4C9BE8",
      },
      {
        name: selectedKPI.booleanLabels?.false || t("no"),
        fill: "#E8666A",
        value: falseCount,
      },
    ];
  }, [data, selectedKPI, t]);

  const bins = useMemo(
    () => (!selectedKPI.isBoolean ? buildHistogramBins(values, NUM_BINS) : []),
    [values, selectedKPI.isBoolean],
  );

  if (selectedKPI.isBoolean && booleanValues) {
    const total = booleanValues.reduce((s, d) => s + d.value, 0);
    return (
      <div className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={180}>
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
            >
              {booleanValues.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Legend
              formatter={(value, entry) => {
                // @ts-expect-error recharts Legend payload types
                const pct =
                  total > 0
                    ? ((entry.payload.value / total) * 100).toFixed(0)
                    : 0;
                return (
                  <span className="text-white/80 text-xs">
                    {value} ({pct}%)
                  </span>
                );
              }}
            />
            <Tooltip
              content={({ active, payload: p }) => {
                if (!active || !p?.length) return null;
                const item = p[0];
                const pct =
                  total > 0
                    ? ((Number(item.value) / total) * 100).toFixed(1)
                    : 0;
                return (
                  <div className="bg-black-2 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
                    <p className="text-white font-semibold">{item.name}</p>
                    <p className="text-white/70">
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

  return (
    <div>
      <p className="text-xs text-white/50 mb-2 text-center">
        {t("municipalities.list.insights.distribution.title")}
      </p>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={bins} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: "rgba(255,255,255,0.4)" }}
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
                  stroke="#F5A623"
                  strokeDasharray="3 3"
                  label={{
                    value: `Ø ${average.toFixed(1)}${unit}`,
                    position: "top",
                    fontSize: 9,
                    fill: "#F5A623",
                  }}
                />
              );
            })()}
          <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={30}>
            {bins.map((bin, i) => {
              const binMid = (bin.min + bin.max) / 2;
              const binWidth = bins[1] ? bins[1].min - bins[0].min : 1;
              const isNearAverage =
                average !== undefined &&
                Math.abs(binMid - average) < Math.abs(binWidth) * 0.75;
              const lightness = 45 + (bin.count / maxCount) * 20;
              const color = isNearAverage
                ? "#F5A623"
                : selectedKPI.higherIsBetter
                  ? `hsl(${210 + (i / bins.length) * 40}, 70%, ${lightness}%)`
                  : `hsl(${340 + (i / bins.length) * 30}, 65%, ${lightness}%)`;
              return <Cell key={i} fill={color} fillOpacity={0.85} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
