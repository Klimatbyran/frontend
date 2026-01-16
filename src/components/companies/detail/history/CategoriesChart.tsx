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
  DynamicLegendContainer,
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
  ChartTooltip,
  getIntensityValue,
  getLastDataYear,
  getEmissionsUnit,
  ChartMode,
} from "@/components/charts";
import { useLanguage } from "@/components/LanguageProvider";

interface CategoriesChartProps {
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
  chartMode?: ChartMode;
}

export const CategoriesChart: FC<CategoriesChartProps> = ({
  data,
  companyBaseYear,
  shortEndYear,
  hiddenCategories,
  handleCategoryToggle,
  getCategoryName,
  getCategoryColor,
  onYearSelect,
  chartMode = "absolute",
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const currentYear = new Date().getFullYear();
  const isFirstYear = companyBaseYear === data[0]?.year;

  const filteredData = useMemo(() => {
    return filterValidCategoryData(data);
  }, [data]);

  const lastDataYear = getLastDataYear(filteredData, shortEndYear);
  const ticks = generateChartTicks(
    filteredData[0]?.year || 2000,
    lastDataYear,
    lastDataYear,
    currentYear,
  );

  const handleClick = createChartClickHandler(onYearSelect);

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
                <ChartTooltip
                  companyBaseYear={companyBaseYear}
                  unit={getEmissionsUnit(chartMode, t)}
                />
              }
              wrapperStyle={{ outline: "none", zIndex: 60 }}
            />

            <XAxis
              {...getXAxisProps(
                "year",
                [filteredData[0]?.year || 2000, lastDataYear],
                ticks,
                createCustomTickRenderer(companyBaseYear),
              )}
              type="number"
            />

            <YAxis {...getYAxisProps(currentLanguage)} />

            {/* Category lines */}
            {categoryKeys.map((categoryKey) => {
              const categoryId = parseInt(categoryKey.replace("cat", ""));
              const isHidden = hiddenCategories.includes(categoryId);

              if (isHidden) return null;

              const categoryColor = getCategoryColor(categoryId);
              const dataKey =
                chartMode === "revenueIntensity"
                  ? (d: ChartData) =>
                      getIntensityValue(d[categoryKey] as number, d.turnover)
                  : categoryKey;

              return (
                <Line
                  key={categoryKey}
                  type="monotone"
                  dataKey={dataKey}
                  {...getConsistentLineProps(
                    "category",
                    isMobile,
                    getCategoryName(categoryId),
                    categoryColor,
                  )}
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
      </ChartFooter>
    </ChartWrapper>
  );
};
