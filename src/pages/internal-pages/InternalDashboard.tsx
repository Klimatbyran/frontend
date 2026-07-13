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
import { getCompanyDetailPath } from "@/utils/companyRouting";

type SortColumn = "emissions" | "change" | "employees" | "emissionsPerEmployee";

function getEmissionsPerEmployeeRatio(company: RankedCompany): number {
  const emissions =
    company.reportingPeriods[0]?.emissions?.calculatedTotalEmissions || 0;
  const employees = company.reportingPeriods[0]?.economy?.employees?.value || 0;
  return employees > 0 ? emissions / employees : 0;
}

const SORT_COMPARATORS: Record<
  SortColumn,
  (
    a: RankedCompany,
    b: RankedCompany,
    aChange: number,
    bChange: number,
  ) => number
> = {
  emissions: (a, b) => {
    const aEmissions =
      a.reportingPeriods[0]?.emissions?.calculatedTotalEmissions || 0;
    const bEmissions =
      b.reportingPeriods[0]?.emissions?.calculatedTotalEmissions || 0;
    return aEmissions - bEmissions;
  },
  change: (_a, _b, aChange, bChange) => aChange - bChange,
  employees: (a, b) => {
    const aEmployees = a.reportingPeriods[0]?.economy?.employees?.value || 0;
    const bEmployees = b.reportingPeriods[0]?.economy?.employees?.value || 0;
    return aEmployees - bEmployees;
  },
  emissionsPerEmployee: (a, b) =>
    getEmissionsPerEmployeeRatio(a) - getEmissionsPerEmployeeRatio(b),
};

function compareCompanies(
  a: RankedCompany,
  b: RankedCompany,
  aChange: number,
  bChange: number,
  sortBy: SortColumn,
): number {
  return SORT_COMPARATORS[sortBy](a, b, aChange, bChange);
}

function filterAndSortCompanies(
  companies: RankedCompany[],
  sortBy: SortColumn,
  sortOrder: "asc" | "desc",
): RankedCompany[] {
  return companies
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
        const comparison = compareCompanies(a, b, aChange, bChange, sortBy);
        return sortOrder === "asc" ? comparison : -comparison;
      },
    )
    .map(({ company }) => company);
}

function SortIndicator({
  column,
  sortBy,
  sortOrder,
}: {
  column: SortColumn;
  sortBy: SortColumn;
  sortOrder: "asc" | "desc";
}) {
  if (sortBy !== column) return <span className="text-gray-400">↕</span>;
  return (
    <span className="text-gray-400">{sortOrder === "desc" ? "↓" : "↑"}</span>
  );
}

function SortableHeader({
  column,
  label,
  sortBy,
  sortOrder,
  onSort,
}: {
  column: SortColumn;
  label: string;
  sortBy: SortColumn;
  sortOrder: "asc" | "desc";
  onSort: (column: SortColumn) => void;
}) {
  return (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 select-none"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <SortIndicator column={column} sortBy={sortBy} sortOrder={sortOrder} />
      </div>
    </th>
  );
}

const companyChangeRate = (company: RankedCompany) =>
  calculateRateOfChange(
    company.reportingPeriods[0]?.emissions?.calculatedTotalEmissions ??
      undefined,
    company.reportingPeriods[1]?.emissions?.calculatedTotalEmissions ??
      undefined,
  );

function getChangeColor(company: RankedCompany): string {
  if (company.metrics.emissionsReduction > 0) return "text-green-600";
  if (company.metrics.emissionsReduction < 0) return "text-red-600";
  return "text-gray-600";
}

function formatLatestYear(company: RankedCompany): string {
  const latestPeriod = company.reportingPeriods[0];
  return latestPeriod
    ? new Date(latestPeriod.endDate).getFullYear().toString()
    : "N/A";
}

function formatSectorName(company: RankedCompany): string {
  const sectorCode = company.industry?.industryGics?.sectorCode as SectorCode;
  return (sectorCode && SECTOR_NAMES[sectorCode]) || "Unknown Sector";
}

function formatEmployeeDisplay(
  company: RankedCompany,
  currentLanguage: string,
): string {
  const employeeCount = company.reportingPeriods[0]?.economy?.employees?.value;
  return employeeCount
    ? formatEmployeeCount(employeeCount, currentLanguage)
    : "N/A";
}

function formatEmissionsRatioDisplay(
  company: RankedCompany,
  currentLanguage: string,
): string {
  const ratio = getEmissionsPerEmployeeRatio(company);
  return ratio > 0 ? formatEmissionsAbsolute(ratio, currentLanguage) : "N/A";
}

function formatCompanyRowData(company: RankedCompany, currentLanguage: string) {
  const latestPeriod = company.reportingPeriods[0];
  const latestEmissions =
    latestPeriod?.emissions?.calculatedTotalEmissions || 0;
  const changeRate = calculateEmissionsChange(latestPeriod);

  return {
    latestEmissions,
    formattedChange: changeRate
      ? formatPercentChange(changeRate, currentLanguage)
      : "N/A",
    sectorName: formatSectorName(company),
    formattedEmployees: formatEmployeeDisplay(company, currentLanguage),
    formattedRatio: formatEmissionsRatioDisplay(company, currentLanguage),
    latestYear: formatLatestYear(company),
    changeColor: getChangeColor(company),
  };
}

function CompanyTableRow({
  company,
  currentLanguage,
}: {
  company: RankedCompany;
  currentLanguage: string;
}) {
  const row = formatCompanyRowData(company, currentLanguage);

  return (
    <tr key={company.id} className="hover:bg-blue-5">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-200">
            <a href={getCompanyDetailPath(company)}>{company.name}</a>
          </div>
          <div className="text-sm text-gray-500">{row.sectorName}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-400">
          {row.latestYear}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-400">
          {formatEmissionsAbsolute(row.latestEmissions, currentLanguage)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm font-medium ${row.changeColor}`}>
          {row.formattedChange}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-400">
          {row.formattedEmployees}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-400">
          {row.formattedRatio}
        </div>
      </td>
    </tr>
  );
}

function CompaniesTable({
  companies,
  sortBy,
  sortOrder,
  onSort,
  currentLanguage,
}: {
  companies: RankedCompany[];
  sortBy: SortColumn;
  sortOrder: "asc" | "desc";
  onSort: (column: SortColumn) => void;
  currentLanguage: string;
}) {
  return (
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
            <SortableHeader
              column="emissions"
              label="Total Emissions (tCO2e)"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <SortableHeader
              column="change"
              label="Change Since Last Year"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <SortableHeader
              column="employees"
              label="Employees"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <SortableHeader
              column="emissionsPerEmployee"
              label="Emissions per Employee (tCO2e)"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-600">
          {companies.map((company) => (
            <CompanyTableRow
              key={company.id}
              company={company}
              currentLanguage={currentLanguage}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const InternalDashboard = () => {
  const { companies, companiesLoading, companiesError } = useCompanies();
  const { currentLanguage } = useLanguage();
  const [sortBy, setSortBy] = useState<SortColumn>("emissions");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (column: SortColumn) => {
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

  const companiesWithEmissions = filterAndSortCompanies(
    companies,
    sortBy,
    sortOrder,
  );

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

      <CompaniesTable
        companies={companiesWithEmissions}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        currentLanguage={currentLanguage}
      />

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
