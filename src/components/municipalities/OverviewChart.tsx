import { FC } from "react";
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Line,
  Area,
  Legend,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsoluteCompact } from "@/utils/localizeUnit";
import { CustomTooltip } from "./CustomTooltip";

interface DataPoint {
  year: number;
  total?: number;
  trend?: number;
  paris?: number;
  gap?: number;
  approximated?: number;
}

interface OverviewChartProps {
  projectedData: DataPoint[];
}

export const OverviewChart: FC<OverviewChartProps> = ({ projectedData }) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const { currentLanguage } = useLanguage();

  return (
    <ResponsiveContainer width="100%" height="90%">
      <LineChart data={projectedData}>
        <Legend
          verticalAlign="bottom"
          align="right"
          height={36}
          iconType="line"
          wrapperStyle={{ fontSize: "12px", color: "var(--grey)" }}
        />
        <Tooltip
          content={
            <CustomTooltip dataView="overview" hiddenSectors={new Set()} />
          }
        />
        <XAxis
          dataKey="year"
          stroke="var(--grey)"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          padding={{ left: 0, right: 0 }}
          domain={[1990, 2050]}
          allowDuplicatedCategory={true}
          ticks={[1990, 2015, 2020, currentYear, 2030, 2040, 2050]}
          tickFormatter={(year) => year}
        />
        <YAxis
          stroke="var(--grey)"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          tickFormatter={(value) =>
            formatEmissionsAbsoluteCompact(value, currentLanguage)
          }
          width={80}
          domain={[0, "auto"]}
          padding={{ top: 0, bottom: 0 }}
        />
        <Area
          type="monotone"
          dataKey="gap"
          fill="rgba(240, 117, 154, 0.1)"
          stroke="none"
          fillOpacity={0.3}
          activeDot={false}
          name={t("municipalities.graph.gap")}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="white"
          strokeWidth={2}
          dot={false}
          connectNulls
          name={t("municipalities.graph.historical")}
        />
        <Line
          type="monotone"
          dataKey="approximated"
          stroke="white"
          strokeWidth={2}
          strokeDasharray="4 4"
          dot={false}
          connectNulls
          name={t("municipalities.graph.estimated")}
        />
        <Line
          type="monotone"
          dataKey="trend"
          stroke="#F0759A"
          strokeWidth={2}
          strokeDasharray="4 4"
          dot={false}
          name={t("municipalities.graph.trend")}
        />
        <Line
          type="monotone"
          dataKey="paris"
          stroke="#E2FF8D"
          strokeWidth={2}
          strokeDasharray="4 4"
          dot={false}
          name={t("municipalities.graph.parisAgreement")}
        />
        <ReferenceLine
          x={currentYear}
          stroke="#FDB768"
          strokeWidth={1}
          label={{
            value: currentYear,
            position: "top",
            fill: "#FDB768",
            fontSize: 12,
            fontWeight: "normal",
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
