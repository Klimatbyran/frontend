import { Text } from "@/components/ui/text";
import type { ParisAlignedStatistics } from "./calculateStatistics";
import { formatNumber } from "./formatters";

interface ParisAlignedSummarySectionProps {
  statistics: ParisAlignedStatistics;
}

export function ParisAlignedSummarySection({
  statistics,
}: ParisAlignedSummarySectionProps) {
  return (
    <div className="bg-black rounded-lg shadow p-6">
      <Text variant="h2" className="mb-4 text-white">
        Summary Statistics
      </Text>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border border-gray-700 rounded-lg p-4">
          <Text variant="small" className="text-gray-300 mb-1">
            Companies with Emissions Data
          </Text>
          <Text variant="h3" className="font-bold text-white">
            {formatNumber(statistics.totalCompaniesWithEmissionsData)}
          </Text>
          <Text variant="small" className="text-gray-400 mt-1">
            Total number of companies with non-null emissions data (any year)
          </Text>
        </div>

        <div className="border border-gray-700 rounded-lg p-4">
          <Text variant="small" className="text-gray-300 mb-1">
            Companies "Yes" on Track for Paris
          </Text>
          <Text variant="h3" className="font-bold text-green-400">
            {formatNumber(statistics.totalCompaniesMeetsParisYes)}
          </Text>
          <Text variant="small" className="text-gray-400 mt-1">
            Companies that are on track to meet Paris Agreement targets
          </Text>
          <Text variant="small" className="text-gray-500 mt-2">
            With Scope 3 Categories:{" "}
            {formatNumber(statistics.totalCompaniesMeetsParisYesWithScope3)}
          </Text>
        </div>

        <div className="border border-gray-700 rounded-lg p-4">
          <Text variant="small" className="text-gray-300 mb-1">
            Companies with Slope Data
          </Text>
          <Text variant="h3" className="font-bold text-white">
            {formatNumber(statistics.totalCompaniesWithSlopeData)}
          </Text>
          <Text variant="small" className="text-gray-400 mt-1">
            Companies with trend slope data from the API
          </Text>
        </div>

        <div className="border border-gray-700 rounded-lg p-4">
          <Text variant="small" className="text-gray-300 mb-1">
            Calculable Meets Paris
          </Text>
          <Text variant="h3" className="font-bold text-white">
            {formatNumber(statistics.totalCompaniesCalculableMeetsParis)}
          </Text>
          <Text variant="small" className="text-gray-400 mt-1">
            Companies where we can calculate Yes/No (excludes Unknown)
          </Text>
        </div>

        <div className="border border-gray-700 rounded-lg p-4">
          <Text variant="small" className="text-gray-300 mb-1">
            Companies "No" - Failing
          </Text>
          <Text variant="h3" className="font-bold text-red-400">
            {formatNumber(statistics.totalCompaniesMeetsParisNo)}
          </Text>
          <Text variant="small" className="text-gray-400 mt-1">
            Companies that are not on track to meet Paris Agreement targets
          </Text>
          <Text variant="small" className="text-gray-500 mt-2">
            With Scope 3 Categories:{" "}
            {formatNumber(statistics.totalCompaniesMeetsParisNoWithScope3)}
          </Text>
        </div>

        <div className="border border-gray-700 rounded-lg p-4">
          <Text variant="small" className="text-gray-300 mb-1">
            Companies "Unknown" if Meets Paris
          </Text>
          <Text variant="h3" className="font-bold text-yellow-400">
            {formatNumber(statistics.totalCompaniesMeetsParisUnknown)}
          </Text>
          <Text variant="small" className="text-gray-400 mt-1">
            Companies where we cannot determine Paris alignment status
          </Text>
          <Text variant="small" className="text-gray-500 mt-2">
            With Scope 3 Categories:{" "}
            {formatNumber(statistics.totalCompaniesMeetsParisUnknownWithScope3)}
          </Text>
        </div>
      </div>
    </div>
  );
}
