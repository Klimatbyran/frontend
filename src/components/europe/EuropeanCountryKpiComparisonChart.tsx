import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Text } from "@/components/ui/text";
import { InfoTooltip } from "@/components/layout/InfoTooltip";
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

function ComparisonTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ComparisonDatum }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;
  if (!item) {
    return null;
  }

  return (
    <div className="rounded-lg border border-white/10 bg-black-1 px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-white">{item.label}</p>
      <p className="text-white/60">{item.formattedValue}</p>
    </div>
  );
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
  const data = useMemo(
    (): ComparisonDatum[] => [
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
    ],
    [
      averageValue,
      countryLabel,
      countryValue,
      europeanAverageLabel,
      formatValue,
      lowerIsBetter,
    ],
  );

  const yDomain = useMemo(() => {
    const values = data.map((item) => item.value);
    const minValue = Math.min(...values, 0);
    const maxValue = Math.max(...values, 0);
    const padding = (maxValue - minValue) * 0.15 || Math.abs(maxValue) * 0.1 || 1;

    return [minValue - padding, maxValue + padding] as [number, number];
  }, [data]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Text className="text-lg md:text-xl">{title}</Text>
        {info && infoText && (
          <span className="text-grey">
            <InfoTooltip ariaLabel="Additional information">
              <p>{infoText}</p>
            </InfoTooltip>
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 12, right: 8, bottom: 4, left: 8 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis hide domain={yDomain} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
          <Tooltip
            content={(props) => (
              <ComparisonTooltip
                active={props.active}
                payload={
                  props.payload as Array<{ payload: ComparisonDatum }> | undefined
                }
              />
            )}
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
          />
          <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={48}>
            {data.map((item) => (
              <Cell key={item.key} fill={item.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
