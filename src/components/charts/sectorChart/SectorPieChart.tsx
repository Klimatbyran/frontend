import { useRef } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useResponsiveChartSize } from "@/hooks/useResponsiveChartSize";
import { useScreenSize } from "@/hooks/useScreenSize";
import PieTooltip from "@/components/graphs/tooltips/PieTooltip";
import { SectorInfo } from "@/types/charts";
import { SectorEmissions } from "@/types/emissions";

interface SectorPieChartProps {
  sectorEmissions: SectorEmissions;
  year: number;
  getSectorInfo: (name: string) => SectorInfo;
  filteredSectors?: Set<string>;
  onFilteredSectorsChange?: (sectors: Set<string>) => void;
}

interface SectorData {
  name: string;
  value: number;
  color: string;
  translatedName: string;
}

const SectorPieChart: React.FC<SectorPieChartProps> = ({
  sectorEmissions,
  year,
  getSectorInfo,
  filteredSectors = new Set(),
  onFilteredSectorsChange,
}) => {
  const { isMobile } = useScreenSize();
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { size } = useResponsiveChartSize();

  const yearData = sectorEmissions.sectors[year] || {};

  const pieData = Object.entries(yearData)
    .map(([sector, value]) => {
      const { color, translatedName } = getSectorInfo(sector);
      return {
        name: sector,
        value,
        color,
        translatedName,
      };
    })
    .filter((item) => (item.value as number) > 0)
    .filter((item) => !filteredSectors.has(item.name))
    .sort((a, b) => (b.value as number) - (a.value as number));

  const handleSectorClick = (data: SectorData) => {
    if (isMobile) {
      // On mobile, handle double-click for filtering
      if (clickTimeoutRef.current) {
        // This is a double-click
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;

        // Execute the filtering action
        if (onFilteredSectorsChange) {
          const sectorName = data.name;
          const newFiltered = new Set(filteredSectors);
          if (newFiltered.has(sectorName)) {
            newFiltered.delete(sectorName);
          } else {
            newFiltered.add(sectorName);
          }
          onFilteredSectorsChange(newFiltered);
        }
      } else {
        // This is a single-click, just show tooltip (no action)
        clickTimeoutRef.current = setTimeout(() => {
          clickTimeoutRef.current = null;
        }, 300); // 300ms timeout for double-click detection
      }
    } else if (onFilteredSectorsChange) {
      const sectorName = data.name;
      const newFiltered = new Set(filteredSectors);
      if (newFiltered.has(sectorName)) {
        newFiltered.delete(sectorName);
      } else {
        newFiltered.add(sectorName);
      }
      onFilteredSectorsChange(newFiltered);
    }
  };

  return (
    <div className="max-h-[450px]">
      <ResponsiveContainer width="100%" height={size.outerRadius * 2.5}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="translatedName"
            cx="50%"
            cy="50%"
            innerRadius={size.innerRadius}
            outerRadius={size.outerRadius}
            cornerRadius={8}
            paddingAngle={2}
            onClick={handleSectorClick}
            animationBegin={0}
            animationDuration={300}
          >
            {pieData.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.color}
                stroke={entry.color}
                style={{ cursor: "pointer" }}
              />
            ))}
          </Pie>
          <Tooltip
            content={<PieTooltip />}
            animationDuration={0}
            isAnimationActive={false}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SectorPieChart;
