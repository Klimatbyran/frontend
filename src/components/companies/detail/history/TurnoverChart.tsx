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
import {
  filterValidTurnoverData,
  getLastTurnoverYear,
} from "@/utils/data/turnoverChartData";

interface TurnoverChartProps {
  data: ChartData[];
  companyBaseYear?: number;
  onYearSelect?: (year: number) => void;
}

export const TurnoverChart: FC<TurnoverChartProps> = ({
  data,
  companyBaseYear,
  onYearSelect,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const currentYear = new Date().getFullYear();

  const filteredData = useMemo(() => filterValidTurnoverData(data), [data]);

  const firstDataYear = filteredData[0]?.year || 2000;
  const lastDataYear = getLastTurnoverYear(filteredData, currentYear);

  const isFirstYear = companyBaseYear === filteredData[0]?.year;

  const legendItems = useMemo((): LegendItem[] => {
    return [
      {
        name: t("companies.overview.turnover"),
        color: "var(--blue-2)",
        isClickable: false,
        isHidden: false,
        isDashed: false,
      },
    ];
  }, [t]);

  const ticks = generateChartTicks(
    firstDataYear,
    lastDataYear,
    lastDataYear,
    currentYear,
  );

  const handleClick = onYearSelect
    ? createChartClickHandler(onYearSelect)
    : undefined;

  if (filteredData.length === 0) {
    return null;
  }

  return (
    <ChartWrapper className="relative">
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

            {currentYear <= lastDataYear && (
              <ReferenceLine
                {...getCurrentYearReferenceLineProps(currentYear)}
              />
            )}

            <Tooltip
              content={
                <ChartTooltip
                  companyBaseYear={companyBaseYear}
                  showUnit={false}
                />
              }
              wrapperStyle={{ outline: "none", zIndex: 60 }}
            />

            <XAxis
              {...getXAxisProps(
                "year",
                [firstDataYear, lastDataYear],
                ticks,
                createCustomTickRenderer(companyBaseYear),
              )}
              type="number"
            />

            <YAxis
              {...getYAxisProps(currentLanguage, [0, "auto"], {
                formatter: formatTurnoverAxisValue,
              })}
            />

            <Line
              type="monotone"
              dataKey="turnover"
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
