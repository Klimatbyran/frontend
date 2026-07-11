import { Text } from "@/components/ui/text";
import type { ParisAlignedStatistics } from "./calculateStatistics";
import { formatTonnes } from "./formatters";

interface ParisAlignedEmissionsTotalsSectionProps {
  statistics: ParisAlignedStatistics;
}

export function ParisAlignedEmissionsTotalsSection({
  statistics,
}: ParisAlignedEmissionsTotalsSectionProps) {
  return (
    <div className="bg-black rounded-lg shadow p-6">
      <Text variant="h2" className="mb-4 text-white">
        Emissions Totals (Calculable Companies Only)
      </Text>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-gray-700 rounded-lg p-4">
          <Text variant="small" className="text-gray-300 mb-1">
            Total Carbon Budget
          </Text>
          <Text variant="h3" className="font-bold text-white">
            {formatTonnes(statistics.totalCarbonBudget)} tonnes CO₂
          </Text>
          <Text variant="small" className="text-gray-400 mt-1">
            Total carbon budget (2025-2050) for calculable companies
          </Text>
        </div>

        <div className="border border-gray-700 rounded-lg p-4">
          <Text variant="small" className="text-gray-300 mb-1">
            Total Projected Emissions
          </Text>
          <Text variant="h3" className="font-bold text-white">
            {formatTonnes(statistics.totalProjectedEmissions)} tonnes CO₂
          </Text>
          <Text variant="small" className="text-gray-400 mt-1">
            Total projected emissions (2025-2050) for calculable companies
          </Text>
        </div>

        <div className="border border-gray-700 rounded-lg p-4">
          <Text variant="small" className="text-gray-300 mb-1">
            Total Difference from Budget
          </Text>
          <Text
            variant="h3"
            className={`font-bold ${
              statistics.totalTonnesDiffFromBudget >= 0
                ? "text-red-400"
                : "text-green-400"
            }`}
          >
            {formatTonnes(statistics.totalTonnesDiffFromBudget)} tonnes CO₂
          </Text>
          <Text variant="small" className="text-gray-400 mt-1">
            Difference: Projected Emissions - Carbon Budget
            <br />
            {statistics.totalTonnesDiffFromBudget >= 0
              ? "(Over budget)"
              : "(Under budget)"}
          </Text>
        </div>
      </div>
    </div>
  );
}
