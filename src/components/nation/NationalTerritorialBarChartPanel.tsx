import { FC } from "react";
import type { TFunction } from "i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LegendItem } from "@/types/charts";
import {
  CHART_COLORS,
  ChartFooter,
  ChartWrapper,
  EnhancedLegend,
  getChartContainerProps,
  getResponsiveChartMargin,
  getYAxisProps,
} from "@/components/charts";
import type { SupportedLanguage } from "@/lib/languageDetection";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import type { ChartRow } from "./nationalTerritorialBiogenicChartModel";

type TooltipPayloadEntry = {
  dataKey?: string | number;
  value?: number | null;
  name?: string;
  color?: string;
};

type TerritorialBiogenicBarChartTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label: string;
  currentLanguage: SupportedLanguage;
  t: TFunction;
};

const TerritorialBiogenicBarChartTooltip: FC<
  TerritorialBiogenicBarChartTooltipProps
> = ({ active, payload, label, currentLanguage, t }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-black-1 bg-black-2 px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium text-white">{label}</p>
      {payload.map((entry) => {
        const v = entry.value as number | null;
        if (v == null) return null;
        return (
          <p
            key={String(entry.dataKey)}
            className="text-sm"
            style={{ color: entry.color }}
          >
            {entry.name}: {formatEmissionsAbsolute(v, currentLanguage)}{" "}
            {t("emissionsUnit")}
          </p>
        );
      })}
    </div>
  );
};

type NationalTerritorialBarChartPanelProps = {
  chartData: ChartRow[];
  legendItems: LegendItem[];
  isMobile: boolean;
  currentLanguage: SupportedLanguage;
  t: TFunction;
};

export const NationalTerritorialBarChartPanel: FC<
  NationalTerritorialBarChartPanelProps
> = ({ chartData, legendItems, isMobile, currentLanguage, t }) => (
  <div className="min-h-0 min-w-0 w-full">
    <ChartWrapper>
      <div className="h-[280px] w-full md:h-[340px]">
        <ResponsiveContainer {...getChartContainerProps("100%", "100%")}>
          <BarChart
            data={chartData}
            margin={getResponsiveChartMargin(isMobile)}
            barGap={2}
            barCategoryGap="12%"
            barSize={28}
          >
            <CartesianGrid
              stroke="var(--black-1)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              stroke="var(--grey)"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--grey)", fontSize: 12 }}
            />
            <YAxis {...getYAxisProps(currentLanguage)} />
            <Tooltip
              cursor={{ fill: "var(--black-1)", opacity: 0.35 }}
              content={({ active, payload, label }) => (
                <TerritorialBiogenicBarChartTooltip
                  active={active}
                  payload={payload as TooltipPayloadEntry[] | undefined}
                  label={label}
                  currentLanguage={currentLanguage}
                  t={t}
                />
              )}
            />
            <Bar
              dataKey="territorial"
              name={t("nation.detailPage.territorialBiogenic.territorial")}
              fill={CHART_COLORS.primary}
              stroke="var(--grey)"
              strokeWidth={1}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="biogenic"
              name={t("nation.detailPage.territorialBiogenic.biogenic")}
              fill="var(--orange-2)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="total"
              name={t("nation.detailPage.territorialBiogenic.total")}
              fill={CHART_COLORS.paris}
              stroke="var(--grey)"
              strokeWidth={1}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartFooter>
        <EnhancedLegend items={legendItems} />
      </ChartFooter>
    </ChartWrapper>
  </div>
);
