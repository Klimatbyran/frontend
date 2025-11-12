import { useMemo, useState } from "react";
import { Map, List } from "lucide-react";

import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
import MapOfSweden, { DataItem } from "@/components/maps/SwedenMap";
import regionGeoJson from "@/data/regionGeo.json";
import { FeatureCollection } from "geojson";
import { useRegions } from "@/hooks/regions/useRegions";
import { useRegionalKPIs } from "@/hooks/regions/useRegionKPIs";
import { useRankedRegionsURLParams } from "@/hooks/regions/useRankedRegionsURLParams";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import RankedList from "@/components/ranked/RankedList";
import { DataPoint } from "@/types/entity-rankings";
import RegionalInsightsPanel from "@/components/regions/RegionalInsightsPanel";
import { Region } from "@/types/region";
import { KPIDataSelector } from "@/components/ranked/KPIDataSelector";

const toMapRegionName = (regionName: string): string => {
  if (!regionName) {
    return regionName;
  }

  if (regionName.toLowerCase().endsWith(" län")) {
    const withoutLan = regionName.slice(0, -4);
    return withoutLan.endsWith("s") ? withoutLan.slice(0, -1) : withoutLan;
  }

  return regionName;
};

type RegionListItem = DataItem & {
  mapName: string;
  displayName: string;
};

export function RegionalRankedPage() {
  const { t } = useTranslation();
  const regionalKPIs = useRegionalKPIs();
  const [geoData] = useState(regionGeoJson);
  const { regions: regionNames, regionsData } = useRegions();

  const {
    selectedKPI,
    setSelectedKPI,
    viewMode,
    setKPIInURL,
    setViewModeInURL,
  } = useRankedRegionsURLParams(regionalKPIs);

  // Calculate regions data without calling hooks in map
  const regionEntities: RegionListItem[] = useMemo(() => {
    return regionNames.map((displayName) => {
      const regionData = regionsData.find((r) => r.name === displayName);
      const mapName = toMapRegionName(displayName);

      if (!regionData || !regionData.emissions) {
        return {
          name: displayName,
          id: displayName,
          displayName,
          mapName,
          emissions: null,
          historicalEmissionChangePercent: null,
          meetsParis: null,
        };
      }

      const years = Object.keys(regionData.emissions)
        .filter((key) => !isNaN(Number(key)))
        .map((year) => Number(year))
        .sort((a, b) => a - b);

      const latestYear = years[years.length - 1];
      const latestYearData =
        latestYear !== undefined
          ? regionData.emissions[latestYear.toString()]
          : null;

      return {
        name: displayName,
        id: displayName,
        displayName,
        mapName,
        emissions:
          typeof latestYearData === "number" ? latestYearData / 1000 : null,
        historicalEmissionChangePercent:
          typeof regionData.historicalEmissionChangePercent === "number"
            ? regionData.historicalEmissionChangePercent
            : null,
        meetsParis:
          typeof regionData.meetsParis === "boolean"
            ? regionData.meetsParis
            : null,
      };
    });
  }, [regionNames, regionsData]);

  const mapData: DataItem[] = useMemo(() => {
    return regionEntities.map((region) => ({
      ...region,
      id: region.mapName,
      name: region.mapName,
      displayName: region.displayName,
    }));
  }, [regionEntities]);

  const regionsAsEntities = useMemo<Region[]>(() => {
    return regionEntities.map((region) => ({
      id: String(region.id),
      name: region.displayName,
      emissions: typeof region.emissions === "number" ? region.emissions : null,
      historicalEmissionChangePercent:
        typeof region.historicalEmissionChangePercent === "number"
          ? region.historicalEmissionChangePercent
          : null,
      meetsParis:
        typeof region.meetsParis === "boolean" ? region.meetsParis : null,
    }));
  }, [regionEntities]);

  const asDataPoint = (kpi: unknown): DataPoint<RegionListItem> =>
    kpi as DataPoint<RegionListItem>;

  const regionalRankedList = (
    <RankedList
      data={regionEntities}
      selectedDataPoint={asDataPoint({
        label: selectedKPI.label,
        key: selectedKPI.key as keyof RegionListItem,
        unit: selectedKPI.unit,
        description: selectedKPI.description,
        higherIsBetter: selectedKPI.higherIsBetter,
        nullValues: selectedKPI.nullValues,
        isBoolean: selectedKPI.isBoolean,
        booleanLabels: selectedKPI.booleanLabels,
        formatter: (value: unknown) => {
          if (value === null || value === undefined) {
            return selectedKPI.nullValues
              ? t(selectedKPI.nullValues)
              : t("noData");
          }

          if (typeof value === "boolean") {
            return value
              ? t(`regions.list.kpis.${selectedKPI.key}.booleanLabels.true`)
              : t(`regions.list.kpis.${selectedKPI.key}.booleanLabels.false`);
          }

          if (typeof value === "number") {
            return value.toFixed(1);
          }

          return String(value);
        },
      })}
      onItemClick={() => {}}
      searchKey="displayName"
      searchPlaceholder={t("rankedList.search.placeholder")}
    />
  );

  const renderMapOrList = (isMobile: boolean) =>
    viewMode === "map" ? (
      <div className={isMobile ? "relative h-[65vh]" : "relative h-full"}>
        <MapOfSweden
          entityType="regions"
          geoData={geoData as FeatureCollection}
          data={mapData}
          selectedKPI={selectedKPI}
          defaultCenter={[63.7, 17]}
        />
      </div>
    ) : (
      regionalRankedList
    );

  return (
    <>
      <PageHeader
        title={t("regionalRankedPage.title")}
        description={t("regionalRankedPage.description")}
        className="-ml-4"
      />

      <KPIDataSelector
        selectedKPI={selectedKPI}
        onKPIChange={(kpi) => {
          setSelectedKPI(kpi);
          setKPIInURL(String(kpi.key));
        }}
        kpis={regionalKPIs}
        translationPrefix="regions.list"
      />

      <div className="flex mb-4 lg:hidden">
        <ViewModeToggle
          viewMode={viewMode}
          modes={["map", "list"]}
          onChange={(mode) => setViewModeInURL(mode)}
          titles={{
            map: t("viewModeToggle.map"),
            list: t("viewModeToggle.list"),
          }}
          showTitles={true}
          icons={{
            map: <Map className="w-4 h-4" />,
            list: <List className="w-4 h-4" />,
          }}
        />
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-6">
        {renderMapOrList(true)}
        <RegionalInsightsPanel
          regionData={regionsAsEntities}
          selectedKPI={selectedKPI}
        />
      </div>

      {/* Desktop View */}
      <div className="hidden lg:grid grid-cols-1 gap-6">
        <div className="grid grid-cols-2 gap-6">
          {renderMapOrList(false)}
          {viewMode === "map" ? regionalRankedList : null}
        </div>
        <RegionalInsightsPanel
          regionData={regionsAsEntities}
          selectedKPI={selectedKPI}
        />
      </div>
    </>
  );
}
