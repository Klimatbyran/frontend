import { FC } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import {
  ChartArea,
  ChartWrapper,
  getChartContainerProps,
  getResponsiveChartMargin,
} from "@/components/charts";
import { useScreenSize } from "@/hooks/useScreenSize";
import { formatMton } from "@/utils/data/nationStoryMetrics";

interface NationComparisonBarsProps {
  territorialMton: number;
  consumptionMton: number;
  year: number;
}

export const NationComparisonBars: FC<NationComparisonBarsProps> = ({
  territorialMton,
  consumptionMton,
  year,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();

  const chartData = [
    {
      name: t("nation.story.graph.territorialFossil"),
      value: territorialMton,
      fill: "var(--orange-2)",
    },
    {
      name: t("nation.story.graph.consumptionAbroad"),
      value: consumptionMton,
      fill: "var(--blue-2)",
    },
  ];

  return (
    <ChartWrapper>
      <ChartArea>
        <ResponsiveContainer {...getChartContainerProps()}>
          <BarChart
            data={chartData}
            margin={getResponsiveChartMargin(isMobile)}
            layout="vertical"
          >
            <XAxis
              type="number"
              stroke="var(--grey)"
              tickFormatter={(value: number) =>
                formatMton(value, currentLanguage, 0)
              }
            />
            <YAxis
              type="category"
              dataKey="name"
              width={isMobile ? 120 : 180}
              stroke="var(--grey)"
              tick={{ fill: "var(--grey)", fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number) =>
                `${formatMton(value, currentLanguage, 1)} ${t("nation.story.unit.mton")} (${year})`
              }
              contentStyle={{
                backgroundColor: "var(--black-2)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartArea>
    </ChartWrapper>
  );
};
