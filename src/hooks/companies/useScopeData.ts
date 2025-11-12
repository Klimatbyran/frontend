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
        p.endDate.startsWith(selectedYear),
      );

      if (period?.emissions) {
        const scope1Value = period.emissions.scope1?.total || 0;
        if (scope1Value > 0) {
          data.scope1.total += scope1Value;
          data.scope1.companies++;
        }

        const scope2Value =
          period.emissions.scope2?.calculatedTotalEmissions || 0;
        if (scope2Value > 0) {
          data.scope2.total += scope2Value;
          data.scope2.companies++;
        }

        const scope3Value =
          period.emissions.scope3?.calculatedTotalEmissions || 0;
        if (scope3Value > 0) {
          data.scope3.upstream.total += scope3Value * 0.6;
          data.scope3.downstream.total += scope3Value * 0.4;
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
        yearSet.add(period.endDate.substring(0, 4));
      });
    });
    return Array.from(yearSet).sort();
  }, [companies]);

  return { scopeData, totalEmissions, years };
};
