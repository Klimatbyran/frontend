import React, { useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  sectorColors,
  getCompanyColors,
  useSectorNames,
} from "@/hooks/companies/useCompanyFilters";
import { RankedCompany } from "@/hooks/companies/useCompanies";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useChartData } from "@/hooks/companies/useChartData";
import CustomTooltip from "./charts/tooltips/CustomTooltip";
import PieChartTooltip from "./charts/tooltips/PieChartTooltip";
import CompanyTooltip from "./charts/tooltips/CompanyTooltip";
import ChartHeader from "./charts/ChartHeader";
import PieLegend from "./charts/PieLegend";
import EmissionsTrendAnalysis from "./EmissionsTrendAnalysis/EmissionsTrendAnalysis";
import EmissionsSourcesAnalysis from "./EmissionsSourcesAnalysis/EmissionsSourcesAnlaysis";

interface EmissionsChartProps {
  companies: RankedCompany[];
  selectedSectors: string[];
}

type ChartType = "stacked-total" | "pie";

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

const StackedTotalLegend = ({ payload }: { payload: any[] }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
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
  const sectorNames = useSectorNames();

  const [chartType, setChartType] = useState<ChartType>("pie");
  const [selectedYear, setSelectedYear] = useState<string>("2023");
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const isMobile = useScreenSize();

  const { chartData, pieChartData, totalEmissions, years } = useChartData(
    companies,
    selectedSectors,
    selectedSector,
    chartType,
    selectedYear,
  );

  const [legendData, setLegendData] = useState<any[]>([]);

  const handlePieMouseEnter = useCallback((data: any) => {
    if (data && data.payload) {
      setLegendData(data.payload);
    }
  }, []);

  const handleBarClick = (data: any) => {
    if (chartType === "stacked-total") return;

    if (!data || !data.activePayload || !data.activePayload[0]) return;

    const [sector] = data.activePayload[0].dataKey.split("_scope");
    const sectorCode = Object.entries(sectorNames).find(
      ([_, name]) => name === sector,
    )?.[0];

    if (sectorCode) {
      setSelectedSector(sectorCode);
      setSelectedYear(data.activeLabel);
    }
  };

  const handlePieClick = (data: any) => {
    if (!selectedSector && data?.payload?.sectorCode) {
      setSelectedSector(data.payload.sectorCode);
    }
  };

  const pieChartHeight = isMobile ? 500 : 650;

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

      <div
        className={`h-[${pieChartHeight}px] mt-8`}
        style={{ height: pieChartHeight }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "pie" ? (
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy={isMobile ? "35%" : "40%"}
                outerRadius={isMobile ? 100 : 160}
                onMouseEnter={handlePieMouseEnter}
              >
                {pieChartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={
                      selectedSector
                        ? getCompanyColors(index).base
                        : "sectorCode" in entry
                          ? sectorColors[
                              entry.sectorCode as keyof typeof sectorColors
                            ]?.base || "#888888"
                          : "#888888"
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                content={
                  selectedSector ? <CompanyTooltip /> : <PieChartTooltip />
                }
              />
              <Legend
                content={
                  <PieLegend
                    payload={pieChartData}
                    selectedSector={selectedSector}
                    handlePieClick={handlePieClick}
                  />
                }
              />
            </PieChart>
          ) : (
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 15, left: 20, bottom: 5 }}
              onClick={
                chartType !== "stacked-total" ? handleBarClick : undefined
              }
              barGap={0}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#888888" }}
                axisLine={{ stroke: "#2A2A2A" }}
                tickLine={{ stroke: "#2A2A2A" }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                label={{
                  value: "tCO₂e",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#888888",
                  style: { textAnchor: "middle" },
                  offset: -15,
                }}
                tick={{ fill: "#888888" }}
                axisLine={{ stroke: "#2A2A2A" }}
                tickLine={{ stroke: "#2A2A2A" }}
                tickFormatter={formatYAxisTick}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
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
          )}
        </ResponsiveContainer>
      </div>

      <EmissionsTrendAnalysis
        companies={companies}
        selectedSectors={selectedSectors}
      />

      <EmissionsSourcesAnalysis
        companies={companies}
        selectedSectors={selectedSectors}
        selectedYear={selectedYear}
      />
    </div>
  );
};

export default SectorEmissionsChart;
