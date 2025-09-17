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
  getResponsiveChartMargin,
  ChartWrapper,
  ChartArea,
  ChartFooter,
  generateChartTicks,
  createChartClickHandler,
  createCustomTickRenderer,
  filterValidTotalData,
  SharedTooltip,
} from "@/components/charts";
import { useLanguage } from "@/components/LanguageProvider";
import { isMobile } from "react-device-detect";

interface OverviewChartProps {
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

export const OverviewChart: FC<OverviewChartProps> = ({
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

  const filteredData = useMemo(() => {
    return filterValidTotalData(data);
  }, [data]);

  const isFirstYear = companyBaseYear === filteredData[0]?.year;

  const legendItems = useMemo(() => {
    const hiddenItems = new Set<string>();
    if (!approximatedData) {
      hiddenItems.add("approximated");
      hiddenItems.add("carbonLaw");
    }
    return createOverviewLegendItems(t, hiddenItems, false);
  }, [t, approximatedData]);

  const ticks = generateChartTicks(
    filteredData[0]?.year || 2000,
    chartEndYear,
    shortEndYear,
    currentYear,
  );

  const handleClick = createChartClickHandler(onYearSelect);

  return (
    <ChartWrapper>
      <ChartArea>
        <ResponsiveContainer {...getChartContainerProps()}>
          <LineChart
            {...getLineChartProps(
              filteredData,
              handleClick,
              getResponsiveChartMargin(isMobile),
            )}
          >
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
                [filteredData[0]?.year || 2000, chartEndYear],
                ticks,
                createCustomTickRenderer(companyBaseYear),
              )}
              type="number"
            />

            <YAxis {...getYAxisProps(currentLanguage)} />

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
