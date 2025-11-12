import { useState } from "react";
import { Map, List } from "lucide-react";

import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
import MapOfSweden from "@/components/maps/SwedenMap";
import regionGeoJson from "@/data/regionGeo.json";
import { FeatureCollection } from "geojson";
import { useRegions } from "@/hooks/regions/useRegions";
import { useRegionalKPIs } from "@/hooks/regions/useRegionKPIs";
import { useRankedRegionsURLParams } from "@/hooks/regions/useRankedRegionsURLParams";
import { useRegionDataTransformation } from "@/hooks/regions/useRegionDataTransformation";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import RegionalInsightsPanel from "@/components/regions/RegionalInsightsPanel";
import { KPIDataSelector } from "@/components/ranked/KPIDataSelector";
import { RegionalRankedList } from "@/components/regions/RegionalRankedList";

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

  const { regionEntities, mapData, regionsAsEntities } =
    useRegionDataTransformation(regionNames, regionsData);

  const regionalRankedList = (
    <RegionalRankedList
      regionEntities={regionEntities}
      selectedKPI={selectedKPI}
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
