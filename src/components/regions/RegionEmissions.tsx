import { FC, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "@/hooks/useScreenSize";
import {
  getConsistentLineProps,
  getXAxisProps,
  getYAxisProps,
  getCurrentYearReferenceLineProps,
  getChartContainerProps,
  getLineChartProps,
  getResponsiveChartMargin,
  ChartWrapper,
  ChartArea,
  ChartFooter,
  filterDataByYearRange,
  ChartTooltip,
  EnhancedLegend,
  ChartYearControls,
  LegendItem,
} from "@/components/charts";
import { useLanguage } from "@/components/LanguageProvider";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import CardHeader from "../layout/CardHeader";

interface RegionEmissionsProps {
  emissionsData: Array<{ year: number; total: number }>;
}

export const RegionEmissions: FC<RegionEmissionsProps> = ({
  emissionsData,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();
  const currentYear = new Date().getFullYear();

  const [chartEndYear, setChartEndYear] = useState(
    new Date().getFullYear() + 5,
  );

  const legendItems: LegendItem[] = useMemo(() => {
    return [
      {
        name: t("municipalities.graph.historical"),
        color: "var(--orange-2)",
      },
    ];
  }, [t]);

  const filteredData = useMemo(() => {
    return filterDataByYearRange(emissionsData, chartEndYear);
  }, [emissionsData, chartEndYear]);

  return (
    <SectionWithHelp helpItems={["parisAgreementLine"]}>
      <CardHeader
        title={t("detailPage.emissionsDevelopment")}
        unit={t("detailPage.inTons")}
      />
      <div className="mt-8" style={{ height: "500px" }}>
        <ChartWrapper>
          <ChartArea>
            <ResponsiveContainer {...getChartContainerProps()}>
              <LineChart
                {...getLineChartProps(
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
                  allowDuplicatedCategory={true}
                  tickFormatter={(year) => year}
                />
                <YAxis {...getYAxisProps(currentLanguage)} />

                <Tooltip
                  content={
                    <ChartTooltip
                      dataView="overview"
                      unit={t("emissionsUnit")}
                    />
                  }
                  wrapperStyle={{ outline: "none", zIndex: 60 }}
                />

                {/* Current year reference line */}
                <ReferenceLine
                  {...getCurrentYearReferenceLineProps(currentYear)}
                />

                {/* Historical line */}
                <Line
                  type="monotone"
                  dataKey="total"
                  {...getConsistentLineProps(
                    "historical",
                    false,
                    t("municipalities.graph.historical"),
                  )}
                />
              </LineChart>
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
      </div>
    </SectionWithHelp>
  );
};
