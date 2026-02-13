import { useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  useRegionDetails,
  useRegionDetailHeaderStats,
} from "@/hooks/regions/useRegionDetails";
import { TerritoryEmissions } from "@/components/territories/TerritoryEmissions";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { DetailWrapper } from "@/components/detail/DetailWrapper";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import { MunicipalityListBox } from "@/components/regions/MunicipalityListBox";
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

export function RegionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { region, loading, error } = useRegionDetails(id || "");
  const { municipalities } = useMunicipalities();
  const { sectorEmissions } = useSectorEmissions("regions", id);
  const { getSectorInfo } = useSectors();
  const { hiddenItems: filteredSectors, setHiddenItems: setFilteredSectors } =
    useHiddenItems<string>([]);
  const [selectedYear, setSelectedYear] = useState<string>("2023");

  // Transform emissions data for chart
  const emissionsData = useMemo(() => {
    if (!region || !region.emissions) return [];

    // Collect all years from emissions, approximatedHistoricalEmission, trend, and carbonLaw
    const years = new Set<string>();
    Object.keys(region.emissions).forEach((year) => years.add(year));
    Object.keys(region.approximatedHistoricalEmission || {}).forEach((year) =>
      years.add(year),
    );
    Object.keys(region.trend || {}).forEach((year) => years.add(year));
    Object.keys(region.carbonLaw || {}).forEach((year) => years.add(year));

    return Array.from(years)
      .filter((year) => !isNaN(Number(year)))
      .map((year) => {
        const yearNum = Number(year);
        return {
          year: yearNum,
          total: region.emissions[year]
            ? region.emissions[year] / 1000
            : undefined, // Convert to tons
          approximated: region.approximatedHistoricalEmission?.[year]
            ? region.approximatedHistoricalEmission[year] / 1000
            : undefined, // Convert to tons
          trend: region.trend?.[year] ? region.trend[year] / 1000 : undefined, // Convert to tons
          carbonLaw: region.carbonLaw?.[year]
            ? region.carbonLaw[year] / 1000
            : undefined, // Convert to tons
        } as DataPoint;
      })
      .sort((a, b) => a.year - b.year)
      .filter(
        (d) =>
          d.year >= EMISSIONS_DATA_START_YEAR &&
          d.year <= EMISSIONS_DATA_END_YEAR,
      );
  }, [region]);

  const lastYearEmissions = useMemo(() => {
    return emissionsData
      .filter((d) => d.total !== undefined)
      .sort((a, b) => b.year - a.year)[0];
  }, [emissionsData]);
  const lastYear = lastYearEmissions?.year;

  const headerStats = useRegionDetailHeaderStats(region, lastYear);

  const availableYears = getAvailableYearsFromSectors(sectorEmissions);
  const currentYear = getCurrentYearFromAvailable(
    selectedYear,
    availableYears,
    lastYear ?? 2023,
  );

  // Filter municipalities that belong to this region
  const regionMunicipalities = useMemo(() => {
    if (!region || !municipalities) return [];
    return municipalities
      .filter((m) => m.region === region.name)
      .map((m) => m.name)
      .sort();
  }, [region, municipalities]);

  if (loading) return <PageLoading />;
  if (error) return <PageError />;
  if (!region) return <PageNoData />;

  return (
    <>
      <DetailWrapper>
        <DetailHeader
          name={region.name}
          logoUrl={region.logoUrl}
          helpItems={["regionTotalEmissions", "detailWhyDataDelay"]}
          stats={headerStats}
          translateNamespace="regions.detailPage"
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

        <MunicipalityListBox
          municipalities={regionMunicipalities}
          translateNamespace="regions.detailPage"
        />
      </DetailWrapper>
    </>
  );
}
