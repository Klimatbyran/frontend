import { useRef } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useResponsiveChartSize } from "@/hooks/useResponsiveChartSize";
import { useScreenSize } from "@/hooks/useScreenSize";
import PieTooltip from "@/components/graphs/tooltips/PieTooltip";
import { SectorInfo } from "@/types/charts";
import { SectorEmissions } from "@/types/emissions";

export interface PieChartItem {
  name: string;
  value: number;
  color: string;
  translatedName?: string;
  [key: string]: unknown;
}

interface SectorPieChartProps {
  sectorEmissions?: SectorEmissions;
  year?: number;
  getSectorInfo?: (name: string) => SectorInfo;
  filteredSectors?: Set<string>;
  onFilteredSectorsChange?: (sectors: Set<string>) => void;
  data?: PieChartItem[];
  nameKey?: string;
  onItemClick?: (data: PieChartItem) => void;
  customActionLabel?: string;
  desktopScale?: boolean;
}

const SectorPieChart: React.FC<SectorPieChartProps> = ({
  sectorEmissions,
  year,
  getSectorInfo,
  filteredSectors = new Set(),
  onFilteredSectorsChange,
  data,
  nameKey,
  onItemClick,
  customActionLabel,
  desktopScale = false,
}) => {
  const { isMobile } = useScreenSize();
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { size } = useResponsiveChartSize();

  const pieData: PieChartItem[] = data
    ? data
        .filter((item) => item.value > 0)
        .filter((item) => !filteredSectors.has(item.name))
        .sort((a, b) => b.value - a.value)
    : Object.entries(sectorEmissions?.sectors[year!] || {})
        .map(([sector, value]) => {
          const { color, translatedName } = getSectorInfo!(sector);
          return {
            name: sector,
            value: value as number,
            color,
            translatedName,
          };
        })
        .filter((item) => item.value > 0)
        .filter((item) => !filteredSectors.has(item.name))
        .sort((a, b) => b.value - a.value);

  const total = pieData.reduce((sum, item) => sum + item.value, 0);
  const pieDataWithTotal = pieData.map((item) => ({ ...item, total }));
  const displayNameKey = nameKey ?? (data ? "name" : "translatedName");

  const scale = desktopScale && !isMobile ? 1.2 : 1;
  const innerRadius = size.innerRadius * scale;
  const outerRadius = size.outerRadius * scale;
  const chartHeight = outerRadius * 2;

  const toggleFilter = (sectorName: string) => {
    if (!onFilteredSectorsChange) return;
    const newFiltered = new Set(filteredSectors);
    if (newFiltered.has(sectorName)) {
      newFiltered.delete(sectorName);
    } else {
      newFiltered.add(sectorName);
    }
    onFilteredSectorsChange(newFiltered);
  };

  const handleSectorClick = (clickedData: PieChartItem) => {
    if (onItemClick) {
      if (isMobile) {
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
          clickTimeoutRef.current = null;
          onItemClick(clickedData);
        } else {
          clickTimeoutRef.current = setTimeout(() => {
            clickTimeoutRef.current = null;
          }, 300);
        }
      } else {
        onItemClick(clickedData);
      }
      return;
    }

    if (isMobile) {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
        toggleFilter(clickedData.name);
      } else {
        clickTimeoutRef.current = setTimeout(() => {
          clickTimeoutRef.current = null;
        }, 300);
      }
    } else {
      toggleFilter(clickedData.name);
    }
  };

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <PieChart>
        <Pie
          data={pieDataWithTotal}
          dataKey="value"
          nameKey={displayNameKey}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          cornerRadius={8}
          paddingAngle={0}
          onClick={handleSectorClick}
          animationBegin={0}
          animationDuration={300}
        >
          {pieDataWithTotal.map((entry) => (
            <Cell
              key={entry.name}
              fill={entry.color}
              stroke="none"
              style={{ cursor: "pointer" }}
            />
          ))}
        </Pie>
        <Tooltip
          content={<PieTooltip customActionLabel={customActionLabel} />}
          animationDuration={0}
          isAnimationActive={false}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default SectorPieChart;
