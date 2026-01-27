import { useTranslation } from "react-i18next";
import { PieChart } from "@/components/charts/PieChart";
import { useTheme } from "@/components/ThemeProvider";

interface SectorData {
  sector: string;
  emissions: number;
}

interface RegionalSectorPieChartProps {
  sectorData: SectorData[];
  filteredSectors: string[];
  onFilteredSectorsChange: (sectors: string[]) => void;
}

export default function RegionalSectorPieChart({
  sectorData,
  filteredSectors,
  onFilteredSectorsChange,
}: RegionalSectorPieChartProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Filter out sectors that should be hidden
  const filteredData = sectorData.filter(
    (item) => !filteredSectors.includes(item.sector),
  );

  // Prepare data for the chart
  const chartData = filteredData.map((item) => ({
    name: item.sector,
    value: item.emissions,
  }));

  // Calculate total emissions
  const totalEmissions = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full h-[400px]">
      <PieChart
        data={chartData}
        total={totalEmissions}
        valueFormatter={(value) => `${value.toFixed(1)} ${t("emissionsUnit")}`}
        percentFormatter={(value) => `${(value * 100).toFixed(1)}%`}
        colorScheme={theme === "dark" ? "dark" : "light"}
        onClick={(item) => {
          const newFilteredSectors = [...filteredSectors];
          if (!newFilteredSectors.includes(item.name)) {
            newFilteredSectors.push(item.name);
          } else {
            const index = newFilteredSectors.indexOf(item.name);
            newFilteredSectors.splice(index, 1);
          }
          onFilteredSectorsChange(newFilteredSectors);
        }}
      />
    </div>
  );
}
