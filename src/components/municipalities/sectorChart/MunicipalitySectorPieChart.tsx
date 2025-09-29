import { useRef } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { SectorEmissions } from "@/types/municipality";
import { useResponsiveChartSize } from "@/hooks/useResponsiveChartSize";
import { useMunicipalitySectors } from "@/hooks/municipalities/useMunicipalitySectors";
import { useScreenSize } from "@/hooks/useScreenSize";
import PieTooltip from "@/components/graphs/tooltips/PieTooltip";

interface MunicipalitySectorPieChartProps {
  sectorEmissions: SectorEmissions;
  year: number;
  filteredSectors?: Set<string>;
  onFilteredSectorsChange?: (sectors: Set<string>) => void;
}

interface SectorData {
  name: string;
  value: number;
  color: string;
  translatedName: string;
}

const MunicipalitySectorPieChart: React.FC<MunicipalitySectorPieChartProps> = ({
  sectorEmissions,
  year,
  filteredSectors = new Set(),
  onFilteredSectorsChange,
}) => {
  const { isMobile } = useScreenSize();
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { size } = useResponsiveChartSize();
  const { getSectorInfo } = useMunicipalitySectors();

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
    } else {
      // On desktop, single-click for filtering (existing behavior)
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

export default MunicipalitySectorPieChart;
