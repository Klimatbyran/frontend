import { useState } from "react";
import { Map, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FeatureCollection } from "geojson";
import { Text } from "@/components/ui/text";
import { LocalizedLink } from "@/components/LocalizedLink";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { DataGuideItemId } from "@/data-guide/items";
import TerritoryMap from "@/components/maps/TerritoryMap";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import { useRelatedTerritoriesMap } from "@/hooks/territories/useRelatedTerritoriesMap";
import { MapEntityType } from "@/types/rankings";

type ViewMode = "list" | "map";

interface EntityListBoxProps {
  items: string[];
  entityType: MapEntityType;
  helpItems?: DataGuideItemId[];
  translateNamespace?: string;
}

export function EntityListBox({
  items,
  entityType,
  helpItems = [],
  translateNamespace = "detailPage",
}: EntityListBoxProps) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const {
    selectedKPI,
    mapData,
    geoData,
    onAreaClick,
    defaultCenter,
    loading,
  } = useRelatedTerritoriesMap({ items, entityType });

  if (items.length === 0) {
    return null;
  }

  const translationKey = `${translateNamespace}.${entityType}`;
  const basePath = `/${entityType}`;

  const content = (
    <div className="bg-black-2 rounded-level-3 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 md:mb-6">
        <Text variant="h3">{t(translationKey)}</Text>
        <ViewModeToggle
          viewMode={viewMode}
          modes={["list", "map"]}
          onChange={setViewMode}
          icons={{
            map: <Map className="w-4 h-4" />,
            list: <List className="w-4 h-4" />,
          }}
          titles={{
            map: t("viewModeToggle.map"),
            list: t("viewModeToggle.list"),
          }}
        />
      </div>
      {viewMode === "list" ? (
        <div className="flex flex-wrap gap-2 md:gap-4">
          {items.map((item) => (
            <span key={item}>
              <LocalizedLink
                to={`${basePath}/${item}`}
                className="text-orange-2 hover:text-orange-1 underline text-sm md:text-base"
              >
                {item}
              </LocalizedLink>
            </span>
          ))}
        </div>
      ) : selectedKPI ? (
        <div className="relative h-[50vh] min-h-[280px]">
          {loading ? (
            <div className="h-full w-full animate-pulse bg-black-1 rounded-level-2" />
          ) : (
            <TerritoryMap
              entityType={entityType}
              geoData={geoData as FeatureCollection}
              data={mapData}
              selectedKPI={selectedKPI}
              onAreaClick={onAreaClick}
              defaultCenter={defaultCenter}
              scrollWheelZoom={false}
            />
          )}
        </div>
      ) : null}
    </div>
  );

  if (helpItems.length > 0) {
    return <SectionWithHelp helpItems={helpItems}>{content}</SectionWithHelp>;
  }

  return content;
}
