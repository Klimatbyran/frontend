import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Leaf,
  ArrowDownCircle,
  ShoppingCart,
  FileCheck,
  Zap,
  ArrowUpCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { FeatureCollection } from "geojson";
import InsightsPanel from "@/components/municipalities/rankedList/MunicipalityInsightsPanel";
import TerritoryMap from "@/components/maps/TerritoryMap";
import { OVERVIEW_MAP_DEFAULT_CENTER } from "@/components/maps/mapConstants";
import municipalityGeoJson from "@/data/municipalityGeo.json";
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
import { useScreenSize } from "@/hooks/useScreenSize";
import { DataChipSelector } from "@/components/ranked/DataChipSelector";
import { OverviewPageSkeleton } from "@/components/ranked/OverviewPageSkeleton";
import { TerritoryOverviewLayout } from "@/components/ranked/TerritoryOverviewLayout";
import { LocalizedLink } from "@/components/LocalizedLink";
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

  return { getKPIFromURL, setKPIInURL };
}

function MunicipalitiesOverviewContent({
  municipalities,
  municipalityEntities,
  mapData,
  selectedKPI,
  onKPIChange,
  onMunicipalityClick,
  onMunicipalityAreaClick,
}: {
  municipalities: Municipality[];
  municipalityEntities: RankedListItem[];
  mapData: ReturnType<typeof toMunicipalityMapDataItem>[];
  selectedKPI: KPIValue<Municipality>;
  onKPIChange: (kpi: KPIValue<Municipality>) => void;
  onMunicipalityClick: (item: Municipality | string) => void;
  onMunicipalityAreaClick: (name: string) => void;
}) {
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();
  const municipalityKPIs = useMunicipalityKPIDefinitions();
  const [geoData] = useState(municipalityGeoJson);

  return (
    <TerritoryOverviewLayout
      title={t("municipalitiesOverviewPage.title")}
      lead={t("municipalitiesOverviewPage.lead")}
      explainerTitle={t("municipalitiesOverviewPage.explainerTitle")}
      explainer={
        <>
          <p>{t("municipalitiesOverviewPage.explainerIndicators")}</p>
          <p>
            <Trans
              i18nKey="municipalitiesOverviewPage.explainerColours"
              components={[
                <LocalizedLink
                  to="/methodology?view=carbonLaw"
                  className="underline transition-colors hover:text-white"
                />,
              ]}
            />
          </p>
        </>
      }
      selector={
        <DataChipSelector<Municipality>
          className="mb-0"
          selectedKPI={selectedKPI}
          kpis={municipalityKPIs}
          onKPIChange={onKPIChange}
          iconMap={MUNICIPALITY_KPI_ICONS}
          translationPrefix="municipalities.list"
        />
      }
      mapTitle={t("municipalitiesOverviewPage.mapTitle")}
      mapDescription={t("municipalitiesOverviewPage.mapDescription")}
      map={
        <TerritoryMap
          entityType="municipalities"
          geoData={geoData as FeatureCollection}
          data={mapData}
          selectedKPI={selectedKPI}
          onAreaClick={onMunicipalityAreaClick}
          defaultCenter={OVERVIEW_MAP_DEFAULT_CENTER}
          defaultZoom={isMobile ? 4 : undefined}
          className="max-w-none"
        />
      }
      stats={
        <InsightsPanel
          municipalityData={municipalities}
          selectedKPI={selectedKPI}
          section="stats"
        />
      }
      comparisonTitle={t("municipalitiesOverviewPage.comparisonTitle")}
      comparisonDescription={t(
        "municipalitiesOverviewPage.comparisonDescription",
      )}
      comparison={
        selectedKPI.isBoolean ? undefined : (
          <>
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
          </>
        )
      }
      listTitle={t("municipalitiesOverviewPage.listTitle")}
      listDescription={t("municipalitiesOverviewPage.listDescription")}
      list={
        <MunicipalityRankedList
          municipalityEntities={municipalityEntities}
          selectedKPI={selectedKPI}
          onItemClick={onMunicipalityClick}
        />
      }
    />
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

  useEffect(() => {
    const kpiFromUrl = urlState.getKPIFromURL();
    if (String(kpiFromUrl.key) !== String(selectedKPI.key)) {
      setSelectedKPI(kpiFromUrl);
    }
  }, [urlState, selectedKPI.key]);

  const handleMunicipalityClick = createEntityClickHandler(
    navigate,
    "municipality",
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
      onKPIChange={(kpi) => {
        setSelectedKPI(kpi);
        urlState.setKPIInURL(String(kpi.key));
      }}
      onMunicipalityClick={handleMunicipalityClick}
      onMunicipalityAreaClick={handleMunicipalityAreaClick}
    />
  );
}
