import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  sectorColors,
  getCompanyColors,
} from "@/hooks/companies/useCompanyFilters";
import PieChartTooltip from "./tooltips/PieChartTooltip";
import CompanyTooltip from "./tooltips/CompanyTooltip";
import PieLegend from "./PieLegend";

interface DesktopPieChartViewProps {
  pieChartData: any[];
  selectedSector: string | null;
  size: { innerRadius: number; outerRadius: number };
  handlePieMouseEnter: (data: any) => void;
  handlePieClick: (data: any) => void;
}

const DesktopPieChartView: React.FC<DesktopPieChartViewProps> = ({
  pieChartData,
  selectedSector,
  size,
  handlePieMouseEnter,
  handlePieClick,
}) => {
  return (
    <div className="flex gap-8">
      <div className="w-2/3 h-full">
        <ResponsiveContainer width="100%" height={size.outerRadius * 2.5}>
          <PieChart>
            <Pie
              data={pieChartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={size.innerRadius * 1.2}
              outerRadius={size.outerRadius * 1.2}
              onMouseEnter={handlePieMouseEnter}
              onClick={handlePieClick}
              cornerRadius={8}
              paddingAngle={2}
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
                  strokeWidth={0}
                />
              ))}
            </Pie>
            <Tooltip
              content={
                selectedSector ? <CompanyTooltip /> : <PieChartTooltip />
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-1/3 flex items-center">
        <PieLegend
          payload={pieChartData}
          selectedSector={selectedSector}
          handlePieClick={handlePieClick}
        />
      </div>
    </div>
  );
};

export default DesktopPieChartView;
