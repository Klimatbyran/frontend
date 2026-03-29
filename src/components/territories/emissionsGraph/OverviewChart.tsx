import { FC, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { DataPoint } from "@/types/emissions";
import { useScreenSize } from "@/hooks/useScreenSize";
import {
  EnhancedLegend,
  ChartYearControls,
  LegendItem,
  getConsistentLineProps,
  createOverviewLegendItems,
  getXAxisProps,
  getYAxisProps,
  getCurrentYearReferenceLineProps,
  getChartContainerProps,
  getLineChartProps,
  getResponsiveChartMargin,
  ChartWrapper,
  ChartArea,
  ChartFooter,
  filterDataByYearRange,
  ChartTooltip,
} from "@/components/charts";
import { useLanguage } from "@/components/LanguageProvider";

interface OverviewChartProps {
  projectedData: DataPoint[];
}

export const OverviewChart: FC<OverviewChartProps> = ({ projectedData }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();
  const currentYear = new Date().getFullYear();

  const [chartEndYear, setChartEndYear] = useState(currentYear + 5);

  const legendItems: LegendItem[] = useMemo(
    () => createOverviewLegendItems(t, new Set(), true),
    [t],
  );

  const filteredData = useMemo(
    () => filterDataByYearRange(projectedData, chartEndYear),
    [projectedData, chartEndYear],
  );

  return (
    <ChartWrapper>
      <ChartArea>
        <ResponsiveContainer {...getChartContainerProps()}>
          <LineChart
            {...getLineChartProps(
              filteredData,
              undefined,
              getResponsiveChartMargin(isMobile),
            )}
          >
            <XAxis
              {...getXAxisProps(
                "year",
                [1990, 2050],
                [1990, 2015, 2020, currentYear, 2030, 2040, 2050],
              )}
              allowDuplicatedCategory
              tickFormatter={(year) => year}
            />
            <YAxis {...getYAxisProps(currentLanguage)} />
            <Tooltip
              content={
                <ChartTooltip dataView="overview" unit={t("emissionsUnit")} />
              }
              wrapperStyle={{ outline: "none", zIndex: 60 }}
            />
            <ReferenceLine {...getCurrentYearReferenceLineProps(currentYear)} />

            <Line
              type="monotone"
              dataKey="total"
              {...getConsistentLineProps(
                "historical",
                false,
                t("detailPage.graph.historical"),
              )}
            />
            <Line
              type="monotone"
              dataKey="approximated"
              {...getConsistentLineProps(
                "estimated",
                false,
                t("detailPage.graph.estimated"),
              )}
            />
            <Line
              type="monotone"
              dataKey="trend"
              {...getConsistentLineProps(
                "trend",
                false,
                t("detailPage.graph.trend"),
              )}
            />
            <Line
              type="monotone"
              dataKey="carbonLaw"
              {...getConsistentLineProps(
                "paris",
                false,
                t("detailPage.graph.carbonLaw"),
              )}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartArea>

      <ChartFooter>
        <EnhancedLegend items={legendItems} />
        <ChartYearControls
          chartEndYear={chartEndYear}
          setChartEndYear={setChartEndYear}
        />
      </ChartFooter>
    </ChartWrapper>
  );
};
