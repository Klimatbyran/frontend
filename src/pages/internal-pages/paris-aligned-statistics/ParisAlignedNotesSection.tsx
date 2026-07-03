import { Text } from "@/components/ui/text";

export function ParisAlignedNotesSection() {
  return (
    <div className="bg-black rounded-lg p-6 border border-gray-700">
      <Text variant="h3" className="mb-2 text-white">
        Notes
      </Text>
      <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
        <li>
          Statistics are calculated using the same logic as the meets Paris
          calculation in the codebase
        </li>
        <li>
          Only companies with slope data from the API can have their Paris
          alignment calculated
        </li>
        <li>
          Companies with "Unknown" status are excluded from emissions totals
        </li>
        <li>
          Companies with 0 or negative emissions at 2025 are marked as
          "Unknown" rather than "Yes" or "No", as we cannot meaningfully assess
          their Paris alignment when they have no emissions
        </li>
        <li>
          Carbon budget uses the Carbon Law reduction rate (11.72% annual
          decrease)
        </li>
        <li>
          Projected emissions are calculated from the linear trendline based on
          historical data
        </li>
      </ul>
    </div>
  );
}
