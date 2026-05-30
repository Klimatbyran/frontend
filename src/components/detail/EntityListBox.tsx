import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FeatureCollection } from "geojson";
import { Text } from "@/components/ui/text";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { DataGuideItemId } from "@/data-guide/items";
import TerritoryMap from "@/components/maps/TerritoryMap";
import MultiPagePagination from "@/components/ui/multi-page-pagination";
import { TerritoryListRow } from "@/components/detail/TerritoryListRow";
import { useRelatedTerritoriesMap } from "@/hooks/territories/useRelatedTerritoriesMap";
import {
  TERRITORY_PANEL_CLASS,
  useTerritoryListLayout,
} from "@/hooks/territories/useTerritoryListLayout";
import { useScreenSize } from "@/hooks/useScreenSize";
import { MapEntityType } from "@/types/rankings";
import { cn } from "@/lib/utils";

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
  const {
    selectedKPI,
    mapData,
    territories,
    geoData,
    onAreaClick,
    defaultCenter,
    loading,
  } = useRelatedTerritoriesMap({ items, entityType });
  const { isMobile, isTablet } = useScreenSize();
  const [hoveredMapArea, setHoveredMapArea] = useState<string | null>(null);

  const {
    layoutRef,
    panelRef,
    currentPage,
    setCurrentPage,
    totalPages,
    visibleRange,
    showPagination,
  } = useTerritoryListLayout(
    territories,
    !isMobile && !isTablet,
    hoveredMapArea,
  );

  if (items.length === 0) {
    return null;
  }

  const translationKey = `${translateNamespace}.${entityType}`;
  const basePath = `/${entityType}`;
  const visibleTerritories = showPagination
    ? territories.slice(visibleRange.startIndex, visibleRange.endIndex)
    : territories;

  const content = (
    <div className="bg-black-2 rounded-level-3 p-4 md:p-8">
      <Text variant="h3" className="mb-4 md:mb-6">
        {t(translationKey)}
      </Text>
      {selectedKPI?.detailedDescription && (
        <div className="mb-4 md:mb-6">
          <p className="text-sm font-medium text-white">{selectedKPI.label}</p>
          <p className="mt-1 text-sm leading-relaxed text-grey">
            {selectedKPI.detailedDescription}
          </p>
        </div>
      )}
      <div
        ref={layoutRef}
        className="@container grid grid-cols-1 @md:grid-cols-2 gap-4 @md:gap-6"
      >
        {selectedKPI && (
          <div className={cn("relative", TERRITORY_PANEL_CLASS)}>
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
                fitBounds
                showTooltip={false}
                legendPosition="bottom-left"
                hoveredArea={hoveredMapArea}
                onHoveredAreaChange={setHoveredMapArea}
                className="max-w-none"
              />
            )}
          </div>
        )}
        <div
          ref={showPagination ? panelRef : undefined}
          className={cn(
            "flex flex-col",
            showPagination && cn("min-h-0", TERRITORY_PANEL_CLASS),
          )}
        >
          <div
            className={cn(
              "grid grid-cols-2 gap-x-3 gap-y-2 content-start",
              showPagination && "flex-1 min-h-0",
            )}
          >
            {visibleTerritories.map((territory) => (
              <TerritoryListRow
                key={territory.displayName}
                territory={territory}
                basePath={basePath}
                isHovered={
                  hoveredMapArea?.toLowerCase() ===
                  territory.mapName.toLowerCase()
                }
                onHover={setHoveredMapArea}
              />
            ))}
          </div>
          {showPagination && (
            <MultiPagePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );

  if (helpItems.length > 0) {
    return <SectionWithHelp helpItems={helpItems}>{content}</SectionWithHelp>;
  }

  return content;
}
