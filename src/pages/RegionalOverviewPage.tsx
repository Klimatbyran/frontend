import { useState, useMemo } from "react";
import { ArrowDownCircle, Leaf } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FeatureCollection } from "geojson";
import { useNavigate } from "react-router-dom";
import TerritoryMap from "@/components/maps/TerritoryMap";
import {
  OVERVIEW_MAP_DEFAULT_CENTER,
  OVERVIEW_MAP_FIT_BOUNDS_PADDING,
} from "@/components/maps/mapConstants";
import regionGeoJson from "@/data/regionGeo.json";
import { useTerritoryKpiSelection } from "@/hooks/ranked/useTerritoryKpiSelection";
import { OverviewPageError } from "@/components/pageStates/Error";
import { useRegionsKPIs, useRegionalKPIs } from "@/hooks/regions/useRegionKPIs";
import { TerritoryInsightsPanel } from "@/components/ranked/TerritoryInsightsPanel";
import { Region } from "@/types/region";
import { resolveRegionFromMapName } from "@/utils/regionUtils";
import { toRegionMapDataItem } from "@/utils/territoryMapData";
import { DataChipSelector } from "@/components/ranked/DataChipSelector";
import { OverviewPageSkeleton } from "@/components/ranked/OverviewPageSkeleton";
import { TerritoryAnswerCard } from "@/components/ranked/TerritoryAnswerCard";
import { TerritoryOverviewLayout } from "@/components/ranked/TerritoryOverviewLayout";
import { TerritoryOverviewTable } from "@/components/ranked/TerritoryOverviewTable";
import type { TerritoryTableRow } from "@/components/ranked/TerritoryOverviewTable";
import { createEntityClickHandler, getEntityDetailPath } from "@/utils/routing";
import { useScreenSize } from "@/hooks/useScreenSize";
import { isMeetsParisKpiKey } from "@/utils/ui/colors";

const REGION_KPI_ICONS: Record<string, React.ReactNode> = {
  historicalEmissionChangePercent: <ArrowDownCircle className="w-4 h-4" />,
  meetsParis: <Leaf className="w-4 h-4" />,
};

export function RegionalOverviewPage() {
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();
  const regionalKPIs = useRegionalKPIs();
  const [geoData] = useState(regionGeoJson);
  const {
    regionsData,
    loading: regionsLoading,
    error: regionsError,
  } = useRegionsKPIs();

  const navigate = useNavigate();

  const { selectedKPI, displayKPI, setSelectedKPI, setKPIInURL } =
    useTerritoryKpiSelection(regionalKPIs);

  const handleRegionClick = createEntityClickHandler(navigate, "region");

  const handleRegionAreaClick = (name: string) => {
    const region = resolveRegionFromMapName(name, regionsData);
    handleRegionClick(region?.name ?? name);
  };

  const regionsAsEntities: Region[] = useMemo(
    () =>
      regionsData.map((region) => ({
        id: region.name,
        name: region.name,
        emissions: null,
        historicalEmissionChangePercent: region.historicalEmissionChangePercent,
        meetsParis: region.meetsParis,
      })),
    [regionsData],
  );

  const mapData = useMemo(
    () => regionsData.map(toRegionMapDataItem),
    [regionsData],
  );

  const tableRows = useMemo<TerritoryTableRow[]>(
    () =>
      regionsAsEntities.map((region) => {
        const raw = region[displayKPI.key];
        const kpiValue =
          typeof raw === "number" || typeof raw === "boolean" ? raw : null;
        return {
          id: region.name,
          name: region.name,
          href: getEntityDetailPath("region", region),
          kpiValue,
          paris:
            typeof region.meetsParis === "boolean" ? region.meetsParis : null,
        };
      }),
    [regionsAsEntities, displayKPI.key],
  );

  if (regionsLoading) {
    return <OverviewPageSkeleton chipCount={regionalKPIs.length} />;
  }

  if (regionsError) {
    return (
      <OverviewPageError
        titleKey="regionalOverviewPage.errorTitle"
        descriptionKey="regionalOverviewPage.errorDescription"
      />
    );
  }

  return (
    <TerritoryOverviewLayout
      title={t("regionalOverviewPage.title")}
      description={t("regionalOverviewPage.lead")}
      selector={
        <DataChipSelector<Region>
          selectedKPI={selectedKPI}
          kpis={regionalKPIs}
          onKPIChange={(kpi) => {
            setSelectedKPI(kpi);
            setKPIInURL(String(kpi.key));
          }}
          iconMap={REGION_KPI_ICONS}
          translationPrefix="regions.list"
          label=""
        />
      }
      map={
        <TerritoryMap
          entityType="regions"
          geoData={geoData as FeatureCollection}
          data={mapData}
          selectedKPI={displayKPI}
          onAreaClick={handleRegionAreaClick}
          defaultCenter={OVERVIEW_MAP_DEFAULT_CENTER}
          defaultZoom={isMobile ? 4 : undefined}
          fitBounds
          fitBoundsPadding={OVERVIEW_MAP_FIT_BOUNDS_PADDING}
          zoomSnap={0}
          className="h-full max-w-none"
        />
      }
      answer={
        <TerritoryAnswerCard
          entities={regionsAsEntities}
          selectedKPI={displayKPI}
          entityType="regions"
          translationPrefix="regions.list"
        />
      }
      bestList={
        !displayKPI.isBoolean && (
          <TerritoryInsightsPanel
            entities={regionsAsEntities}
            selectedKPI={displayKPI}
            entityType="regions"
            translationPrefix="regions.list"
            section="top"
            listDescription={t("territoryOverview.bestList")}
          />
        )
      }
      worstList={
        !displayKPI.isBoolean && (
          <TerritoryInsightsPanel
            entities={regionsAsEntities}
            selectedKPI={displayKPI}
            entityType="regions"
            translationPrefix="regions.list"
            section="bottom"
            listDescription={t("territoryOverview.worstList")}
          />
        )
      }
      table={
        <TerritoryOverviewTable
          key={String(displayKPI.key)}
          rows={tableRows}
          entityType="regions"
          kpiLabel={t(`regions.list.kpis.${String(displayKPI.key)}.label`)}
          unit={displayKPI.unit}
          isBoolean={displayKPI.isBoolean}
          higherIsBetter={displayKPI.higherIsBetter}
          booleanLabels={displayKPI.booleanLabels}
          nullLabel={displayKPI.nullValues}
          showParis={!isMeetsParisKpiKey(displayKPI.key)}
        />
      }
    />
  );
}
