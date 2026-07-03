import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Leaf,
  ArrowDownCircle,
  ShoppingCart,
  FileCheck,
  Zap,
  ArrowUpCircle,
  Map,
  List,
} from "lucide-react";
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
import { useScreenSize } from "@/hooks/useScreenSize";
import { KPIChipSelector } from "@/components/ranked/KPIChipSelector";
import { OverviewPageSkeleton } from "@/components/ranked/OverviewPageSkeleton";
import type { Municipality } from "@/types/municipality";

// ArrowDownCircle = "lower is better / goal is reduction"
// ArrowUpCircle   = "higher is better / goal is increase"
const MUNICIPALITY_KPI_ICONS: Record<string, React.ReactNode> = {
  meetsParisGoal: <Leaf className="w-4 h-4" />,
  historicalEmissionChangePercent: <ArrowDownCircle className="w-4 h-4" />,
  totalConsumptionEmission: <ShoppingCart className="w-4 h-4" />,
  climatePlan: <FileCheck className="w-4 h-4" />,
  electricCarChangePercent: <ArrowUpCircle className="w-4 h-4" />,
  electricVehiclePerChargePoints: <Zap className="w-4 h-4" />,
  bicycleMetrePerCapita: <ArrowUpCircle className="w-4 h-4" />,
};

export function MunicipalitiesOverviewPage() {
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();
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
      municipalityKPIs.find(
        (kpi) => String(kpi.key) === "historicalEmissionChangePercent",
      ) ||
      municipalityKPIs[0]
    );
  }, [location.search, municipalityKPIs]);

  const setKPIInURL = (kpiId: string) => {
    const params = new URLSearchParams(location.search);
    params.set("kpi", kpiId);
    navigate({ search: params.toString() }, { replace: true });
  };

  const getViewModeFromURL = useCallback((): OverviewViewMode => {
    const params = new URLSearchParams(location.search);
    return params.get("view") === "list" ? "list" : "map";
  }, [location.search]);

  const setViewModeInURL = (mode: OverviewViewMode) => {
    const params = new URLSearchParams(location.search);
    params.set("view", mode);
    navigate({ search: params.toString() }, { replace: true });
  };

  const [selectedKPI, setSelectedKPI] = useState(getKPIFromURL());
  const viewMode = getViewModeFromURL();

  useEffect(() => {
    setSelectedKPI(getKPIFromURL());
  }, [getKPIFromURL]);

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
    return <OverviewPageSkeleton />;
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

  const viewToggle = (
    <ViewModeToggle
      viewMode={viewMode}
      modes={["map", "list"]}
      onChange={setViewModeInURL}
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
  );

  const municipalityRankedList = (
    <MunicipalityRankedList
      municipalityEntities={municipalityEntities}
      selectedKPI={selectedKPI}
      onItemClick={handleMunicipalityClick}
      headerAction={viewToggle}
    />
  );

  const mapPanel = (
    <TerritoryMap
      entityType="municipalities"
      geoData={geoData as FeatureCollection}
      data={mapData}
      selectedKPI={selectedKPI}
      onAreaClick={handleMunicipalityAreaClick}
      defaultZoom={isMobile ? 4 : undefined}
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

      <KPIChipSelector<Municipality>
        selectedKPI={selectedKPI}
        kpis={municipalityKPIs}
        onKPIChange={(kpi) => {
          setSelectedKPI(kpi);
          setKPIInURL(String(kpi.key));
        }}
        iconMap={MUNICIPALITY_KPI_ICONS}
        translationPrefix="municipalities.list"
      />

      <div className="space-y-6">
        {/* Row 1: map/list (toggled) | stats panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <OverviewSplitLayout
            viewMode={viewMode}
            visualizationMode="map"
            visualization={mapPanel}
            list={municipalityRankedList}
            toggle={viewToggle}
          />
          <InsightsPanel
            municipalityData={municipalities}
            selectedKPI={selectedKPI}
            section="stats"
          />
        </div>

        {/* Row 2: top list | bottom list | distribution (numeric KPIs only) */}
        {!selectedKPI.isBoolean && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            <InsightsPanel
              municipalityData={municipalities}
              selectedKPI={selectedKPI}
              section="top"
            />
            <InsightsPanel
              municipalityData={municipalities}
              selectedKPI={selectedKPI}
              section="bottom"
            />
            <InsightsPanel
              municipalityData={municipalities}
              selectedKPI={selectedKPI}
              section="distribution"
            />
          </div>
        )}
      </div>
    </>
  );
}
