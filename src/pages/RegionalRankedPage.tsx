import { useState, useMemo } from "react";
import { Map, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FeatureCollection } from "geojson";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import TerritoryMap, { DataItem } from "@/components/maps/TerritoryMap";
import regionGeoJson from "@/data/regionGeo.json";
import { useRankedRegionsURLParams } from "@/hooks/regions/useRankedRegionsURLParams";
import {
  useRegions,
  RegionData,
  useRegionalKPIs,
} from "@/hooks/regions/useRegionKPIs";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import RegionalInsightsPanel from "@/components/regions/RegionalInsightsPanel";
import { Region } from "@/types/region";
import { toMapRegionName } from "@/utils/regionUtils";
import { RegionalRankedList } from "@/components/regions/RegionalRankedList";
import { KPIDataSelector } from "@/components/ranked/KPIDataSelector";
import { createEntityClickHandler } from "@/utils/routing";
import { RankedListItem } from "@/types/rankings";

export function RegionalRankedPage() {
  const { t } = useTranslation();
  const regionalKPIs = useRegionalKPIs();
  const [geoData] = useState(regionGeoJson);
  const { regionsData } = useRegions();

  const navigate = useNavigate();

  const {
    selectedKPI,
    setSelectedKPI,
    viewMode,
    setKPIInURL,
    setViewModeInURL,
  } = useRankedRegionsURLParams(regionalKPIs);

  const handleRegionClick = createEntityClickHandler(
    navigate,
    "region",
    viewMode,
  );

  // Create an adapter for MapOfSweden
  const handleRegionAreaClick = (name: string) => {
    const region = regionsData.find((m) => m.name === name);
    if (region) {
      handleRegionClick(region);
    } else {
      handleRegionClick(name);
    }
  };

  // Transform regions data from regional KPIs endpoint into required formats
  const regionEntities: RankedListItem[] = useMemo(() => {
    return regionsData.map((regionData: RegionData) => {
      const mapName = toMapRegionName(regionData.name);
      return {
        name: regionData.name,
        id: regionData.name,
        displayName: regionData.name,
        mapName,
        historicalEmissionChangePercent:
          regionData.historicalEmissionChangePercent,
        meetsParis: regionData.meetsParis,
      };
    });
  }, [regionsData]);

  const mapData: DataItem[] = useMemo(() => {
    return regionEntities.map((region) => ({
      ...region,
      id: region.mapName,
      name: region.mapName,
      displayName: region.displayName,
    }));
  }, [regionEntities]);

  const regionsAsEntities: Region[] = useMemo(() => {
    return regionEntities.map((region) => ({
      id: String(region.id),
      name: region.displayName,
      emissions: null,
      historicalEmissionChangePercent:
        typeof region.historicalEmissionChangePercent === "number"
          ? region.historicalEmissionChangePercent
          : null,
      meetsParis:
        typeof region.meetsParis === "boolean" ? region.meetsParis : null,
    }));
  }, [regionEntities]);

  const regionalRankedList = (
    <RegionalRankedList
      regionEntities={regionEntities}
      selectedKPI={selectedKPI}
      onItemClick={handleRegionClick}
    />
  );

  const renderMapOrList = (isMobile: boolean) =>
    viewMode === "map" ? (
      <div className={isMobile ? "relative h-[65vh]" : "relative h-full"}>
        <TerritoryMap
          entityType="regions"
          geoData={geoData as FeatureCollection}
          data={mapData}
          selectedKPI={selectedKPI}
          onAreaClick={handleRegionAreaClick}
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
          showTitles
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
          regionsData={regionsAsEntities}
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
          regionsData={regionsAsEntities}
          selectedKPI={selectedKPI}
        />
      </div>
    </>
  );
}
