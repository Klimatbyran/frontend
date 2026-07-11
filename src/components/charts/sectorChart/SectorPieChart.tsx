import { useRef } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { useResponsiveChartSize } from "@/hooks/useResponsiveChartSize";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useChartMotion } from "@/hooks/useChartMotion";
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
  animationKey?: string;
}

const PIE_CORNER_RADIUS = 8;

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
  animationKey,
}) => {
  const { isMobile } = useScreenSize();
  const { pieDuration, reduceMotion } = useChartMotion();
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { size, containerRef } = useResponsiveChartSize();

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
  const outerRadius = size.outerRadius * scale;
  const innerRadius = size.innerRadius * scale;
  const side = Math.ceil(outerRadius * 2 + PIE_CORNER_RADIUS * 2);
  const center = side / 2;
  const pieAnimationKey =
    animationKey ??
    pieDataWithTotal.map((entry) => `${entry.name}-${entry.value}`).join("|");

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
    <div
      ref={containerRef}
      className="w-full min-h-[200px] flex items-center justify-center"
    >
      {outerRadius > 0 && (
        <PieChart width={side} height={side}>
          <Pie
            key={pieAnimationKey}
            data={pieDataWithTotal}
            dataKey="value"
            nameKey={displayNameKey}
            cx={center}
            cy={center}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            cornerRadius={PIE_CORNER_RADIUS}
            paddingAngle={2}
            onClick={handleSectorClick}
            isAnimationActive={!reduceMotion}
            animationBegin={0}
            animationDuration={pieDuration}
            animationEasing="ease-out"
          >
            {pieDataWithTotal.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.color}
                stroke={entry.color}
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
      )}
    </div>
  );
};

export default SectorPieChart;
