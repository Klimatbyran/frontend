import { useMemo } from "react";
import { RankedCompany } from "@/types/company";

export const useScopeData = (
  companies: RankedCompany[],
  selectedSectors: string[],
  selectedYear: string,
) => {
  const scopeData = useMemo(() => {
    const filteredCompanies = companies.filter((company) =>
      selectedSectors.includes(company.industry?.industryGics.sectorCode || ""),
    );

    const data = {
      scope1: { total: 0, companies: 0 },
      scope2: { total: 0, companies: 0 },
      scope3: {
        upstream: { total: 0, companies: 0 },
        downstream: { total: 0, companies: 0 },
      },
    };

    filteredCompanies.forEach((company) => {
      const period = company.reportingPeriods.find((p) =>
        p.startDate.startsWith(selectedYear),
      );

      if (period?.emissions) {
        if (period.emissions.scope1?.total) {
          data.scope1.total += period.emissions.scope1.total;
          data.scope1.companies++;
        }

        if (period.emissions.scope2?.calculatedTotalEmissions) {
          data.scope2.total += period.emissions.scope2.calculatedTotalEmissions;
          data.scope2.companies++;
        }

        if (period.emissions.scope3?.calculatedTotalEmissions) {
          const total = period.emissions.scope3.calculatedTotalEmissions;
          data.scope3.upstream.total += total * 0.6;
          data.scope3.downstream.total += total * 0.4;
          data.scope3.upstream.companies++;
          data.scope3.downstream.companies++;
        }
      }
    });

    return data;
  }, [companies, selectedSectors, selectedYear]);

  const totalEmissions = useMemo(
    () =>
      scopeData.scope1.total +
      scopeData.scope2.total +
      scopeData.scope3.upstream.total +
      scopeData.scope3.downstream.total,
    [scopeData],
  );

  const years = useMemo(() => {
    const yearSet = new Set<string>();
    companies.forEach((company) => {
      company.reportingPeriods.forEach((period) => {
        yearSet.add(period.startDate.substring(0, 4));
      });
    });
    return Array.from(yearSet).sort();
  }, [companies]);

  return { scopeData, totalEmissions, years };
};
