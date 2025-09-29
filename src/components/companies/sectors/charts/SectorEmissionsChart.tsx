import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { LegendPayload } from "recharts";
import {
  sectorColors,
  useSectorNames,
  getCompanyColors,
} from "@/hooks/companies/useCompanyFilters";
import { RankedCompany } from "@/types/company";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useChartData } from "@/hooks/companies/useChartData";
import ChartHeader from "./ChartHeader";
import { useTranslation } from "react-i18next";
import PieChartView from "../../CompanyPieChartView";
import { useResponsiveChartSize } from "@/hooks/useResponsiveChartSize";
import { cn } from "@/lib/utils";
import SectorPieLegend from "./SectorPieLegend";
import CustomTooltip from "../../tooltips/CustomTooltip";

interface EmissionsChartProps {
  companies: RankedCompany[];
  selectedSectors: string[];
}

type ChartType = "stacked-total" | "pie";

type BarClickData = {
  activePayload?: { dataKey: string }[];
  activeLabel?: string;
};

const formatYAxisTick = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k`;
  }
  return value.toString();
};

const StackedTotalLegend = ({
  payload,
}: {
  payload: readonly LegendPayload[];
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4 relative z-10">
      {payload?.map((entry: LegendPayload, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className={cn("w-3 h-3 rounded")}
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-grey">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const SectorEmissionsChart: React.FC<EmissionsChartProps> = ({
  companies,
  selectedSectors,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sectorNames = useSectorNames();

  const [chartType, setChartType] = useState<ChartType>("pie");
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const screenSize = useScreenSize();
  const { size } = useResponsiveChartSize();

  const { chartData, pieChartData, totalEmissions, years } = useChartData(
    companies,
    selectedSectors,
    selectedSector,
    chartType,
    selectedYear,
  );

  const handleBarClick = (data: BarClickData) => {
    if (chartType === "stacked-total") {
      return;
    }
    if (!data || !data.activePayload || !data.activePayload[0]) {
      return;
    }
    const [sector] = data.activePayload[0].dataKey.split("_scope");
    const sectorCode = Object.entries(sectorNames).find(
      ([, name]) => name === sector,
    )?.[0];

    if (sectorCode) {
      setSelectedSector(sectorCode);
      setSelectedYear(data.activeLabel!);
    }
  };

  const handlePieClick = (data: any) => {
    if (!selectedSector && data?.sectorCode) {
      setSelectedSector(data.sectorCode);
    } else if (selectedSector && data?.wikidataId) {
      navigate(`/companies/${data.wikidataId}`);
    }
  };

  const pieChartDataWithColor = pieChartData.map((entry, index) => ({
    ...entry,
    color: selectedSector
      ? getCompanyColors(index).base
      : "sectorCode" in entry
        ? sectorColors[entry.sectorCode as keyof typeof sectorColors]?.base ||
          "var(--grey)"
        : "var(--grey)",
  }));

  return (
    <div className="w-full space-y-6">
      <ChartHeader
        selectedSector={selectedSector}
        chartType={chartType}
        totalEmissions={totalEmissions}
        selectedYear={selectedYear}
        years={years}
        onSectorClear={() => setSelectedSector(null)}
        onChartTypeChange={setChartType}
        onYearChange={setSelectedYear}
        selectedSectors={selectedSectors}
      />

      <div>
        {chartType === "pie" ? (
          totalEmissions > 0 ? (
            <div className="flex flex-col gap-4 mt-8 lg:flex-row lg:gap-8">
              <div className="w-full lg:w-1/2 lg:h-full">
                <PieChartView
                  pieChartData={pieChartDataWithColor}
                  size={size}
                  customActionLabel={t(
                    `companiesPage.sectorGraphs.${selectedSector ? "pieLegendCompany" : "pieLegendSector"}`,
                  )}
                  handlePieClick={handlePieClick}
                  layout={screenSize.isMobile ? "mobile" : "desktop"}
                />
              </div>
              <div className={"w-full h-full flex lg:w-1/2 lg:items-center"}>
                <SectorPieLegend
                  payload={pieChartDataWithColor}
                  selectedLabel={selectedSector}
                  handlePieClick={handlePieClick}
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-grey">
                {t("companiesPage.sectorGraphs.noDataAvailablePieChart")}
              </p>
            </div>
          )
        ) : (
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 15, left: 20, bottom: 5 }}
                onClick={
                  chartType !== "stacked-total" ? handleBarClick : undefined
                }
                barGap={0}
                barCategoryGap="30%"
              >
                <XAxis
                  dataKey="year"
                  tick={{ fill: "var(--grey)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--black-1)" }}
                  tickLine={{ stroke: "var(--black-1)" }}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis
                  tick={{ fill: "var(--grey)" }}
                  axisLine={{ stroke: "var(--black-1)" }}
                  tickLine={{ stroke: "var(--black-1)" }}
                  tickFormatter={formatYAxisTick}
                  width={30}
                  fontSize={12}
                  label={{
                    value: "tCO₂e",
                    position: "top",
                    offset: 10,
                    style: {
                      textAnchor: "middle",
                      fontSize: "12px",
                    },
                  }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  wrapperStyle={{ zIndex: 1000 }}
                  animationDuration={0}
                  isAnimationActive={false}
                />
                {selectedSectors.map((sectorCode) => {
                  const sectorName =
                    sectorNames[sectorCode as keyof typeof sectorNames];
                  const colors =
                    sectorColors[sectorCode as keyof typeof sectorColors];
                  return (
                    <Bar
                      key={sectorCode}
                      dataKey={sectorName}
                      stackId="total"
                      fill={colors.base}
                      name={sectorName}
                      cursor="default"
                    />
                  );
                })}
                <Legend
                  content={(props) => (
                    <StackedTotalLegend payload={props.payload || []} />
                  )}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectorEmissionsChart;
