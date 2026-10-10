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
import { useTranslation } from "react-i18next";
import { FeatureCollection } from "geojson";
import { PageHeader } from "@/components/layout/PageHeader";
import InsightsPanel from "@/components/municipalities/rankedList/MunicipalityInsightsPanel";
import TerritoryMap from "@/components/maps/TerritoryMap";
import {
  OVERVIEW_MAP_DEFAULT_CENTER,
  OVERVIEW_MAP_FIT_BOUNDS_PADDING,
} from "@/components/maps/mapConstants";
import municipalityGeoJson from "@/data/municipalityGeo.json";
import {
  useMunicipalityKPIs,
  useMunicipalityKPIDefinitions,
} from "@/hooks/municipalities/useMunicipalityKPIs";
import { type KPIValue } from "@/types/rankings";
import { createEntityClickHandler, getEntityDetailPath } from "@/utils/routing";
import {
  normalizeMunicipalityKpiApiItem,
  toMunicipalityMapDataItem,
} from "@/utils/territoryMapData";
import { useScreenSize } from "@/hooks/useScreenSize";
import { DataChipSelector } from "@/components/ranked/DataChipSelector";
import { OverviewPageSkeleton } from "@/components/ranked/OverviewPageSkeleton";
import { TerritoryAnswerCard } from "@/components/ranked/TerritoryAnswerCard";
import { TerritoryOverviewTable } from "@/components/ranked/TerritoryOverviewTable";
import type { TerritoryTableRow } from "@/components/ranked/TerritoryOverviewTable";
import { isMeetsParisKpiKey } from "@/utils/ui/colors";
import { getRegionForMunicipality } from "@/lib/constants/regions";
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

export function MunicipalitiesOverviewPage() {
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();
  const navigate = useNavigate();
  const {
    municipalitiesData,
    loading: municipalitiesLoading,
    error: municipalitiesError,
  } = useMunicipalityKPIs();
  const municipalityKPIs = useMunicipalityKPIDefinitions();
  const [geoData] = useState(municipalityGeoJson);

  const municipalities: Municipality[] = useMemo(
    () =>
      municipalitiesData.map((municipality) =>
        normalizeMunicipalityKpiApiItem(municipality),
      ) as Municipality[],
    [municipalitiesData],
  );

  const { getKPIFromURL, setKPIInURL } =
    useMunicipalityUrlState(municipalityKPIs);
  const [selectedKPI, setSelectedKPI] = useState(getKPIFromURL);

  useEffect(() => {
    const kpiFromUrl = getKPIFromURL();
    setSelectedKPI((current) =>
      String(kpiFromUrl.key) === String(current.key) ? current : kpiFromUrl,
    );
  }, [getKPIFromURL]);

  const handleMunicipalityClick = createEntityClickHandler(
    navigate,
    "municipality",
  );

  const mapData = useMemo(
    () => municipalitiesData.map(toMunicipalityMapDataItem),
    [municipalitiesData],
  );

  const tableRows = useMemo<TerritoryTableRow[]>(
    () =>
      municipalities.map((municipality) => {
        const raw = municipality[selectedKPI.key];
        const kpiValue =
          typeof raw === "number" || typeof raw === "boolean" ? raw : null;
        return {
          id: municipality.name,
          name: municipality.name,
          href: getEntityDetailPath("municipality", municipality),
          county: getRegionForMunicipality(municipality.name) ?? null,
          kpiValue,
          paris:
            typeof municipality.meetsParisGoal === "boolean"
              ? municipality.meetsParisGoal
              : null,
        };
      }),
    [municipalities, selectedKPI.key],
  );

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
    <div className="space-y-8 lg:-mt-8">
      <div className="space-y-2">
        <PageHeader
          className="mx-0 mb-0 max-w-none p-0 md:mb-0"
          title={t("municipalitiesOverviewPage.title")}
          description={t("municipalitiesOverviewPage.lead")}
        />
        <DataChipSelector<Municipality>
          selectedKPI={selectedKPI}
          kpis={municipalityKPIs}
          onKPIChange={(kpi) => {
            setSelectedKPI(kpi);
            setKPIInURL(String(kpi.key));
          }}
          iconMap={MUNICIPALITY_KPI_ICONS}
          translationPrefix="municipalities.list"
        />
        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
          <div className="relative h-[28rem] lg:h-[calc(100dvh-13.5rem)]">
            <div className="absolute inset-0">
              <TerritoryMap
                entityType="municipalities"
                geoData={geoData as FeatureCollection}
                data={mapData}
                selectedKPI={selectedKPI}
                onAreaClick={(name) => {
                  const municipality = municipalities.find(
                    (item) => item.name === name,
                  );
                  handleMunicipalityClick(municipality ?? name);
                }}
                defaultCenter={OVERVIEW_MAP_DEFAULT_CENTER}
                defaultZoom={isMobile ? 4 : undefined}
                fitBounds
                fitBoundsPadding={OVERVIEW_MAP_FIT_BOUNDS_PADDING}
                zoomSnap={0}
                className="h-full max-w-none"
              />
            </div>
          </div>
          <TerritoryAnswerCard
            entities={municipalities}
            selectedKPI={selectedKPI}
            entityType="municipalities"
            translationPrefix="municipalities.list"
          />
        </div>
      </div>

      {!selectedKPI.isBoolean && (
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          <InsightsPanel
            municipalityData={municipalities}
            selectedKPI={selectedKPI}
            section="top"
            listDescription={t("territoryOverview.bestList")}
          />
          <InsightsPanel
            municipalityData={municipalities}
            selectedKPI={selectedKPI}
            section="bottom"
            listDescription={t("territoryOverview.worstList")}
          />
        </div>
      )}

      <TerritoryOverviewTable
        key={String(selectedKPI.key)}
        rows={tableRows}
        entityType="municipalities"
        kpiLabel={t(
          `municipalities.list.kpis.${String(selectedKPI.key)}.label`,
        )}
        unit={selectedKPI.unit}
        isBoolean={selectedKPI.isBoolean}
        higherIsBetter={selectedKPI.higherIsBetter}
        booleanLabels={selectedKPI.booleanLabels}
        showParis={!isMeetsParisKpiKey(selectedKPI.key)}
      />
    </div>
  );
}
