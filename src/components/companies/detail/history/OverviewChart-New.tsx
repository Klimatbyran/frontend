import { FC, useMemo } from "react";
import {
  LineChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { ChartData } from "@/types/emissions";
import {
  ChartYearControls,
  getConsistentLineProps,
  EnhancedLegend,
  createOverviewLegendItems,
  getXAxisProps,
  getYAxisProps,
  getBaseYearReferenceLineProps,
  getChartContainerProps,
  getLineChartProps,
  ChartWrapper,
  ChartArea,
  ChartFooter,
} from "@/components/charts";
import { SharedTooltip } from "@/components/charts/SharedTooltip";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsoluteCompact } from "@/utils/formatting/localization";
import { isMobile } from "react-device-detect";

interface OverviewChartNewProps {
  data: ChartData[];
  companyBaseYear?: number;
  chartEndYear: number;
  setChartEndYear: (year: number) => void;
  shortEndYear: number;
  longEndYear: number;
  approximatedData?: ChartData[] | null;
  onYearSelect: (year: number) => void;
  exploreMode?: boolean;
  setExploreMode?: (val: boolean) => void;
}

export const OverviewChartNew: FC<OverviewChartNewProps> = ({
  data,
  companyBaseYear,
  chartEndYear,
  setChartEndYear,
  shortEndYear,
  longEndYear,
  approximatedData,
  onYearSelect,
  exploreMode = false,
  setExploreMode,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const currentYear = new Date().getFullYear();
  const isFirstYear = companyBaseYear === data[0]?.year;

  // Filter data to only include points with valid total values
  const filteredData = useMemo(() => {
    return data.filter((d) => d.total !== undefined && d.total !== null);
  }, [data]);

  // Create legend items using shared utility
  const legendItems = useMemo(() => {
    const hiddenItems = new Set<string>();
    if (!approximatedData) {
      hiddenItems.add("approximated");
      hiddenItems.add("carbonLaw");
    }
    return createOverviewLegendItems(t, hiddenItems, false);
  }, [t, approximatedData]);

  // Generate ticks based on the current end year
  const generateTicks = () => {
    const baseTicks = [data[0]?.year || 2000, 2020, currentYear, 2025];
    if (chartEndYear === shortEndYear) {
      return [...baseTicks, shortEndYear];
    } else {
      return [...baseTicks, shortEndYear, 2030, 2040, 2050];
    }
  };

  const handleClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const year = data.activePayload[0].payload.year;
      onYearSelect(year);
    }
  };

  return (
    <ChartWrapper>
      <ChartArea>
        <ResponsiveContainer {...getChartContainerProps()}>
          <LineChart {...getLineChartProps(filteredData, handleClick)}>
            {companyBaseYear && (
              <ReferenceLine
                {...getBaseYearReferenceLineProps(
                  companyBaseYear,
                  isFirstYear,
                  t,
                )}
              />
            )}

            <Tooltip
              content={
                <SharedTooltip
                  companyBaseYear={companyBaseYear}
                  unit={t("companies.tooltip.tonsCO2e")}
                />
              }
              wrapperStyle={{ outline: "none" }}
            />

            <XAxis
              {...getXAxisProps(
                "year",
                [data[0]?.year || 2000, chartEndYear],
                generateTicks(),
                ({ x, y, payload }) => {
                  const isBaseYear = payload.value === companyBaseYear;
                  return (
                    <text
                      x={x - 15}
                      y={y + 10}
                      fontSize={12}
                      fill={`${isBaseYear ? "white" : "var(--grey)"}`}
                      fontWeight={`${isBaseYear ? "bold" : "normal"}`}
                    >
                      {payload.value}
                    </text>
                  );
                },
              )}
              type="number"
            />

            <YAxis
              {...getYAxisProps(currentLanguage)}
              tick={({ x, y, payload }) => (
                <text x={x - 10} y={y + 5} fontSize={12} fill="var(--grey)">
                  {formatEmissionsAbsoluteCompact(
                    payload.value,
                    currentLanguage,
                  )}
                </text>
              )}
            />

            {/* Main total emissions line */}
            <Line
              type="monotone"
              dataKey="total"
              {...getConsistentLineProps(
                "historical",
                isMobile,
                t("companies.emissionsHistory.totalEmissions"),
              )}
              connectNulls={false}
            />

            {/* Approximated data lines */}
            {approximatedData && (
              <>
                <ReferenceLine
                  x={currentYear}
                  stroke="var(--orange-2)"
                  strokeWidth={1}
                  label={{
                    value: currentYear,
                    position: "top",
                    fill: "var(--orange-2)",
                    fontSize: 12,
                    fontWeight: "normal",
                  }}
                />
                <Line
                  type="linear"
                  dataKey="approximated"
                  data={approximatedData}
                  {...getConsistentLineProps(
                    "estimated",
                    isMobile,
                    t("companies.emissionsHistory.approximated"),
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="carbonLaw"
                  data={approximatedData}
                  {...getConsistentLineProps(
                    "paris",
                    isMobile,
                    t("companies.emissionsHistory.carbonLaw"),
                  )}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </ChartArea>

      <ChartFooter>
        <EnhancedLegend items={legendItems} />
        <ChartYearControls
          chartEndYear={chartEndYear}
          shortEndYear={shortEndYear}
          longEndYear={longEndYear}
          setChartEndYear={setChartEndYear}
          exploreMode={exploreMode}
          setExploreMode={setExploreMode}
        />
      </ChartFooter>
    </ChartWrapper>
  );
};
