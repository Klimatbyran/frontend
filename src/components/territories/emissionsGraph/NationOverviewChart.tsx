import { FC, useState, useMemo } from "react";
import {
  ComposedChart,
  Line,
  Area,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { DataPoint } from "@/types/emissions";
import { useScreenSize } from "@/hooks/useScreenSize";
import {
  EnhancedLegend,
  ChartYearControls,
  LegendItem,
  getConsistentLineProps,
  getXAxisProps,
  getYAxisProps,
  getCurrentYearReferenceLineProps,
  getChartContainerProps,
  getComposedChartProps,
  getResponsiveChartMargin,
  ChartWrapper,
  ChartArea,
  ChartFooter,
  filterDataByYearRange,
  ChartTooltip,
} from "@/components/charts";
import { LEGEND_CONFIGS } from "@/components/charts/historicEmissions/styles/legendStyles";
import { useLanguage } from "@/components/LanguageProvider";

interface StackedAreasProps {
  hasBiogenic: boolean;
  hasConsumption: boolean;
  hasOilExport: boolean;
  t: (key: string) => string;
}

function StackedAreas({
  hasBiogenic,
  hasConsumption,
  hasOilExport,
  t,
}: StackedAreasProps) {
  const areaProps = {
    type: "monotone" as const,
    stackId: "main",
    strokeWidth: 2,
    dot: false as const,
    activeDot: { r: 5 },
    connectNulls: false,
    fillOpacity: 0.05,
  };
  return (
    <>
      {/* Bottom of stack */}
      <Area
        {...areaProps}
        dataKey="total"
        name={t("detailPage.graph.fossilEmissions")}
        stroke={LEGEND_CONFIGS.fossilEmissions.color}
        fill={LEGEND_CONFIGS.fossilEmissions.color}
      />
      {hasBiogenic && (
        <Area
          {...areaProps}
          dataKey="biogenicEmissions"
          name={t("detailPage.graph.biogenicEmissions")}
          stroke={LEGEND_CONFIGS.biogenic.color}
          fill={LEGEND_CONFIGS.biogenic.color}
        />
      )}
      {hasOilExport && (
        <Area
          {...areaProps}
          dataKey="exportOfOilProductsEmissions"
          name={t("detailPage.graph.exportOfOilProductsEmissions")}
          stroke={LEGEND_CONFIGS.oilExport.color}
          fill={LEGEND_CONFIGS.oilExport.color}
        />
      )}
      {hasConsumption && (
        <Area
          {...areaProps}
          dataKey="consumptionAbroadEmissions"
          name={t("detailPage.graph.consumptionAbroadEmissions")}
          stroke={LEGEND_CONFIGS.consumption.color}
          fill={LEGEND_CONFIGS.consumption.color}
        />
      )}
      {/* Top of stack */}
    </>
  );
}

interface ApproximatedStackedAreasProps {
  hasApproxBiogenic: boolean;
  hasApproxConsumption: boolean;
  hasApproxOilExport: boolean;
  t: (key: string) => string;
}

/** Estimated emissions by category (API approximated* fields), same stack order as historical. */
function ApproximatedStackedAreas({
  hasApproxBiogenic,
  hasApproxConsumption,
  hasApproxOilExport,
  t,
}: ApproximatedStackedAreasProps) {
  const areaProps = {
    type: "monotone" as const,
    stackId: "approximated",
    strokeWidth: 2,
    strokeDasharray: "4 4" as const,
    dot: false as const,
    activeDot: { r: 5 },
    connectNulls: false,
    fillOpacity: 0.05,
  };
  return (
    <>
      <Area
        {...areaProps}
        dataKey="approximatedFossil"
        name={t("detailPage.graph.estimatedFossilEmissions")}
        stroke={LEGEND_CONFIGS.fossilEmissions.color}
        fill={LEGEND_CONFIGS.fossilEmissions.color}
      />
      {hasApproxBiogenic && (
        <Area
          {...areaProps}
          dataKey="approximatedBiogenicEmissions"
          name={t("detailPage.graph.estimatedBiogenicEmissions")}
          stroke={LEGEND_CONFIGS.biogenic.color}
          fill={LEGEND_CONFIGS.biogenic.color}
        />
      )}
      {hasApproxOilExport && (
        <Area
          {...areaProps}
          dataKey="approximatedExportOfOilProductsEmissions"
          name={t("detailPage.graph.estimatedExportOfOilProductsEmissions")}
          stroke={LEGEND_CONFIGS.oilExport.color}
          fill={LEGEND_CONFIGS.oilExport.color}
        />
      )}
      {hasApproxConsumption && (
        <Area
          {...areaProps}
          dataKey="approximatedConsumptionAbroadEmissions"
          name={t("detailPage.graph.estimatedConsumptionAbroadEmissions")}
          stroke={LEGEND_CONFIGS.consumption.color}
          fill={LEGEND_CONFIGS.consumption.color}
        />
      )}
    </>
  );
}

function buildLegendItems(
  t: (key: string) => string,
  flags: {
    hasBiogenic: boolean;
    hasConsumption: boolean;
    hasOilExport: boolean;
  },
  approxFlags: {
    hasApproximatedStack: boolean;
    hasApproxBiogenic: boolean;
    hasApproxConsumption: boolean;
    hasApproxOilExport: boolean;
  },
): LegendItem[] {
  const items: LegendItem[] = [
    {
      name: t("detailPage.graph.fossilEmissions"),
      color: LEGEND_CONFIGS.fossilEmissions.color,
      isClickable: false,
      isHidden: false,
      isDashed: false,
    },
  ];
  if (flags.hasBiogenic) {
    items.push({
      name: t("detailPage.graph.biogenicEmissions"),
      color: LEGEND_CONFIGS.biogenic.color,
      isClickable: false,
      isHidden: false,
      isDashed: false,
    });
  }
  if (flags.hasOilExport) {
    items.push({
      name: t("detailPage.graph.exportOfOilProductsEmissions"),
      color: LEGEND_CONFIGS.oilExport.color,
      isClickable: false,
      isHidden: false,
      isDashed: false,
    });
  }
  if (flags.hasConsumption) {
    items.push({
      name: t("detailPage.graph.consumptionAbroadEmissions"),
      color: LEGEND_CONFIGS.consumption.color,
      isClickable: false,
      isHidden: false,
      isDashed: false,
    });
  }
  if (approxFlags.hasApproximatedStack) {
    items.push(
      {
        name: t("detailPage.graph.estimatedFossilEmissions"),
        color: LEGEND_CONFIGS.fossilEmissions.color,
        isClickable: false,
        isHidden: false,
        isDashed: true,
      },
      ...(approxFlags.hasApproxBiogenic
        ? [
            {
              name: t("detailPage.graph.estimatedBiogenicEmissions"),
              color: LEGEND_CONFIGS.biogenic.color,
              isClickable: false,
              isHidden: false,
              isDashed: true,
            } satisfies LegendItem,
          ]
        : []),
      ...(approxFlags.hasApproxOilExport
        ? [
            {
              name: t("detailPage.graph.estimatedExportOfOilProductsEmissions"),
              color: LEGEND_CONFIGS.oilExport.color,
              isClickable: false,
              isHidden: false,
              isDashed: true,
            } satisfies LegendItem,
          ]
        : []),
      ...(approxFlags.hasApproxConsumption
        ? [
            {
              name: t("detailPage.graph.estimatedConsumptionAbroadEmissions"),
              color: LEGEND_CONFIGS.consumption.color,
              isClickable: false,
              isHidden: false,
              isDashed: true,
            } satisfies LegendItem,
          ]
        : []),
    );
  } else {
    items.push({
      name: t("detailPage.graph.estimated"),
      color: LEGEND_CONFIGS.estimated.color,
      isClickable: false,
      isHidden: false,
      isDashed: true,
    });
  }
  items.push(
    {
      name: t("detailPage.graph.trend"),
      color: LEGEND_CONFIGS.trend.color,
      isClickable: false,
      isHidden: false,
      isDashed: true,
    },
    {
      name: t("detailPage.graph.carbonLaw"),
      color: LEGEND_CONFIGS.paris.color,
      isClickable: false,
      isHidden: false,
      isDashed: true,
    },
  );
  return items;
}

interface NationOverviewChartProps {
  projectedData: DataPoint[];
}

export const NationOverviewChart: FC<NationOverviewChartProps> = ({
  projectedData,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();
  const currentYear = new Date().getFullYear();

  const [chartEndYear, setChartEndYear] = useState(currentYear + 5);

  const flags = {
    hasBiogenic: projectedData.some((d) => d.biogenicEmissions !== undefined),
    hasConsumption: projectedData.some(
      (d) => d.consumptionAbroadEmissions !== undefined,
    ),
    hasOilExport: projectedData.some(
      (d) => d.exportOfOilProductsEmissions !== undefined,
    ),
  };

  const approxStackFlags = {
    hasApproxFossil: projectedData.some(
      (d) => d.approximatedFossil !== undefined,
    ),
    hasApproxBiogenic: projectedData.some(
      (d) => d.approximatedBiogenicEmissions !== undefined,
    ),
    hasApproxConsumption: projectedData.some(
      (d) => d.approximatedConsumptionAbroadEmissions !== undefined,
    ),
    hasApproxOilExport: projectedData.some(
      (d) => d.approximatedExportOfOilProductsEmissions !== undefined,
    ),
  };
  const hasApproximatedStack = approxStackFlags.hasApproxFossil;

  const legendItems = useMemo(
    () =>
      buildLegendItems(t, flags, {
        hasApproximatedStack,
        hasApproxBiogenic: approxStackFlags.hasApproxBiogenic,
        hasApproxConsumption: approxStackFlags.hasApproxConsumption,
        hasApproxOilExport: approxStackFlags.hasApproxOilExport,
      }),
    [
      t,
      flags.hasBiogenic,
      flags.hasConsumption,
      flags.hasOilExport,
      hasApproximatedStack,
      approxStackFlags.hasApproxBiogenic,
      approxStackFlags.hasApproxConsumption,
      approxStackFlags.hasApproxOilExport,
    ],
  );

  const filteredData = useMemo(
    () => filterDataByYearRange(projectedData, chartEndYear),
    [projectedData, chartEndYear],
  );

  return (
    <ChartWrapper>
      <ChartArea>
        <ResponsiveContainer {...getChartContainerProps()}>
          <ComposedChart
            {...getComposedChartProps(
              filteredData,
              undefined,
              getResponsiveChartMargin(isMobile),
            )}
          >
            <XAxis
              {...getXAxisProps(
                "year",
                [1990, 2050],
                [1990, 2015, 2020, currentYear, 2030, 2040, 2050],
              )}
              allowDuplicatedCategory
              tickFormatter={(year) => year}
            />
            <YAxis {...getYAxisProps(currentLanguage)} />
            <Tooltip
              content={
                <ChartTooltip dataView="overview" unit={t("emissionsUnit")} />
              }
              wrapperStyle={{ outline: "none", zIndex: 60 }}
            />
            <ReferenceLine {...getCurrentYearReferenceLineProps(currentYear)} />

            <StackedAreas {...flags} t={t} />

            {hasApproximatedStack ? (
              <ApproximatedStackedAreas
                hasApproxBiogenic={approxStackFlags.hasApproxBiogenic}
                hasApproxConsumption={approxStackFlags.hasApproxConsumption}
                hasApproxOilExport={approxStackFlags.hasApproxOilExport}
                t={t}
              />
            ) : (
              <Line
                type="monotone"
                dataKey="approximated"
                {...getConsistentLineProps(
                  "estimated",
                  false,
                  t("detailPage.graph.estimated"),
                )}
              />
            )}
            <Line
              type="monotone"
              dataKey="trend"
              {...getConsistentLineProps(
                "trend",
                false,
                t("detailPage.graph.trend"),
              )}
            />
            <Line
              type="monotone"
              dataKey="carbonLaw"
              {...getConsistentLineProps(
                "paris",
                false,
                t("detailPage.graph.carbonLaw"),
              )}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartArea>

      <ChartFooter>
        <EnhancedLegend items={legendItems} />
        <ChartYearControls
          chartEndYear={chartEndYear}
          setChartEndYear={setChartEndYear}
        />
      </ChartFooter>
    </ChartWrapper>
  );
};
