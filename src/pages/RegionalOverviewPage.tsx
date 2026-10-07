import { useState, useMemo } from "react";
import { ArrowDownCircle, Leaf } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { FeatureCollection } from "geojson";
import { useNavigate } from "react-router-dom";
import TerritoryMap, { DataItem } from "@/components/maps/TerritoryMap";
import { OVERVIEW_MAP_DEFAULT_CENTER } from "@/components/maps/mapConstants";
import regionGeoJson from "@/data/regionGeo.json";
import { useRankedRegionsURLParams } from "@/hooks/regions/useRankedRegionsURLParams";
import {
  useRegionsKPIs,
  RegionKPIData,
  useRegionalKPIs,
} from "@/hooks/regions/useRegionKPIs";
import RegionalInsightsPanel from "@/components/regions/RegionalInsightsPanel";
import { Region } from "@/types/region";
import { resolveRegionFromMapName, toMapRegionName } from "@/utils/regionUtils";
import { toRegionMapDataItem } from "@/utils/territoryMapData";
import { RegionalRankedList } from "@/components/regions/RegionalRankedList";
import { DataChipSelector } from "@/components/ranked/DataChipSelector";
import { OverviewPageSkeleton } from "@/components/ranked/OverviewPageSkeleton";
import { TerritoryOverviewLayout } from "@/components/ranked/TerritoryOverviewLayout";
import { LocalizedLink } from "@/components/LocalizedLink";
import { createEntityClickHandler } from "@/utils/routing";
import { RankedListItem } from "@/types/rankings";
import { useScreenSize } from "@/hooks/useScreenSize";

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

  const { selectedKPI, setSelectedKPI, setKPIInURL } =
    useRankedRegionsURLParams(regionalKPIs);

  const handleRegionClick = createEntityClickHandler(navigate, "region");

  const handleRegionAreaClick = (name: string) => {
    const region = resolveRegionFromMapName(name, regionsData);
    handleRegionClick(region?.name ?? name);
  };

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
      <OverviewPageSkeleton variant="regions" chipCount={regionalKPIs.length} />
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

  return (
    <TerritoryOverviewLayout
      title={t("regionalOverviewPage.title")}
      lead={t("regionalOverviewPage.lead")}
      explainerTitle={t("regionalOverviewPage.explainerTitle")}
      explainer={
        <>
          <p>{t("regionalOverviewPage.explainerIndicators")}</p>
          <p>
            <Trans
              i18nKey="regionalOverviewPage.explainerColours"
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
        <DataChipSelector<Region>
          className="mb-0"
          selectedKPI={selectedKPI}
          kpis={regionalKPIs}
          onKPIChange={(kpi) => {
            setSelectedKPI(kpi);
            setKPIInURL(String(kpi.key));
          }}
          iconMap={REGION_KPI_ICONS}
          translationPrefix="regions.list"
          label={t("regions.list.dataSelector.label")}
        />
      }
      mapTitle={t("regionalOverviewPage.mapTitle")}
      mapDescription={t("regionalOverviewPage.mapDescription")}
      map={
        <TerritoryMap
          entityType="regions"
          geoData={geoData as FeatureCollection}
          data={mapData}
          selectedKPI={selectedKPI}
          onAreaClick={handleRegionAreaClick}
          defaultCenter={OVERVIEW_MAP_DEFAULT_CENTER}
          defaultZoom={isMobile ? 4 : undefined}
          className="max-w-none"
        />
      }
      stats={
        <RegionalInsightsPanel
          regionsData={regionsAsEntities}
          selectedKPI={selectedKPI}
          section="stats"
        />
      }
      comparisonTitle={t("regionalOverviewPage.comparisonTitle")}
      comparisonDescription={t("regionalOverviewPage.comparisonDescription")}
      comparison={
        selectedKPI.isBoolean ? undefined : (
          <>
            <RegionalInsightsPanel
              regionsData={regionsAsEntities}
              selectedKPI={selectedKPI}
              section="top"
            />
            <RegionalInsightsPanel
              regionsData={regionsAsEntities}
              selectedKPI={selectedKPI}
              section="bottom"
            />
          </>
        )
      }
      listTitle={t("regionalOverviewPage.listTitle")}
      listDescription={t("regionalOverviewPage.listDescription")}
      list={
        <RegionalRankedList
          regionEntities={regionEntities}
          selectedKPI={selectedKPI}
          onItemClick={handleRegionClick}
        />
      }
    />
  );
}
