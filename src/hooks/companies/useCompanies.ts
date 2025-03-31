import { useQuery } from "@tanstack/react-query";
import { getCompanies } from "@/lib/api";
import type { paths } from "@/lib/api-types";

// Get company type from API types
type Company = NonNullable<
  paths["/companies/"]["get"]["responses"][200]["content"]["application/json"]
>[0];

// Define the modified reporting period type with added IDs
type ReportingPeriodWithIds = Company["reportingPeriods"][0] & {
  id: string;
  emissions:
    | (Company["reportingPeriods"][0]["emissions"] & {
        id: string;
        biogenicEmissions: null;
      })
    | null;
};

export interface RankedCompany extends Omit<Company, "reportingPeriods"> {
  reportingPeriods: ReportingPeriodWithIds[];
  metrics: {
    emissionsReduction: number;
    displayReduction: string;
  };
}

function formatReductionValue(value: number): string {
  if (value > 200) return ">200";
  if (value < -200) return "<-200";
  return value.toFixed(1);
}

export function useCompanies() {
  const {
    data: companies = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
    select: (data): RankedCompany[] => {
      return data.map((company) => {
        // Calculate emissions reduction
        const latestPeriod = company.reportingPeriods[0];
        const previousPeriod = company.reportingPeriods[1];
        const currentEmissions =
          latestPeriod?.emissions?.calculatedTotalEmissions;
        const previousEmissions =
          previousPeriod?.emissions?.calculatedTotalEmissions;

        const emissionsReduction =
          previousEmissions && currentEmissions
            ? ((previousEmissions - currentEmissions) / previousEmissions) * 100
            : 0;

        return {
          ...company,
          reportingPeriods: company.reportingPeriods.map((period) => ({
            ...period,
            id: period.startDate,
            emissions: period.emissions
              ? {
                  ...period.emissions,
                  id: `${period.startDate}-emissions`,
                  biogenicEmissions: null,
                }
              : null,
          })),
          metrics: {
            emissionsReduction,
            displayReduction: formatReductionValue(emissionsReduction),
          },
        };
      });
    },
  });

  const getCompaniesBySector = (sectorCode: string) => {
    return (companies || [])
      .filter(
        (company) => company.industry?.industryGics?.sectorCode === sectorCode
      )
      .sort(
        (a, b) => b.metrics.emissionsReduction - a.metrics.emissionsReduction
      );
  };

  return {
    companies,
    loading: isLoading,
    error,
    getCompaniesBySector,
  };
}
