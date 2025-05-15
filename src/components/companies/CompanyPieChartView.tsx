import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import CompanyPieTooltip from "./tooltips/CompanyPieTooltip";

interface PieChartData {
  name: string;
  value: number;
  color: string;
  category?: number;
}

interface PieChartViewProps {
  pieChartData: PieChartData[];
  size: { innerRadius: number; outerRadius: number };
  customActionLabel?: string;
  handlePieClick?: (data: PieChartData) => void;
  layout?: "desktop" | "mobile";
  filterable?: boolean;
  filteredCategories?: Set<string>;
  onFilteredCategoriesChange?: (categories: Set<string>) => void;
  percentageLabel?: string;
}

const PieChartView: React.FC<PieChartViewProps> = ({
  pieChartData,
  size,
  customActionLabel,
  handlePieClick,
  layout,
  filterable = false,
  filteredCategories = new Set(),
  onFilteredCategoriesChange,
  percentageLabel: percentageLabel,
}) => {
  const isDesktop = layout === "desktop";
  const innerRadius = isDesktop ? size.innerRadius * 1.2 : size.innerRadius;
  const outerRadius = isDesktop ? size.outerRadius * 1.2 : size.outerRadius;

  const handleCategoryClick = (data: PieChartData) => {
    if (filterable && onFilteredCategoriesChange) {
      const categoryName = data.name;
      const newFiltered = new Set(filteredCategories);
      if (newFiltered.has(categoryName)) {
        newFiltered.delete(categoryName);
      } else {
        newFiltered.add(categoryName);
      }
      onFilteredCategoriesChange(newFiltered);
    }

    if (handlePieClick) {
      handlePieClick(data);
    }
  };

  const filteredData = pieChartData.filter(
    (entry) => !filteredCategories.has(entry.name),
  );

  return (
    <ResponsiveContainer width="100%" height={outerRadius * 2.5}>
      <PieChart>
        <Pie
          data={filteredData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          onClick={handleCategoryClick}
          cornerRadius={8}
          paddingAngle={2}
        >
          {filteredData.map((entry) => (
            <Cell
              key={entry.name}
              fill={entry.color}
              stroke={entry.color}
              style={{ cursor: "pointer" }}
            />
          ))}
        </Pie>
        <Tooltip
          content={
            <CompanyPieTooltip
              percentageLabel={percentageLabel}
              customActionLabel={customActionLabel}
            />
          }
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartView;
