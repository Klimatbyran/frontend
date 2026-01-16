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
import { isMobile } from "react-device-detect";
import { ChartData } from "@/types/emissions";
import {
  ChartYearControls,
  getConsistentLineProps,
  EnhancedLegend,
  createOverviewLegendItems,
  getXAxisProps,
  getYAxisProps,
  getBaseYearReferenceLineProps,
  getCurrentYearReferenceLineProps,
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
  mergeChartDataWithApproximated,
  ChartTooltip,
  getIntensityValue,
  getLastDataYear,
  getEmissionsUnit,
  ChartMode,
} from "@/components/charts";
import { useLanguage } from "@/components/LanguageProvider";

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
  chartMode?: ChartMode;
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
  chartMode = "absolute",
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const currentYear = new Date().getFullYear();

  const filteredData = useMemo(() => {
    return filterValidTotalData(data);
  }, [data]);

  const firstDataYear = filteredData[0]?.year || 2000;

  // Last year with actual data (for revenue intensity mode - no future projections)
  const lastDataYear = getLastDataYear(filteredData, currentYear);

  // The effective end year depends on mode
  const effectiveEndYear =
    chartMode === "revenueIntensity" ? lastDataYear : chartEndYear;

  // Merge data similar to municipality structure for tooltip compatibility
  const chartData = useMemo(() => {
    const merged = mergeChartDataWithApproximated(
      filteredData,
      approximatedData,
    );
    // Filter to only include data from firstDataYear onwards to prevent empty space
    const fromFirstYear = merged.filter((d) => d.year >= firstDataYear);
    if (chartMode === "revenueIntensity") {
      return fromFirstYear.filter((d) => d.year <= lastDataYear);
    }
    return fromFirstYear;
  }, [filteredData, approximatedData, firstDataYear, chartMode, lastDataYear]);

  const isFirstYear = companyBaseYear === filteredData[0]?.year;

  const legendItems = useMemo(() => {
    const hiddenItems = new Set<string>();
    if (!approximatedData) {
      hiddenItems.add("approximated");
      hiddenItems.add("trend");
      hiddenItems.add("carbonLaw");
    }
    return createOverviewLegendItems(t, hiddenItems, false);
  }, [t, approximatedData]);

  const ticks = generateChartTicks(
    firstDataYear,
    effectiveEndYear,
    chartMode === "revenueIntensity" ? lastDataYear : shortEndYear,
    currentYear,
  );

  const handleClick = createChartClickHandler(onYearSelect);

  return (
    <ChartWrapper>
      <ChartArea>
        <ResponsiveContainer {...getChartContainerProps()}>
          <LineChart
            {...getLineChartProps(
              chartData,
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

            {/* Current year reference line - only show if within chart domain */}
            {currentYear <= effectiveEndYear && (
              <ReferenceLine
                {...getCurrentYearReferenceLineProps(currentYear)}
              />
            )}

            <Tooltip
              content={
                <ChartTooltip
                  dataView="overview"
                  companyBaseYear={companyBaseYear}
                  unit={getEmissionsUnit(chartMode, t)}
                />
              }
              wrapperStyle={{ outline: "none", zIndex: 60 }}
            />

            <XAxis
              {...getXAxisProps(
                "year",
                [firstDataYear, effectiveEndYear],
                ticks,
                createCustomTickRenderer(companyBaseYear),
              )}
              type="number"
            />

            {chartMode === "revenueIntensity" ? (
              <YAxis
                {...getYAxisProps(currentLanguage, [0, "auto"], {
                  yAxisId: "revenueIntensity",
                })}
              />
            ) : (
              <>
                <YAxis
                  {...getYAxisProps(currentLanguage, [0, "auto"], {
                    yAxisId: "left",
                  })}
                />
                <YAxis
                  {...getYAxisProps(currentLanguage, [0, "auto"], {
                    orientation: "right",
                    yAxisId: "right",
                    formatter: (value) =>
                      new Intl.NumberFormat(currentLanguage, {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(value),
                  })}
                />
              </>
            )}

            {/* Main total emissions line */}
            {chartMode === "absolute" && (
              <Line
                type="monotone"
                dataKey="total"
                yAxisId="left"
                {...getConsistentLineProps(
                  "historical",
                  isMobile,
                  t("companies.emissionsHistory.totalEmissions"),
                )}
                connectNulls={false}
              />
            )}

            {/* Turnover line */}
            {chartMode === "absolute" && (
              <Line
                type="monotone"
                dataKey="turnover"
                yAxisId="right"
                {...getConsistentLineProps(
                  "turnover",
                  isMobile,
                  t("companies.overview.turnover"),
                )}
                connectNulls={true}
              />
            )}

            {/* Revenue intensity line */}
            {chartMode === "revenueIntensity" && (
              <Line
                type="monotone"
                dataKey={(d: ChartData) =>
                  getIntensityValue(d.total, d.turnover)
                }
                yAxisId="revenueIntensity"
                {...getConsistentLineProps(
                  "intensity",
                  isMobile,
                  t("companies.emissionsHistory.intensity"),
                )}
                connectNulls={true}
              />
            )}

            {/* Approximated data lines */}
            {approximatedData && chartMode === "absolute" && (
              <>
                <Line
                  type="linear"
                  dataKey="approximated"
                  yAxisId="left"
                  {...getConsistentLineProps(
                    "estimated",
                    isMobile,
                    t("companies.emissionsHistory.approximated"),
                    "var(--grey)",
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="trend"
                  yAxisId="left"
                  {...getConsistentLineProps(
                    "trend",
                    isMobile,
                    t("companies.emissionsHistory.trend"),
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="carbonLaw"
                  yAxisId="left"
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
        {chartMode === "absolute" && (
          <ChartYearControls
            chartEndYear={chartEndYear}
            shortEndYear={shortEndYear}
            longEndYear={longEndYear}
            setChartEndYear={setChartEndYear}
            exploreMode={exploreMode}
            setExploreMode={setExploreMode}
          />
        )}
      </ChartFooter>
    </ChartWrapper>
  );
};
