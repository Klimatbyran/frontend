import React, { useRef } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useScreenSize } from "@/hooks/useScreenSize";
import PieTooltip from "../graphs/tooltips/PieTooltip";

interface PieChartData {
  name: string;
  value: number;
  color: string;
  category?: number;
  total?: number;
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
  const { isMobile } = useScreenSize();
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDesktop = layout === "desktop";
  const innerRadius = isDesktop ? size.innerRadius * 1.2 : size.innerRadius;
  const outerRadius = isDesktop ? size.outerRadius * 1.2 : size.outerRadius;

  const handleCategoryClick = (data: PieChartData) => {
    if (isMobile) {
      // On mobile, handle double-click for filtering
      if (clickTimeoutRef.current) {
        // This is a double-click
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;

        // Execute the filtering action
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
      } else {
        // This is a single-click, just show tooltip (no action)
        clickTimeoutRef.current = setTimeout(() => {
          clickTimeoutRef.current = null;
        }, 300); // 300ms timeout for double-click detection
      }
    } else {
      // On desktop, single-click for filtering (existing behavior)
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
    }
  };

  const filteredData = pieChartData
    .filter((entry) => entry.value != null)
    .filter((entry) => !filteredCategories.has(entry.name));

  // Calculate total of filtered data and add it to each data point
  const filteredTotal = filteredData.reduce(
    (sum, entry) => sum + (entry.value || 0),
    0,
  );
  const dataWithTotal = filteredData.map((entry) => ({
    ...entry,
    total: filteredTotal,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(outerRadius * 2.5, 300)}>
      <PieChart>
        <Pie
          data={dataWithTotal}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          onClick={handleCategoryClick}
          cornerRadius={8}
          paddingAngle={2}
          animationBegin={0}
          animationDuration={300}
        >
          {dataWithTotal.map((entry) => (
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
            <PieTooltip
              percentageLabel={percentageLabel}
              customActionLabel={customActionLabel}
            />
          }
          animationDuration={0}
          isAnimationActive={false}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartView;
