import { useMemo } from "react";
import type { FeatureCollection } from "geojson";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import regionGeoJson from "@/data/regionGeo.json";
import { TerritoryOverview } from "@/components/territories/overview/TerritoryOverview";
import { TerritoryOverviewSkeleton } from "@/components/territories/overview/TerritoryOverviewSkeleton";
import { useRegionalKPIs, useRegionsKPIs } from "@/hooks/regions/useRegionKPIs";
import { toRegionMapDataItem } from "@/utils/territoryMapData";
import { resolveRegionFromMapName } from "@/utils/regionUtils";
import { createEntityClickHandler } from "@/utils/routing";
import type { TerritoryStoryRow } from "@/utils/territories/territoryOverviewStory";
import type { TerritoryKpi } from "@/utils/territoryMapUtils";

const STORY_KEY = "regionalOverviewPage.story";

export function RegionalOverviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { regionsData, loading, error } = useRegionsKPIs();
  const kpis = useRegionalKPIs();

  const rows = useMemo<TerritoryStoryRow[]>(
    () =>
      regionsData.map((region) => ({
        name: region.name,
        meetsParis: region.meetsParis,
        historicalEmissionChangePercent: region.historicalEmissionChangePercent,
      })),
    [regionsData],
  );

  const mapData = useMemo(
    () => regionsData.map(toRegionMapDataItem),
    [regionsData],
  );

  const parisKpi = kpis.find((kpi) => kpi.key === "meetsParis");
  const paceKpi = kpis.find(
    (kpi) => kpi.key === "historicalEmissionChangePercent",
  );

  const openRegion = createEntityClickHandler(navigate, "region");

  if (loading) {
    return <TerritoryOverviewSkeleton storyKey={STORY_KEY} />;
  }

  if (error || !parisKpi || !paceKpi) {
    return (
      <div className="py-24 text-center">
        <h3 className="mb-4 text-xl text-red-500">
          {t("regionalOverviewPage.errorTitle")}
        </h3>
        <p className="text-grey">
          {t("regionalOverviewPage.errorDescription")}
        </p>
      </div>
    );
  }

  return (
    <TerritoryOverview
      storyKey={STORY_KEY}
      title={t("regionalOverviewPage.title")}
      description={t("regionalOverviewPage.description")}
      listEntityType="regions"
      mapEntityType="regions"
      geoData={regionGeoJson as FeatureCollection}
      mapData={mapData}
      parisKpi={parisKpi as TerritoryKpi}
      paceKpi={paceKpi as TerritoryKpi}
      rows={rows}
      plans={null}
      onAreaClick={(name) => {
        const region = resolveRegionFromMapName(name, regionsData);
        openRegion(region?.name ?? name);
      }}
    />
  );
}
