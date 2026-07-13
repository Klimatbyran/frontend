import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import { Text } from "@/components/ui/text";
import { useLanguage } from "@/components/LanguageProvider";
import { getCompanyDetailPath } from "@/utils/companyRouting";
import type { ParisAlignedCompanyRow } from "./calculateStatistics";
import { exportParisAlignedCompaniesToCSV, formatTonnes } from "./formatters";

interface ParisAlignedCompaniesTableProps {
  yesCompanies: ParisAlignedCompanyRow[];
}

export function ParisAlignedCompaniesTable({
  yesCompanies,
}: ParisAlignedCompaniesTableProps) {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();

  if (yesCompanies.length === 0) {
    return null;
  }

  return (
    <div className="bg-black rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <Text variant="h2" className="text-white">
          Companies Marked as "Yes" (Meets Paris)
        </Text>
        <button
          onClick={() => exportParisAlignedCompaniesToCSV(yesCompanies)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
          title="Export to CSV"
        >
          <Download className="h-4 w-4" />
          <span className="text-sm">Export CSV</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                Company Name
              </th>
              <th className="text-right py-3 px-4 text-gray-300 font-semibold">
                Est. 2025 Emissions
              </th>
              <th className="text-right py-3 px-4 text-gray-300 font-semibold">
                Carbon Budget (2025-2050)
              </th>
              <th className="text-right py-3 px-4 text-gray-300 font-semibold">
                Projected Emissions (2025-2050)
              </th>
              <th className="text-right py-3 px-4 text-gray-300 font-semibold">
                Diff from Budget
              </th>
              <th className="text-center py-3 px-4 text-gray-300 font-semibold">
                Has Scope 3 Categories
              </th>
            </tr>
          </thead>
          <tbody>
            {yesCompanies.map((company, index) => {
              const basePath = currentLanguage === "sv" ? "/sv" : "/en";
              const companyUrl = getCompanyDetailPath(company, basePath);

              return (
                <tr
                  key={index}
                  className="border-b border-gray-800 hover:bg-gray-900 cursor-pointer transition-colors"
                  onClick={() => navigate(companyUrl)}
                >
                  <td className="py-3 px-4 text-white">{company.name}</td>
                  <td className="py-3 px-4 text-right text-white">
                    {formatTonnes(company.emissions2025)} tonnes CO₂
                  </td>
                  <td className="py-3 px-4 text-right text-white">
                    {formatTonnes(company.carbonBudget)} tonnes CO₂
                  </td>
                  <td className="py-3 px-4 text-right text-white">
                    {formatTonnes(company.projectedEmissions)} tonnes CO₂
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-semibold ${
                      company.diffFromBudget >= 0
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {formatTonnes(company.diffFromBudget)} tonnes CO₂
                  </td>
                  <td className="py-3 px-4 text-center text-white">
                    {company.hasScope3Categories ? "Yes" : "No"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
