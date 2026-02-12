import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useCompanies } from "@/hooks/companies/useCompanies";
import type { RankedCompany } from "@/types/company";
import { SECTOR_NAMES, type SectorCode } from "@/lib/constants/sectors";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
  formatEmployeeCount,
} from "@/utils/formatting/localization";
import { calculateRateOfChange } from "@/utils/calculations/general";
import { calculateEmissionsChange } from "@/utils/calculations/emissionsCalculations";

const companyChangeRate = (company: RankedCompany) =>
  calculateRateOfChange(
    company.reportingPeriods[0]?.emissions?.calculatedTotalEmissions ??
      undefined,
    company.reportingPeriods[1]?.emissions?.calculatedTotalEmissions ??
      undefined,
  );

export const InternalDashboard = () => {
  const { companies, companiesLoading, companiesError } = useCompanies();
  const { currentLanguage } = useLanguage();

  const [sortBy, setSortBy] = useState<
    "emissions" | "change" | "employees" | "emissionsPerEmployee"
  >("emissions");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (
    column: "emissions" | "change" | "employees" | "emissionsPerEmployee",
  ) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  if (companiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading companies...</div>
      </div>
    );
  }

  if (companiesError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">
          Error loading companies: {companiesError.message}
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
        } else if (sortBy === "employees") {
          const aEmployees =
            a.reportingPeriods[0]?.economy?.employees?.value || 0;
          const bEmployees =
            b.reportingPeriods[0]?.economy?.employees?.value || 0;
          comparison = aEmployees - bEmployees;
        } else if (sortBy === "emissionsPerEmployee") {
          const aEmissions =
            a.reportingPeriods[0]?.emissions?.calculatedTotalEmissions || 0;
          const aEmployees =
            a.reportingPeriods[0]?.economy?.employees?.value || 0;
          const bEmissions =
            b.reportingPeriods[0]?.emissions?.calculatedTotalEmissions || 0;
          const bEmployees =
            b.reportingPeriods[0]?.economy?.employees?.value || 0;
          const aRatio = aEmployees > 0 ? aEmissions / aEmployees : 0;
          const bRatio = bEmployees > 0 ? bEmissions / bEmployees : 0;
          comparison = aRatio - bRatio;
        }

        return sortOrder === "asc" ? comparison : -comparison;
      },
    )
    .map(({ company }) => company);
  const getChangeRate = (company: RankedCompany) => {
    // Calculate emissions change from previous period
    const changeRate = calculateEmissionsChange(company.reportingPeriods[0]);

    return changeRate
      ? formatPercentChange(changeRate, currentLanguage, true)
      : "N/A";
  };

  const getSectorName = (sectorCode?: SectorCode) => {
    const sectorName = sectorCode && SECTOR_NAMES[sectorCode];

    return sectorName || "Unknown Sector";
  };

  const getEmployeeCount = (company: RankedCompany) => {
    const employeeCount =
      company.reportingPeriods[0]?.economy?.employees?.value;
    return employeeCount
      ? formatEmployeeCount(employeeCount, currentLanguage)
      : "N/A";
  };

  const getEmissionsPerEmployee = (company: RankedCompany) => {
    const emissions =
      company.reportingPeriods[0]?.emissions?.calculatedTotalEmissions;
    const employees = company.reportingPeriods[0]?.economy?.employees?.value;

    if (!emissions || !employees || employees === 0) {
      return "N/A";
    }

    const ratio = emissions / employees;
    return formatEmissionsAbsolute(ratio, currentLanguage);
  };

  const getLatestYear = (company: RankedCompany) => {
    const latestPeriod = company.reportingPeriods[0];
    return latestPeriod
      ? new Date(latestPeriod.endDate).getFullYear().toString()
      : "N/A";
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Latest Report Year
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
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 select-none"
                onClick={() => handleSort("employees")}
              >
                <div className="flex items-center space-x-1">
                  <span>Employees</span>
                  <span className="text-gray-400">
                    {sortBy === "employees"
                      ? sortOrder === "desc"
                        ? "↓"
                        : "↑"
                      : "↕"}
                  </span>
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 select-none"
                onClick={() => handleSort("emissionsPerEmployee")}
              >
                <div className="flex items-center space-x-1">
                  <span>Emissions per Employee (tCO2e)</span>
                  <span className="text-gray-400">
                    {sortBy === "emissionsPerEmployee"
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
                      {getLatestYear(company)}
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-400">
                      {getEmployeeCount(company)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-400">
                      {getEmissionsPerEmployee(company)}
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
