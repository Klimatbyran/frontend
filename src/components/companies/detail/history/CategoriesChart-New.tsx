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
  getResponsiveChartMargin,
  ChartWrapper,
  ChartArea,
  ChartFooter,
  generateChartTicks,
  createChartClickHandler,
  createCustomTickRenderer,
  filterValidCategoryData,
} from "@/components/charts";
import { SharedTooltip } from "@/components/charts/SharedTooltip";
import { useLanguage } from "@/components/LanguageProvider";
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
    return filterValidCategoryData(data);
  }, [data]);

  // Generate ticks using shared utility
  const ticks = generateChartTicks(
    data[0]?.year || 2000,
    chartEndYear,
    shortEndYear,
    currentYear,
  );

  const handleClick = createChartClickHandler(onYearSelect);

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
                [data[0]?.year || 2000, chartEndYear],
                ticks,
                createCustomTickRenderer(companyBaseYear),
              )}
              type="number"
            />

            <YAxis {...getYAxisProps(currentLanguage)} />

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
