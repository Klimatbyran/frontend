import { useMemo } from "react";
import type { FeatureCollection } from "geojson";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import municipalityGeoJson from "@/data/municipalityGeo.json";
import { TerritoryOverview } from "@/components/territories/overview/TerritoryOverview";
import { TerritoryOverviewSkeleton } from "@/components/territories/overview/TerritoryOverviewSkeleton";
import {
  useMunicipalityKPIDefinitions,
  useMunicipalityKPIs,
} from "@/hooks/municipalities/useMunicipalityKPIs";
import { toMunicipalityMapDataItem } from "@/utils/territoryMapData";
import { createEntityClickHandler } from "@/utils/routing";
import {
  summarisePlans,
  type MunicipalityStoryRow,
} from "@/utils/territories/territoryOverviewStory";
import type { TerritoryKpi } from "@/utils/territoryMapUtils";

const STORY_KEY = "municipalitiesOverviewPage.story";

export function MunicipalitiesOverviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { municipalitiesData, loading, error } = useMunicipalityKPIs();
  const kpis = useMunicipalityKPIDefinitions();

  const rows = useMemo<MunicipalityStoryRow[]>(
    () =>
      municipalitiesData.map((municipality) => ({
        name: municipality.name,
        meetsParis: municipality.meetsParis,
        historicalEmissionChangePercent:
          municipality.historicalEmissionChangePercent,
        climatePlan: municipality.climatePlan,
      })),
    [municipalitiesData],
  );

  const mapData = useMemo(
    () => municipalitiesData.map(toMunicipalityMapDataItem),
    [municipalitiesData],
  );

  const plans = useMemo(() => summarisePlans(rows), [rows]);

  const parisKpi = kpis.find((kpi) => kpi.key === "meetsParisGoal");
  const paceKpi = kpis.find(
    (kpi) => kpi.key === "historicalEmissionChangePercent",
  );

  const openMunicipality = createEntityClickHandler(navigate, "municipality");

  if (loading) {
    return <TerritoryOverviewSkeleton storyKey={STORY_KEY} showPlans />;
  }

  if (error || !parisKpi || !paceKpi) {
    return (
      <div className="py-24 text-center">
        <h3 className="mb-4 text-xl text-red-500">
          {t("municipalitiesOverviewPage.errorTitle")}
        </h3>
        <p className="text-grey">
          {t("municipalitiesOverviewPage.errorDescription")}
        </p>
      </div>
    );
  }

  return (
    <TerritoryOverview
      storyKey={STORY_KEY}
      title={t("municipalitiesOverviewPage.title")}
      description={t("municipalitiesOverviewPage.description")}
      listEntityType="municipalities"
      mapEntityType="municipalities"
      geoData={municipalityGeoJson as FeatureCollection}
      mapData={mapData}
      parisKpi={parisKpi as TerritoryKpi}
      paceKpi={paceKpi as TerritoryKpi}
      rows={rows}
      plans={plans}
      onAreaClick={(name) => {
        const municipality = rows.find((row) => row.name === name);
        openMunicipality(municipality ?? name);
      }}
    />
  );
}
