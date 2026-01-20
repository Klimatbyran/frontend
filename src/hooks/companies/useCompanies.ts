import { useQuery } from "@tanstack/react-query";
import { getCompanies } from "@/lib/api";
import { cleanEmissions } from "@/utils/data/cleaning";
import type { RankedCompany, ReportingPeriodFromList } from "@/types/company";

function formatReductionValue(value: number): string {
  if (value > 200) return ">200";
  if (value < -200) return "<-200";
  return value.toFixed(1);
}

interface ICompaniesReturn {
  companies: RankedCompany[];
  companiesLoading: boolean;
  companiesError: any;
  getCompaniesBySector: (sectorCode: string) => RankedCompany[];
}

export function useCompanies(): ICompaniesReturn {
  const {
    data: companies = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
    staleTime: 1800000,
    select: (data): RankedCompany[] => {
      return data.map((company) => {
        // Calculate emissions reduction
        const latestPeriod = company.reportingPeriods?.[0];
        const previousPeriod = company.reportingPeriods?.[1];
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
          reportingPeriods: (company.reportingPeriods || []).map(
            (period): ReportingPeriodFromList => ({
              ...period,
              emissions: cleanEmissions(period.emissions),
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
    companiesLoading: isLoading,
    companiesError: error,
    getCompaniesBySector,
  };
}
