import { useMemo } from "react";
import { RankedCompany } from "@/types/company";
import {
  UPSTREAM_CATEGORIES,
  DOWNSTREAM_CATEGORIES,
} from "@/lib/constants/categories";

export type ScopeData = {
  scope1: { total: number; companies: number };
  scope2: { total: number; companies: number };
  scope3: {
    upstream: { total: number; companies: number };
    downstream: { total: number; companies: number };
  };
};

export const useScopeData = (
  companies: RankedCompany[],
  selectedSectors: string[],
  selectedYear: string,
) => {
  const scopeData = useMemo(() => {
    const filteredCompanies = companies.filter((company) =>
      selectedSectors.includes(
        company.industry?.industryGics?.sectorCode || "",
      ),
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

        // For scope 3, only use companies that have category-level data
        const scope3Categories = period.emissions.scope3?.categories;
        if (scope3Categories && scope3Categories.length > 0) {
          let upstreamTotal = 0;
          let downstreamTotal = 0;

          scope3Categories.forEach((category) => {
            const categoryValue = category.total || 0;
            if (UPSTREAM_CATEGORIES.includes(category.category as number)) {
              upstreamTotal += categoryValue;
            } else if (
              DOWNSTREAM_CATEGORIES.includes(category.category as number)
            ) {
              downstreamTotal += categoryValue;
            }
          });

          if (upstreamTotal > 0 || downstreamTotal > 0) {
            data.scope3.upstream.total += upstreamTotal;
            data.scope3.downstream.total += downstreamTotal;
            data.scope3.upstream.companies++;
            data.scope3.downstream.companies++;
          }
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
