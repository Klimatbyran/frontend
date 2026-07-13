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
import { RankedListItem, type KPIValue } from "@/types/rankings";
import { createEntityClickHandler } from "@/utils/routing";
import { MunicipalityRankedList } from "@/components/municipalities/MunicipalityRankedList";
import {
  normalizeMunicipalityKpiApiItem,
  toMunicipalityMapDataItem,
} from "@/utils/territoryMapData";
import {
  OverviewSplitLayout,
  OVERVIEW_PANEL_MD_HEIGHT,
  type OverviewViewMode,
} from "@/components/ranked/OverviewSplitLayout";
import { useScreenSize } from "@/hooks/useScreenSize";
import { KPIChipSelector } from "@/components/ranked/KPIChipSelector";
import { OverviewPageSkeleton } from "@/components/ranked/OverviewPageSkeleton";
import type { Municipality } from "@/types/municipality";

const MUNICIPALITY_KPI_ICONS: Record<string, React.ReactNode> = {
  meetsParisGoal: <Leaf className="w-4 h-4" />,
  historicalEmissionChangePercent: <ArrowDownCircle className="w-4 h-4" />,
  totalConsumptionEmission: <ShoppingCart className="w-4 h-4" />,
  climatePlan: <FileCheck className="w-4 h-4" />,
  electricCarChangePercent: <ArrowUpCircle className="w-4 h-4" />,
  electricVehiclePerChargePoints: <Zap className="w-4 h-4" />,
  bicycleMetrePerCapita: <ArrowUpCircle className="w-4 h-4" />,
};

function useMunicipalityUrlState(municipalityKPIs: KPIValue<Municipality>[]) {
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

  return { getKPIFromURL, setKPIInURL, getViewModeFromURL, setViewModeInURL };
}

function MunicipalitiesOverviewContent({
  municipalities,
  municipalityEntities,
  mapData,
  selectedKPI,
  viewMode,
  onKPIChange,
  onViewModeChange,
  onMunicipalityClick,
  onMunicipalityAreaClick,
}: {
  municipalities: Municipality[];
  municipalityEntities: RankedListItem[];
  mapData: ReturnType<typeof toMunicipalityMapDataItem>[];
  selectedKPI: KPIValue<Municipality>;
  viewMode: OverviewViewMode;
  onKPIChange: (kpi: KPIValue<Municipality>) => void;
  onViewModeChange: (mode: OverviewViewMode) => void;
  onMunicipalityClick: (item: Municipality | string) => void;
  onMunicipalityAreaClick: (name: string) => void;
}) {
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();
  const municipalityKPIs = useMunicipalityKPIDefinitions();
  const [geoData] = useState(municipalityGeoJson);

  const viewToggle = (
    <ViewModeToggle
      viewMode={viewMode}
      modes={["map", "list"]}
      onChange={onViewModeChange}
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

  return (
    <>
      <PageHeader
        variant="title-only"
        title={t("municipalitiesOverviewPage.title")}
      />

      <KPIChipSelector<Municipality>
        selectedKPI={selectedKPI}
        kpis={municipalityKPIs}
        onKPIChange={onKPIChange}
        iconMap={MUNICIPALITY_KPI_ICONS}
        translationPrefix="municipalities.list"
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 items-stretch">
          <OverviewSplitLayout
            viewMode={viewMode}
            visualizationMode="map"
            visualization={
              <TerritoryMap
                entityType="municipalities"
                geoData={geoData as FeatureCollection}
                data={mapData}
                selectedKPI={selectedKPI}
                onAreaClick={onMunicipalityAreaClick}
                defaultZoom={isMobile ? 4 : undefined}
                className="max-w-none"
              />
            }
            list={
              <MunicipalityRankedList
                municipalityEntities={municipalityEntities}
                selectedKPI={selectedKPI}
                onItemClick={onMunicipalityClick}
                headerAction={viewToggle}
              />
            }
            toggle={viewToggle}
          />
          <div
            className={`min-h-0 h-full min-w-0 overflow-visible ${OVERVIEW_PANEL_MD_HEIGHT}`}
          >
            <InsightsPanel
              municipalityData={municipalities}
              selectedKPI={selectedKPI}
              section="stats"
            />
          </div>
        </div>

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

export function MunicipalitiesOverviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  const urlState = useMunicipalityUrlState(municipalityKPIs);
  const [selectedKPI, setSelectedKPI] = useState(urlState.getKPIFromURL());
  const viewMode = urlState.getViewModeFromURL();

  useEffect(() => {
    const kpiFromUrl = urlState.getKPIFromURL();
    if (String(kpiFromUrl.key) !== String(selectedKPI.key)) {
      setSelectedKPI(kpiFromUrl);
    }
  }, [urlState, selectedKPI.key]);

  const handleMunicipalityClick = createEntityClickHandler(
    navigate,
    "municipality",
    viewMode,
  );

  const mapData = useMemo(
    () => municipalitiesData.map(toMunicipalityMapDataItem),
    [municipalitiesData],
  );

  const municipalityEntities: RankedListItem[] = useMemo(
    () =>
      municipalities.map((municipality) => {
        const { sectorEmissions, ...rest } = municipality;
        return {
          ...rest,
          id: municipality.name,
          displayName: municipality.name,
          mapName: municipality.name,
        };
      }),
    [municipalities],
  );

  const handleMunicipalityAreaClick = (name: string) => {
    const municipality = municipalities.find((m) => m.name === name);
    handleMunicipalityClick(municipality ?? name);
  };

  if (municipalitiesLoading) {
    return (
      <OverviewPageSkeleton
        variant="municipalities"
        chipCount={municipalityKPIs.length}
      />
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

  return (
    <MunicipalitiesOverviewContent
      municipalities={municipalities}
      municipalityEntities={municipalityEntities}
      mapData={mapData}
      selectedKPI={selectedKPI}
      viewMode={viewMode}
      onKPIChange={(kpi) => {
        setSelectedKPI(kpi);
        urlState.setKPIInURL(String(kpi.key));
      }}
      onViewModeChange={urlState.setViewModeInURL}
      onMunicipalityClick={handleMunicipalityClick}
      onMunicipalityAreaClick={handleMunicipalityAreaClick}
    />
  );
}
