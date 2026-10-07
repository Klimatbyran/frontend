import { useMemo } from "react";
import type { FeatureCollection } from "geojson";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTerritoryStoryLens } from "@/hooks/territories/useTerritoryStoryLens";
import type { DataItem, MapEntityType } from "@/types/rankings";
import type { TerritoryKpi } from "@/utils/territoryMapUtils";
import {
  summariseExtremes,
  summarisePace,
  summariseParis,
  type PlanContrast,
  type TerritoryStoryRow,
} from "@/utils/territories/territoryOverviewStory";
import { TerritoryExplainer } from "./TerritoryExplainer";
import { TerritoryLensToggle } from "./TerritoryLensToggle";
import { TerritoryMapAnswer } from "./TerritoryMapAnswer";
import { TerritoryPaceStory } from "./TerritoryPaceStory";
import { TerritoryPlanContrast } from "./TerritoryPlanContrast";
import { TerritoryOverviewTable } from "./TerritoryOverviewTable";

export function TerritoryOverview({
  storyKey,
  title,
  description,
  listEntityType,
  mapEntityType,
  geoData,
  mapData,
  parisKpi,
  paceKpi,
  rows,
  plans,
  onAreaClick,
}: {
  storyKey: "municipalitiesOverviewPage.story" | "regionalOverviewPage.story";
  title: string;
  description: string;
  listEntityType: "municipalities" | "regions";
  mapEntityType: MapEntityType;
  geoData: FeatureCollection;
  mapData: DataItem[];
  parisKpi: TerritoryKpi;
  paceKpi: TerritoryKpi;
  rows: TerritoryStoryRow[];
  plans: PlanContrast | null;
  onAreaClick: (name: string) => void;
}) {
  const { lens, setLens } = useTerritoryStoryLens();
  const paris = useMemo(() => summariseParis(rows), [rows]);
  const pace = useMemo(() => summarisePace(rows), [rows]);
  const extremes = useMemo(() => summariseExtremes(rows, lens), [rows, lens]);

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="space-y-5 md:space-y-7">
        <div className="space-y-5">
          <PageHeader
            className="mx-0 mb-0 max-w-none p-0 md:mb-0"
            title={title}
            description={description}
          />
          <TerritoryExplainer storyKey={storyKey} />
        </div>

        <TerritoryLensToggle
          storyKey={storyKey}
          lens={lens}
          onChange={setLens}
        />

        <TerritoryMapAnswer
          storyKey={storyKey}
          lens={lens}
          entityType={mapEntityType}
          geoData={geoData}
          mapData={mapData}
          parisKpi={parisKpi}
          paceKpi={paceKpi}
          paris={paris}
          pace={pace}
          onAreaClick={onAreaClick}
        />
      </div>

      <TerritoryPaceStory
        storyKey={storyKey}
        entityType={listEntityType}
        lens={lens}
        pace={pace}
        extremes={extremes}
      />

      {plans && <TerritoryPlanContrast storyKey={storyKey} plans={plans} />}

      <TerritoryOverviewTable
        storyKey={storyKey}
        entityType={listEntityType === "regions" ? "region" : "municipality"}
        rows={rows}
        showClimatePlan={plans != null}
      />
    </div>
  );
}
