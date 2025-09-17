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
  SharedTooltip,
} from "@/components/charts";
import { useLanguage } from "@/components/LanguageProvider";
import { isMobile } from "react-device-detect";

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
}

export const ScopesChart: FC<ScopesChartProps> = ({
  data,
  companyBaseYear,
  chartEndYear,
  shortEndYear,
  hiddenScopes,
  handleScopeToggle,
  onYearSelect,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const currentYear = new Date().getFullYear();
  const isFirstYear = companyBaseYear === data[0]?.year;

  const filteredData = useMemo(() => {
    return filterValidScopeData(data);
  }, [data]);

  const ticks = generateChartTicks(
    data[0]?.year || 2000,
    chartEndYear,
    shortEndYear,
    currentYear,
  );

  const handleClick = createChartClickHandler(onYearSelect);

  const legendItems = useMemo(() => {
    return createScopeLegendItems(t, new Set(hiddenScopes));
  }, [t, hiddenScopes]);

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
