import { useMemo, useState } from "react";
import {
  useNationDetails,
  useNationDetailHeaderStats,
} from "@/hooks/nation/useNationDetails";
import { TerritoryEmissions } from "@/components/territories/TerritoryEmissions";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { DetailWrapper } from "@/components/detail/DetailWrapper";
import { useSectorEmissions } from "@/hooks/territories/useSectorEmissions";
import { useSectors } from "@/hooks/territories/useSectors";
import { useHiddenItems } from "@/components/charts";
import {
  getAvailableYearsFromSectors,
  getCurrentYearFromAvailable,
} from "@/utils/detail/sectorYearUtils";
import { SectorEmissionsChart } from "@/components/charts/sectorChart/SectorEmissions";
import { DataPoint } from "@/types/emissions";

const EMISSIONS_DATA_START_YEAR = 1990;
const EMISSIONS_DATA_END_YEAR = 2050;

export function NationDetailPage() {
  const { nation, loading, error } = useNationDetails();
  const { sectorEmissions } = useSectorEmissions("nation", undefined);
  const { getSectorInfo } = useSectors();
  const { hiddenItems: filteredSectors, setHiddenItems: setFilteredSectors } =
    useHiddenItems<string>([]);
  const [selectedYear, setSelectedYear] = useState<string>("2023");

  // Transform emissions data for chart
  const emissionsData = useMemo(() => {
    if (!nation || !nation.emissions) return [];

    // Collect all years from emissions, approximatedHistoricalEmission, trend, and carbonLaw
    const years = new Set<string>();
    Object.keys(nation.emissions).forEach((year) => years.add(year));
    Object.keys(nation.approximatedHistoricalEmission || {}).forEach((year) =>
      years.add(year),
    );
    Object.keys(nation.trend || {}).forEach((year) => years.add(year));
    Object.keys(nation.carbonLaw || {}).forEach((year) => years.add(year));

    return Array.from(years)
      .filter((year) => !isNaN(Number(year)))
      .map((year) => {
        const yearNum = Number(year);
        return {
          year: yearNum,
          total: nation.emissions[year]
            ? nation.emissions[year] / 1000
            : undefined, // Convert to tons
          approximated: nation.approximatedHistoricalEmission?.[year]
            ? nation.approximatedHistoricalEmission[year] / 1000
            : undefined, // Convert to tons
          trend: nation.trend?.[year] ? nation.trend[year] / 1000 : undefined, // Convert to tons
          carbonLaw: nation.carbonLaw?.[year]
            ? nation.carbonLaw[year] / 1000
            : undefined, // Convert to tons
        } as DataPoint;
      })
      .sort((a, b) => a.year - b.year)
      .filter(
        (d) =>
          d.year >= EMISSIONS_DATA_START_YEAR &&
          d.year <= EMISSIONS_DATA_END_YEAR,
      );
  }, [nation]);

  const lastYearEmissions = useMemo(() => {
    return emissionsData
      .filter((d) => d.total !== undefined)
      .sort((a, b) => b.year - a.year)[0];
  }, [emissionsData]);
  const lastYear = lastYearEmissions?.year;

  const headerStats = useNationDetailHeaderStats(nation, lastYear);

  const availableYears = getAvailableYearsFromSectors(sectorEmissions);
  const currentYear = getCurrentYearFromAvailable(
    selectedYear,
    availableYears,
    lastYear ?? 2023,
  );

  if (loading) return <PageLoading />;
  if (error) return <PageError />;
  if (!nation) return <PageNoData />;

  return (
    <>
      <DetailWrapper>
        <DetailHeader
          name={nation.country}
          logoUrl={nation.logoUrl}
          helpItems={["regionTotalEmissions", "detailWhyDataDelay"]}
          stats={headerStats}
          translateNamespace="nation.detailPage"
        />

        <TerritoryEmissions
          emissionsData={emissionsData}
          sectorEmissions={sectorEmissions}
        />

        <SectorEmissionsChart
          sectorEmissions={sectorEmissions}
          availableYears={availableYears}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          currentYear={currentYear}
          getSectorInfo={getSectorInfo}
          filteredSectors={filteredSectors}
          onFilteredSectorsChange={setFilteredSectors}
          helpItems={["municipalityEmissionSources"]}
        />
      </DetailWrapper>
    </>
  );
}
