import { useState, useMemo } from "react";
import { Map, List, ArrowDownCircle, Leaf } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FeatureCollection } from "geojson";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import TerritoryMap, { DataItem } from "@/components/maps/TerritoryMap";
import regionGeoJson from "@/data/regionGeo.json";
import { useRankedRegionsURLParams } from "@/hooks/regions/useRankedRegionsURLParams";
import {
  useRegionsKPIs,
  RegionKPIData,
  useRegionalKPIs,
} from "@/hooks/regions/useRegionKPIs";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import RegionalInsightsPanel from "@/components/regions/RegionalInsightsPanel";
import { Region } from "@/types/region";
import { resolveRegionFromMapName, toMapRegionName } from "@/utils/regionUtils";
import { toRegionMapDataItem } from "@/utils/territoryMapData";
import { RegionalRankedList } from "@/components/regions/RegionalRankedList";
import { KPIChipSelector } from "@/components/ranked/KPIChipSelector";
import { OverviewSplitLayout } from "@/components/ranked/OverviewSplitLayout";
import { createEntityClickHandler } from "@/utils/routing";
import { RankedListItem } from "@/types/rankings";

const REGION_KPI_ICONS: Record<string, React.ReactNode> = {
  historicalEmissionChangePercent: <ArrowDownCircle className="w-4 h-4" />,
  meetsParis: <Leaf className="w-4 h-4" />,
};

export function RegionalOverviewPage() {
  const { t } = useTranslation();
  const regionalKPIs = useRegionalKPIs();
  const [geoData] = useState(regionGeoJson);
  const {
    regionsData,
    loading: regionsLoading,
    error: regionsError,
  } = useRegionsKPIs();

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

  const handleRegionAreaClick = (name: string) => {
    const region = resolveRegionFromMapName(name, regionsData);
    handleRegionClick(region?.name ?? name);
  };

  // Transform regions data from regional KPIs endpoint into required formats
  const regionEntities: RankedListItem[] = useMemo(() => {
    return regionsData.map((regionData: RegionKPIData) => {
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

  const mapData: DataItem[] = useMemo(
    () => regionsData.map(toRegionMapDataItem),
    [regionsData],
  );

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

  if (regionsLoading) {
    return (
      <div className="animate-pulse space-y-16">
        <div className="h-12 w-1/3 bg-black-1 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 bg-black-1 rounded-level-2" />
          ))}
        </div>
      </div>
    );
  }

  if (regionsError) {
    return (
      <div className="text-center py-24">
        <h3 className="text-red-500 mb-4 text-xl">
          {t("regionalOverviewPage.errorTitle")}
        </h3>
        <p className="text-grey">
          {t("regionalOverviewPage.errorDescription")}
        </p>
      </div>
    );
  }

  const regionalRankedList = (
    <RegionalRankedList
      regionEntities={regionEntities}
      selectedKPI={selectedKPI}
      onItemClick={handleRegionClick}
    />
  );

  const mapPanel = (
    <TerritoryMap
      entityType="regions"
      geoData={geoData as FeatureCollection}
      data={mapData}
      selectedKPI={selectedKPI}
      onAreaClick={handleRegionAreaClick}
      defaultCenter={[63.7, 17]}
      className="max-w-none"
    />
  );

  return (
    <>
      <PageHeader
        title={t("regionalOverviewPage.title")}
        description={t("regionalOverviewPage.description")}
        className="-ml-4"
      />

      <KPIChipSelector<Region>
        selectedKPI={selectedKPI}
        kpis={regionalKPIs}
        onKPIChange={(kpi) => {
          setSelectedKPI(kpi);
          setKPIInURL(String(kpi.key));
        }}
        iconMap={REGION_KPI_ICONS}
        translationPrefix="regions.list"
        label={t("municipalities.list.dataSelector.label")}
      />

      <div className="space-y-4">
        <div className="flex">
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
        <OverviewSplitLayout
          viewMode={viewMode}
          visualizationMode="map"
          visualization={mapPanel}
          list={regionalRankedList}
        />
        <RegionalInsightsPanel
          regionsData={regionsAsEntities}
          selectedKPI={selectedKPI}
        />
      </div>
    </>
  );
}
