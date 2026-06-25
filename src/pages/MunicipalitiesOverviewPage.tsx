import { useState, useEffect, useCallback, useMemo } from "react";
import { Map, List } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FeatureCollection } from "geojson";
import { PageHeader } from "@/components/layout/PageHeader";
import InsightsPanel from "@/components/municipalities/rankedList/MunicipalityInsightsPanel";
import TerritoryMap from "@/components/maps/TerritoryMap";
import municipalityGeoJson from "@/data/municipalityGeo.json";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import {
  useMunicipalityKPIs,
  useMunicipalityKPIDefinitions,
} from "@/hooks/municipalities/useMunicipalityKPIs";
import { RankedListItem } from "@/types/rankings";
import { createEntityClickHandler } from "@/utils/routing";
import { MunicipalityRankedList } from "@/components/municipalities/MunicipalityRankedList";
import {
  normalizeMunicipalityKpiApiItem,
  toMunicipalityMapDataItem,
} from "@/utils/territoryMapData";
import {
  OverviewSplitLayout,
  type OverviewViewMode,
} from "@/components/ranked/OverviewSplitLayout";
import { MunicipalityKPISelector } from "@/components/municipalities/MunicipalityKPISelector";
import { MunicipalitySummaryBar } from "@/components/municipalities/MunicipalitySummaryBar";
import type { Municipality } from "@/types/municipality";

export function MunicipalitiesOverviewPage() {
  const { t } = useTranslation();
  const {
    municipalitiesData,
    loading: municipalitiesLoading,
    error: municipalitiesError,
  } = useMunicipalityKPIs();
  const municipalityKPIs = useMunicipalityKPIDefinitions();

  const municipalities: Municipality[] = useMemo(
    () =>
      municipalitiesData.map((m) =>
        normalizeMunicipalityKpiApiItem(m),
      ) as Municipality[],
    [municipalitiesData],
  );
  const [geoData] = useState(municipalityGeoJson);

  const location = useLocation();
  const navigate = useNavigate();

  const getKPIFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const kpiKey = params.get("kpi");
    return (
      municipalityKPIs.find((kpi) => String(kpi.key) === kpiKey) ||
      municipalityKPIs[0]
    );
  }, [location.search, municipalityKPIs]);

  const setKPIInURL = (kpiId: string) => {
    const params = new URLSearchParams(location.search);
    params.set("kpi", kpiId);
    navigate({ search: params.toString() }, { replace: true });
  };

  const getViewModeFromURL = (): OverviewViewMode => {
    const params = new URLSearchParams(location.search);
    return params.get("view") === "list" ? "list" : "map";
  };
  const setViewModeInURL = (mode: OverviewViewMode) => {
    const params = new URLSearchParams(location.search);
    params.set("view", mode);
    navigate({ search: params.toString() }, { replace: true });
  };

  const [selectedKPI, setSelectedKPI] = useState(getKPIFromURL());
  const viewMode = getViewModeFromURL();

  useEffect(() => {
    const kpiFromUrl = getKPIFromURL();
    if (kpiFromUrl.label !== selectedKPI.label) {
      setSelectedKPI(kpiFromUrl);
    }
  }, [getKPIFromURL, selectedKPI.label]);

  const handleMunicipalityClick = createEntityClickHandler(
    navigate,
    "municipality",
    viewMode,
  );

  const mapData = useMemo(
    () => municipalitiesData.map(toMunicipalityMapDataItem),
    [municipalitiesData],
  );

  const handleMunicipalityAreaClick = (name: string) => {
    const municipality = municipalities.find((m) => m.name === name);
    if (municipality) {
      handleMunicipalityClick(municipality);
    } else {
      handleMunicipalityClick(name);
    }
  };

  // Transform municipalities to RankedListItem format
  const municipalityEntities: RankedListItem[] = useMemo(() => {
    return municipalities.map((municipality) => {
      const { sectorEmissions, ...rest } = municipality;
      return {
        ...rest,
        id: municipality.name,
        displayName: municipality.name,
        mapName: municipality.name,
      };
    });
  }, [municipalities]);

  if (municipalitiesLoading) {
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

  if (municipalitiesError) {
    return (
      <div className="text-center py-24">
        <h3 className="text-red-500 mb-4 text-xl">
          {t("municipalitiesOverviewPage.errorTitle")}
        </h3>
        <p className="text-grey">
          {t("municipalitiesOverviewPage.errorDescription")}
        </p>
      </div>
    );
  }

  const municipalityRankedList = (
    <MunicipalityRankedList
      municipalityEntities={municipalityEntities}
      selectedKPI={selectedKPI}
      onItemClick={handleMunicipalityClick}
    />
  );

  const mapPanel = (
    <TerritoryMap
      entityType="municipalities"
      geoData={geoData as FeatureCollection}
      data={mapData}
      selectedKPI={selectedKPI}
      onAreaClick={handleMunicipalityAreaClick}
      className="max-w-none"
    />
  );

  return (
    <>
      <PageHeader
        title={t("municipalitiesOverviewPage.title")}
        description={t("municipalitiesOverviewPage.description")}
        className="-ml-4"
      />

      <div className="flex mb-4 md:hidden">
        <ViewModeToggle
          viewMode={viewMode}
          modes={["map", "list"]}
          onChange={(mode) => setViewModeInURL(mode)}
          titles={{
            map: t("municipalities.list.viewToggle.showMap"),
            list: t("municipalities.list.viewToggle.showList"),
          }}
          showTitles
          icons={{
            map: <Map className="w-4 h-4" />,
            list: <List className="w-4 h-4" />,
          }}
        />
      </div>

      <MunicipalityKPISelector
        selectedKPI={selectedKPI}
        kpis={municipalityKPIs}
        onKPIChange={(kpi) => {
          setSelectedKPI(kpi);
          setKPIInURL(String(kpi.key));
        }}
      />

      <MunicipalitySummaryBar
        municipalities={municipalities}
        selectedKPI={selectedKPI}
      />

      <div className="space-y-6">
        <OverviewSplitLayout
          viewMode={viewMode}
          visualizationMode="map"
          visualization={mapPanel}
          list={municipalityRankedList}
        />
        <InsightsPanel
          municipalityData={municipalities}
          selectedKPI={selectedKPI}
        />
      </div>
    </>
  );
}
