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
  createScopeLegendItems,
  LEGEND_CONTAINER_CONFIGS,
  getXAxisProps,
  getYAxisProps,
  getBaseYearReferenceLineProps,
  getChartContainerProps,
  getLineChartProps,
  ChartWrapper,
  ChartArea,
  ChartFooter,
  generateChartTicks,
  createChartClickHandler,
  createCustomTickRenderer,
  filterValidScopeData,
} from "@/components/charts";
import { SharedTooltip } from "@/components/charts/SharedTooltip";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsoluteCompact } from "@/utils/formatting/localization";
import { isMobile } from "react-device-detect";

interface ScopesChartNewProps {
  data: ChartData[];
  companyBaseYear?: number;
  chartEndYear: number;
  setChartEndYear: (year: number) => void;
  shortEndYear: number;
  longEndYear: number;
  hiddenScopes: Array<"scope1" | "scope2" | "scope3">;
  handleScopeToggle: (scope: "scope1" | "scope2" | "scope3") => void;
  onYearSelect: (year: number) => void;
  exploreMode?: boolean;
  setExploreMode?: (val: boolean) => void;
}

const scopeConfig = {
  scope1: {
    dataKey: "scope1.value",
    stroke: "var(--pink-3)",
    name: "Scope 1",
  },
  scope2: {
    dataKey: "scope2.value",
    stroke: "var(--green-2)",
    name: "Scope 2",
  },
  scope3: {
    dataKey: "scope3.value",
    stroke: "var(--blue-2)",
    name: "Scope 3",
  },
} as const;

export const ScopesChartNew: FC<ScopesChartNewProps> = ({
  data,
  companyBaseYear,
  chartEndYear,
  setChartEndYear,
  shortEndYear,
  longEndYear,
  hiddenScopes,
  handleScopeToggle,
  onYearSelect,
  exploreMode = false,
  setExploreMode,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const currentYear = new Date().getFullYear();
  const isFirstYear = companyBaseYear === data[0]?.year;

  // Filter data to only include points with valid scope values
  const filteredData = useMemo(() => {
    return filterValidScopeData(data);
  }, [data]);

  // Generate ticks using shared utility
  const ticks = generateChartTicks(
    data[0]?.year || 2000,
    chartEndYear,
    shortEndYear,
    currentYear,
  );

  const handleClick = createChartClickHandler(onYearSelect);

  // Create legend items using shared utility
  const legendItems = useMemo(() => {
    return createScopeLegendItems(t, new Set(hiddenScopes));
  }, [t, hiddenScopes]);

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
                ticks,
                createCustomTickRenderer(companyBaseYear),
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

            {/* Scope lines */}
            {!hiddenScopes.includes("scope1") && (
              <Line
                type="monotone"
                dataKey="scope1.value"
                {...getConsistentLineProps(
                  "scope",
                  isMobile,
                  "Scope 1",
                  "var(--pink-3)",
                )}
              />
            )}
            {!hiddenScopes.includes("scope2") && (
              <Line
                type="monotone"
                dataKey="scope2.value"
                {...getConsistentLineProps(
                  "scope",
                  isMobile,
                  "Scope 2",
                  "var(--green-2)",
                )}
              />
            )}
            {!hiddenScopes.includes("scope3") && (
              <Line
                type="monotone"
                dataKey="scope3.value"
                {...getConsistentLineProps(
                  "scope",
                  isMobile,
                  "Scope 3",
                  "var(--blue-2)",
                )}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </ChartArea>

      <ChartFooter>
        <DynamicLegendContainer
          items={legendItems}
          onItemToggle={(itemName) => {
            const scope = Object.keys(scopeConfig).find(
              (key) =>
                scopeConfig[key as keyof typeof scopeConfig].name === itemName,
            ) as "scope1" | "scope2" | "scope3";
            if (scope) {
              handleScopeToggle(scope);
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
