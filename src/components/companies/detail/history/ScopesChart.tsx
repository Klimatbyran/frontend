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
  createScopeLegendItems,
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
  filterValidScopeData,
  ChartTooltip,
  getIntensityValue,
  getLastDataYear,
  getEmissionsUnit,
  ChartMode,
} from "@/components/charts";
import { useLanguage } from "@/components/LanguageProvider";

interface ScopesChartProps {
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
  chartMode?: ChartMode;
}

export const ScopesChart: FC<ScopesChartProps> = ({
  data,
  companyBaseYear,
  shortEndYear,
  hiddenScopes,
  handleScopeToggle,
  onYearSelect,
  chartMode = "absolute",
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const currentYear = new Date().getFullYear();
  const isFirstYear = companyBaseYear === data[0]?.year;

  const filteredData = useMemo(() => {
    return filterValidScopeData(data);
  }, [data]);

  const lastDataYear = getLastDataYear(filteredData, shortEndYear);
  const ticks = generateChartTicks(
    filteredData[0]?.year || 2000,
    lastDataYear,
    lastDataYear,
    currentYear,
  );

  const handleClick = createChartClickHandler(onYearSelect);

  const legendItems = useMemo(() => {
    return createScopeLegendItems(t, new Set(hiddenScopes));
  }, [t, hiddenScopes]);

  const getScopeDataKey = (scope: "scope1" | "scope2" | "scope3") =>
    chartMode === "revenueIntensity"
      ? (d: ChartData) => getIntensityValue(d[scope]?.value, d.turnover)
      : `${scope}.value`;

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

            {!hiddenScopes.includes("scope1") && (
              <Line
                type="monotone"
                dataKey={getScopeDataKey("scope1")}
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
                dataKey={getScopeDataKey("scope2")}
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
                dataKey={getScopeDataKey("scope3")}
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
            // Map translated names back to scope keys
            const scopeMap: Record<string, "scope1" | "scope2" | "scope3"> = {
              [t("companies.emissionsHistory.scope1")]: "scope1",
              [t("companies.emissionsHistory.scope2")]: "scope2",
              [t("companies.emissionsHistory.scope3")]: "scope3",
            };
            const scope = scopeMap[itemName];
            if (scope) {
              handleScopeToggle(scope);
            }
          }}
          {...LEGEND_CONTAINER_CONFIGS.interactive}
        />
      </ChartFooter>
    </ChartWrapper>
  );
};
