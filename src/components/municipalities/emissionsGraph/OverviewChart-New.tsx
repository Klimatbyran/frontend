import { FC, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";
import { DataPoint } from "@/types/municipality";
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
  SharedTooltip,
} from "@/components/charts";
import { XAxis, YAxis } from "recharts";
import { useLanguage } from "@/components/LanguageProvider";

interface OverviewChartNewProps {
  projectedData: DataPoint[];
}

export const OverviewChartNew: FC<OverviewChartNewProps> = ({
  projectedData,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();
  const currentYear = new Date().getFullYear();

  // State for year range control - default to 2030 (current year + 5)
  const [chartEndYear, setChartEndYear] = useState(
    new Date().getFullYear() + 5,
  );

  // Create legend items using shared utility
  const legendItems: LegendItem[] = useMemo(() => {
    return createOverviewLegendItems(t, new Set(), true);
  }, [t]);

  // Filter data based on chart end year
  const filteredData = useMemo(() => {
    return filterDataByYearRange(projectedData, chartEndYear);
  }, [projectedData, chartEndYear]);

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
              allowDuplicatedCategory={true}
              tickFormatter={(year) => year}
            />
            <YAxis {...getYAxisProps(currentLanguage)} />

            <Tooltip
              content={
                <SharedTooltip
                  dataView="overview"
                  unit={t("emissionsUnitCO2")}
                />
              }
              wrapperStyle={{ outline: "none" }}
            />

            {/* Current year reference line */}
            <ReferenceLine
              {...getCurrentYearReferenceLineProps(currentYear, t)}
            />

            {/* Historical line */}
            <Line
              type="monotone"
              dataKey="total"
              {...getConsistentLineProps(
                "historical",
                false,
                t("municipalities.graph.historical"),
              )}
            />

            {/* Estimated line */}
            <Line
              type="monotone"
              dataKey="approximated"
              {...getConsistentLineProps(
                "estimated",
                false,
                t("municipalities.graph.estimated"),
              )}
            />

            {/* Trend line */}
            <Line
              type="monotone"
              dataKey="trend"
              {...getConsistentLineProps(
                "trend",
                false,
                t("municipalities.graph.trend"),
              )}
            />

            {/* Carbon Law line */}
            <Line
              type="monotone"
              dataKey="carbonLaw"
              {...getConsistentLineProps(
                "paris",
                false,
                t("municipalities.graph.carbonLaw"),
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
