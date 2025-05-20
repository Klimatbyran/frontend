import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { SectorEmissions } from "@/types/municipality";
import { SECTOR_COLORS } from "@/constants/colors";
import { useResponsiveChartSize } from "@/hooks/useResponsiveChartSize";
import { MunicipalitySectorTooltip } from "./MunicipalitySectorTooltip";

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
}

const MunicipalitySectorPieChart: React.FC<MunicipalitySectorPieChartProps> = ({
  sectorEmissions,
  year,
  filteredSectors = new Set(),
  onFilteredSectorsChange,
}) => {
  const { size } = useResponsiveChartSize();

  const yearData = sectorEmissions.sectors[year] || {};

  const pieData = Object.entries(yearData)
    .map(([sector, value]) => ({
      name: sector,
      value,
      color:
        SECTOR_COLORS[sector as keyof typeof SECTOR_COLORS] || "var(--grey)",
    }))
    .filter((item) => (item.value as number) > 0)
    .filter((item) => !filteredSectors.has(item.name))
    .sort((a, b) => (b.value as number) - (a.value as number));

  const handleSectorClick = (data: SectorData) => {
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
  };

  return (
    <div className="max-h-[450px]">
      <ResponsiveContainer width="100%" height={size.outerRadius * 2.5}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={size.innerRadius}
            outerRadius={size.outerRadius}
            cornerRadius={8}
            paddingAngle={2}
            onClick={handleSectorClick}
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
            content={
              <MunicipalitySectorTooltip filteredSectors={filteredSectors} />
            }
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MunicipalitySectorPieChart;
