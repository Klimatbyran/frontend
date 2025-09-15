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
  DynamicLegendContainer,
  ChartYearControls,
  getConsistentLineProps,
  createCategoryLegendItems,
  LEGEND_CONTAINER_CONFIGS,
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

interface CategoriesChartNewProps {
  data: ChartData[];
  companyBaseYear?: number;
  chartEndYear: number;
  setChartEndYear: (year: number) => void;
  shortEndYear: number;
  longEndYear: number;
  hiddenCategories: number[];
  handleCategoryToggle: (categoryId: number) => void;
  getCategoryName: (id: number) => string;
  getCategoryColor: (id: number) => string;
  onYearSelect: (year: number) => void;
  exploreMode?: boolean;
  setExploreMode?: (val: boolean) => void;
}

export const CategoriesChartNew: FC<CategoriesChartNewProps> = ({
  data,
  companyBaseYear,
  chartEndYear,
  setChartEndYear,
  shortEndYear,
  longEndYear,
  hiddenCategories,
  handleCategoryToggle,
  getCategoryName,
  getCategoryColor,
  onYearSelect,
  exploreMode = false,
  setExploreMode,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const currentYear = new Date().getFullYear();
  const isFirstYear = companyBaseYear === data[0]?.year;

  // Filter data to only include points with valid category values
  const filteredData = useMemo(() => {
    return data.filter((d) => {
      // Check if at least one category has a valid value
      return Object.keys(d).some((key) => {
        if (key.startsWith("cat") && d[key as keyof ChartData]) {
          const categoryValue = d[key as keyof ChartData] as any;
          // Category values are direct numbers, not objects with .value property
          return (
            categoryValue !== undefined &&
            categoryValue !== null &&
            categoryValue !== 0
          );
        }
        return false;
      });
    });
  }, [data]);

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

  // Get category keys from filtered data
  const categoryKeys = useMemo(() => {
    if (!filteredData[0]) return [];
    return Object.keys(filteredData[0])
      .filter((key) => key.startsWith("cat") && !key.includes("Interpolated"))
      .sort((a, b) => {
        const aCatId = parseInt(a.replace("cat", ""));
        const bCatId = parseInt(b.replace("cat", ""));
        return aCatId - bCatId;
      });
  }, [filteredData]);

  // Create legend items using shared utility
  const legendItems = useMemo(() => {
    return createCategoryLegendItems(
      categoryKeys,
      new Set(hiddenCategories),
      getCategoryName,
      getCategoryColor,
    );
  }, [categoryKeys, hiddenCategories, getCategoryName, getCategoryColor]);

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

            {/* Category lines */}
            {categoryKeys.map((categoryKey) => {
              const categoryId = parseInt(categoryKey.replace("cat", ""));
              const isInterpolatedKey = `${categoryKey}Interpolated`;
              const isHidden = hiddenCategories.includes(categoryId);

              if (isHidden) return null;

              // Calculate strokeDasharray based on the first data point
              const strokeDasharray = filteredData[0][isInterpolatedKey]
                ? "4 4"
                : "0";
              const categoryColor = getCategoryColor(categoryId);

              return (
                <Line
                  key={categoryKey}
                  type="monotone"
                  dataKey={categoryKey}
                  {...getConsistentLineProps(
                    "category",
                    isMobile,
                    getCategoryName(categoryId),
                    categoryColor,
                  )}
                  strokeDasharray={strokeDasharray}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </ChartArea>

      <ChartFooter>
        <DynamicLegendContainer
          items={legendItems}
          onItemToggle={(itemName) => {
            const categoryKey = categoryKeys.find((key) => {
              const categoryId = parseInt(key.replace("cat", ""));
              return getCategoryName(categoryId) === itemName;
            });
            if (categoryKey) {
              const categoryId = parseInt(categoryKey.replace("cat", ""));
              handleCategoryToggle(categoryId);
            }
          }}
          {...LEGEND_CONTAINER_CONFIGS.interactive}
        />
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
