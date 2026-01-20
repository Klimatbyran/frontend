import { useMemo } from "react";
import { RankedCompany } from "@/types/company";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";

export const useChartData = (
  companies: RankedCompany[],
  selectedSectors: string[],
  selectedSector: string | null,
  chartType: "pie",
  selectedYear: string,
) => {
  const sectorNames = useSectorNames();

  const chartData = useMemo(() => {
    const years = new Set<string>();
    companies.forEach((company) => {
      company.reportingPeriods.forEach((period) => {
        years.add(period.endDate.substring(0, 4));
      });
    });

    return Array.from(years)
      .sort()
      .map((year) => {
        const yearData: { [key: string]: any } = { year };

        // For pie chart, we need scope data for each sector
        selectedSectors.forEach((sectorCode) => {
          const sectorName =
            sectorNames[sectorCode as keyof typeof sectorNames];
          let scope1 = 0;
          let scope2 = 0;
          let scope3 = 0;

          companies.forEach((company) => {
            if (company.industry?.industryGics.sectorCode === sectorCode) {
              const periodForYear = company.reportingPeriods.find((period) =>
                period.endDate.startsWith(year),
              );

              if (periodForYear?.emissions) {
                scope1 += periodForYear.emissions.scope1?.total || 0;
                scope2 +=
                  periodForYear.emissions.scope2?.calculatedTotalEmissions ||
                  0;
                scope3 +=
                  periodForYear.emissions.scope3?.calculatedTotalEmissions ||
                  0;
              }
            }
          });

          yearData[`${sectorName}_scope1`] = scope1;
          yearData[`${sectorName}_scope2`] = scope2;
          yearData[`${sectorName}_scope3`] = scope3;
        });

        return yearData;
      });
  }, [companies, selectedSectors, sectorNames]);

  const pieChartData = useMemo(() => {
    if (selectedSector) {
      const sectorCompanies = companies.filter(
        (company) =>
          company.industry?.industryGics.sectorCode === selectedSector,
      );

      const companyData = sectorCompanies
        .map((company) => {
          const periodForYear = company.reportingPeriods.find((period) =>
            period.endDate.startsWith(selectedYear),
          );

          const scope1 = periodForYear?.emissions?.scope1?.total || 0;
          const scope2 =
            periodForYear?.emissions?.scope2?.calculatedTotalEmissions || 0;
          const scope3 =
            periodForYear?.emissions?.scope3?.calculatedTotalEmissions || 0;
          const totalEmissions = scope1 + scope2 + scope3;

          return {
            name: company.name,
            value: totalEmissions,
            sectorCode: company.industry?.industryGics.sectorCode,
            wikidataId: company.wikidataId,
            total: totalEmissions,
          };
        })
        .filter((item) => item.value > 0);

      const sectorTotal = companyData.reduce(
        (sum, item) => sum + item.value,
        0,
      );

      return companyData
        .map((item) => ({
          ...item,
          total: sectorTotal,
        }))
        .sort((a, b) => b.value / b.total - a.value / a.total);
    }

    const yearData = chartData.find((d) => d.year === selectedYear);
    if (!yearData) return [];

    const sectorTotals = selectedSectors
      .map((sectorCode) => {
        const sectorName = sectorNames[sectorCode as keyof typeof sectorNames];
        const scope1 = yearData[`${sectorName}_scope1`] || 0;
        const scope2 = yearData[`${sectorName}_scope2`] || 0;
        const scope3 = yearData[`${sectorName}_scope3`] || 0;
        const value = scope1 + scope2 + scope3;

        return {
          name: sectorName,
          value,
          sectorCode,
          scope1,
          scope2,
          scope3,
        };
      })
      .filter((item) => item.value > 0);

    const totalEmissions = sectorTotals.reduce(
      (sum, sector) => sum + sector.value,
      0,
    );
    return sectorTotals
      .map((sector) => ({ ...sector, total: totalEmissions }))
      .sort((a, b) => b.value / b.total - a.value / a.total);
  }, [
    chartData,
    selectedYear,
    selectedSectors,
    selectedSector,
    companies,
    sectorNames,
  ]);

  const totalEmissions = useMemo(() => {
    return pieChartData.reduce((sum, item) => sum + item.value, 0);
  }, [pieChartData]);

  const years = useMemo(
    () => Array.from(new Set(chartData.map((d) => d.year))).sort(),
    [chartData],
  );

  return {
    chartData,
    pieChartData,
    totalEmissions,
    years,
  };
};
