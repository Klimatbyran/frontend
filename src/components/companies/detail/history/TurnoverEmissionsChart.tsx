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
  getConsistentLineProps,
  EnhancedLegend,
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
  ChartTooltip,
  formatTurnoverAxisValue,
} from "@/components/charts";
import { useLanguage } from "@/components/LanguageProvider";
import { LegendItem } from "@/types/charts";
import { getBaseYearChartSettings } from "@/utils/data/turnoverChartData";

interface TurnoverEmissionsChartProps {
  displayData: ChartData[];
  companyBaseYear?: number;
  onYearSelect?: (year: number) => void;
}

export const TurnoverEmissionsChart: FC<TurnoverEmissionsChartProps> = ({
  displayData,
  companyBaseYear,
  onYearSelect,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const currentYear = new Date().getFullYear();

  const baseYearSettings = useMemo(
    () => getBaseYearChartSettings(displayData, companyBaseYear),
    [displayData, companyBaseYear],
  );

  const firstDataYear = displayData[0]?.year ?? currentYear;
  const lastDataYear = displayData[displayData.length - 1]?.year ?? currentYear;

  const legendItems = useMemo(
    (): LegendItem[] => [
      {
        name: t("companies.emissionsHistory.totalEmissions"),
        color: "white",
        isClickable: false,
        isHidden: false,
        isDashed: false,
      },
      {
        name: t("companies.overview.turnover"),
        color: "var(--blue-2)",
        isClickable: false,
        isHidden: false,
        isDashed: false,
      },
    ],
    [t],
  );

  const ticks = generateChartTicks(
    firstDataYear,
    lastDataYear,
    lastDataYear,
    currentYear,
  );

  const handleClick = onYearSelect
    ? createChartClickHandler(onYearSelect)
    : undefined;

  if (displayData.length === 0) {
    return null;
  }

  const { showBaseYear, baseYear, isFirstYear } = baseYearSettings;

  return (
    <ChartWrapper className="relative">
      <ChartArea>
        <ResponsiveContainer {...getChartContainerProps()}>
          <LineChart
            {...getLineChartProps(
              displayData,
              handleClick,
              getResponsiveChartMargin(isMobile),
            )}
          >
            {showBaseYear && baseYear != null && (
              <ReferenceLine
                {...getBaseYearReferenceLineProps(baseYear, isFirstYear, t)}
              />
            )}

            {currentYear <= lastDataYear && (
              <ReferenceLine
                {...getCurrentYearReferenceLineProps(currentYear)}
              />
            )}

            <Tooltip
              content={
                <ChartTooltip
                  companyBaseYear={baseYear}
                  unit={t("companies.tooltip.tonsCO2e")}
                />
              }
              wrapperStyle={{ outline: "none", zIndex: 60 }}
            />

            <XAxis
              {...getXAxisProps(
                "year",
                [firstDataYear, lastDataYear],
                ticks,
                createCustomTickRenderer(baseYear),
              )}
              type="number"
            />

            <YAxis
              yAxisId="left"
              {...getYAxisProps(currentLanguage, [0, "auto"], {
                yAxisId: "left",
              })}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              {...getYAxisProps(currentLanguage, [0, "auto"], {
                orientation: "right",
                yAxisId: "right",
                formatter: formatTurnoverAxisValue,
              })}
            />

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

            <Line
              type="monotone"
              dataKey="turnover"
              yAxisId="right"
              {...getConsistentLineProps(
                "turnover",
                isMobile,
                t("companies.overview.turnover"),
              )}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartArea>

      <ChartFooter>
        <EnhancedLegend items={legendItems} />
      </ChartFooter>
    </ChartWrapper>
  );
};
