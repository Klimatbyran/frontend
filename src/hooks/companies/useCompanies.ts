import { useQuery } from "@tanstack/react-query";
import { getCompanies } from "@/lib/api";
import { cleanEmissions } from "@/utils/data/cleaning";
import type {
  Emissions,
  RankedCompany,
  TransformedReportingPeriod,
} from "@/types/company";

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
          reportingPeriods: company.reportingPeriods.map(
            (period): TransformedReportingPeriod => ({
              ...period,
              id: period.startDate,
              emissions: cleanEmissions(period.emissions),
              economy: period.economy
                ? {
                    ...period.economy,
                    turnover: period.economy.turnover
                      ? { ...period.economy.turnover }
                      : null,
                    employees: period.economy.employees
                      ? { ...period.economy.employees }
                      : null,
                  }
                : null,
            }),
          ),
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
        (company) => company.industry?.industryGics?.sectorCode === sectorCode,
      )
      .sort(
        (a, b) => b.metrics.emissionsReduction - a.metrics.emissionsReduction,
      );
  };

  return {
    companies,
    loading: isLoading,
    error,
    getCompaniesBySector,
  };
}
