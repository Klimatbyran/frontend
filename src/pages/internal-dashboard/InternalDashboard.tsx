import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { RankedCompany, useCompanies } from "@/hooks/companies/useCompanies";
import { SECTOR_NAMES, SectorCode } from "@/hooks/companies/useCompanyFilters";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/localizeUnit";
import { calculateRateOfChange } from "@/lib/calculations/general";

const companyChangeRate = (company: RankedCompany) =>
  calculateRateOfChange(
    company.reportingPeriods[0]?.emissions?.calculatedTotalEmissions,
    company.reportingPeriods[1]?.emissions?.calculatedTotalEmissions,
  );

export const InternalDashboard = () => {
  const { companies, loading, error } = useCompanies();
  const { currentLanguage } = useLanguage();

  const [sortBy, setSortBy] = useState<"emissions" | "change">("emissions");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (column: "emissions" | "change") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading companies...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">
          Error loading companies: {error.message}
        </div>
      </div>
    );
  }

  // Filter companies that have emission data and get latest emissions
  const companiesWithEmissions = companies
    .filter((company) => {
      const latestPeriod = company.reportingPeriods[0];
      return latestPeriod?.emissions?.calculatedTotalEmissions;
    })
    .map((company) => ({
      company,
      emissionChange: companyChangeRate(company) || -1000000,
    }))
    .sort(
      (
        { company: a, emissionChange: aChange },
        { company: b, emissionChange: bChange },
      ) => {
        let comparison = 0;

        if (sortBy === "emissions") {
          const aEmissions =
            a.reportingPeriods[0]?.emissions?.calculatedTotalEmissions || 0;
          const bEmissions =
            b.reportingPeriods[0]?.emissions?.calculatedTotalEmissions || 0;
          comparison = aEmissions - bEmissions;
        } else if (sortBy === "change") {
          comparison = aChange - bChange;
        }

        return sortOrder === "asc" ? comparison : -comparison;
      },
    )
    .map(({ company }) => company);
  const getChangeRate = (company: RankedCompany) => {
    const changeRate = calculateRateOfChange(
      company.reportingPeriods[0]?.emissions?.calculatedTotalEmissions,
      company.reportingPeriods[1]?.emissions?.calculatedTotalEmissions,
    );

    return changeRate
      ? formatPercentChange(changeRate, currentLanguage)
      : "N/A";
  };

  const getSectorName = (sectorCode?: SectorCode) => {
    const sectorName = sectorCode && SECTOR_NAMES[sectorCode];

    return sectorName || "Unknown Sector";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-200 mb-2">
          Internal Dashboard
        </h1>
        <p className="text-gray-500">
          All companies with emission data ({companiesWithEmissions.length}{" "}
          companies)
        </p>
      </div>

      <div className="shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Company Name
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 select-none"
                onClick={() => handleSort("emissions")}
              >
                <div className="flex items-center space-x-1">
                  <span>Total Emissions (tCO2e)</span>
                  <span className="text-gray-400">
                    {sortBy === "emissions"
                      ? sortOrder === "desc"
                        ? "↓"
                        : "↑"
                      : "↕"}
                  </span>
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 select-none"
                onClick={() => handleSort("change")}
              >
                <div className="flex items-center space-x-1">
                  <span>Change Since Last Year</span>
                  <span className="text-gray-400">
                    {sortBy === "change"
                      ? sortOrder === "desc"
                        ? "↓"
                        : "↑"
                      : "↕"}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {companiesWithEmissions.map((company) => {
              const latestEmissions =
                company.reportingPeriods[0]?.emissions
                  ?.calculatedTotalEmissions || 0;
              const changeColor =
                company.metrics.emissionsReduction > 0
                  ? "text-green-600"
                  : company.metrics.emissionsReduction < 0
                    ? "text-red-600"
                    : "text-gray-600";

              return (
                <tr key={company.wikidataId} className="hover:bg-blue-5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-200">
                        <a href={`/companies/${company.wikidataId}`}>
                          {company.name}
                        </a>
                      </div>
                      <div className="text-sm text-gray-500">
                        {getSectorName(
                          company.industry?.industryGics
                            ?.sectorCode as SectorCode,
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-400">
                      {formatEmissionsAbsolute(
                        latestEmissions,
                        currentLanguage,
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${changeColor}`}>
                      {getChangeRate(company)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {companiesWithEmissions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No companies found with emission data.
          </p>
        </div>
      )}
    </div>
  );
};
