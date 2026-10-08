import { useState, useMemo } from "react";
import { ArrowDownCircle, Leaf } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FeatureCollection } from "geojson";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import TerritoryMap from "@/components/maps/TerritoryMap";
import { OVERVIEW_MAP_DEFAULT_CENTER } from "@/components/maps/mapConstants";
import regionGeoJson from "@/data/regionGeo.json";
import { useRankedRegionsURLParams } from "@/hooks/regions/useRankedRegionsURLParams";
import { useRegionsKPIs, useRegionalKPIs } from "@/hooks/regions/useRegionKPIs";
import RegionalInsightsPanel from "@/components/regions/RegionalInsightsPanel";
import { Region } from "@/types/region";
import { resolveRegionFromMapName } from "@/utils/regionUtils";
import { toRegionMapDataItem } from "@/utils/territoryMapData";
import { DataChipSelector } from "@/components/ranked/DataChipSelector";
import { OverviewPageSkeleton } from "@/components/ranked/OverviewPageSkeleton";
import { TerritoryAnswerCard } from "@/components/ranked/TerritoryAnswerCard";
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

  const { selectedKPI, setSelectedKPI, setKPIInURL } =
    useRankedRegionsURLParams(regionalKPIs);

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
        const raw = region[selectedKPI.key];
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
    [regionsAsEntities, selectedKPI.key],
  );

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
    <div className="space-y-8">
      <div className="space-y-4">
        <PageHeader
          className="mx-0 mb-0 max-w-none p-0 md:mb-0"
          title={t("regionalOverviewPage.title")}
          description={t("regionalOverviewPage.lead")}
        />
        <DataChipSelector<Region>
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
        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_22.5rem]">
          <div className="relative h-[28rem] lg:h-full lg:min-h-[40rem]">
            <div className="absolute inset-0">
              <TerritoryMap
                entityType="regions"
                geoData={geoData as FeatureCollection}
                data={mapData}
                selectedKPI={selectedKPI}
                onAreaClick={handleRegionAreaClick}
                defaultCenter={OVERVIEW_MAP_DEFAULT_CENTER}
                defaultZoom={isMobile ? 4 : undefined}
                className="h-full max-w-none"
              />
            </div>
          </div>
          <TerritoryAnswerCard
            entities={regionsAsEntities}
            selectedKPI={selectedKPI}
            entityType="regions"
            translationPrefix="regions.list"
          />
        </div>
      </div>

      {!selectedKPI.isBoolean && (
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          <RegionalInsightsPanel
            regionsData={regionsAsEntities}
            selectedKPI={selectedKPI}
            section="top"
            listDescription={t("territoryOverview.bestList")}
          />
          <RegionalInsightsPanel
            regionsData={regionsAsEntities}
            selectedKPI={selectedKPI}
            section="bottom"
            listDescription={t("territoryOverview.worstList")}
          />
        </div>
      )}

      <TerritoryOverviewTable
        key={String(selectedKPI.key)}
        rows={tableRows}
        entityType="regions"
        kpiLabel={t(`regions.list.kpis.${String(selectedKPI.key)}.label`)}
        unit={selectedKPI.unit}
        isBoolean={selectedKPI.isBoolean}
        higherIsBetter={selectedKPI.higherIsBetter}
        booleanLabels={selectedKPI.booleanLabels}
        showParis={!isMeetsParisKpiKey(selectedKPI.key)}
      />
    </div>
  );
}
