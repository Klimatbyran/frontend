import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FeatureCollection } from "geojson";
import { Text } from "@/components/ui/text";
import { LocalizedLink } from "@/components/LocalizedLink";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { DataGuideItemId } from "@/data-guide/items";
import TerritoryMap from "@/components/maps/TerritoryMap";
import MultiPagePagination from "@/components/ui/multi-page-pagination";
import { useRelatedTerritoriesMap } from "@/hooks/territories/useRelatedTerritoriesMap";
import { MapEntityType } from "@/types/rankings";
import { cn } from "@/lib/utils";

const PANEL_CLASS = "h-[min(32rem,55vh)] min-h-[20rem]";
const LIST_COLUMNS = 2;
const LIST_ROW_HEIGHT = 28;
const LIST_ROW_GAP = 8;
const PAGINATION_HEIGHT = 57;

function calculateItemsPerPage(itemCount: number, panelHeight: number): number {
  const rowsWithoutPagination = Math.max(
    1,
    Math.floor((panelHeight + LIST_ROW_GAP) / (LIST_ROW_HEIGHT + LIST_ROW_GAP)),
  );
  const fitWithoutPagination = rowsWithoutPagination * LIST_COLUMNS;

  if (itemCount <= fitWithoutPagination) {
    return fitWithoutPagination;
  }

  const availableHeight = panelHeight - PAGINATION_HEIGHT;
  const rowsWithPagination = Math.max(
    1,
    Math.floor(
      (availableHeight + LIST_ROW_GAP) / (LIST_ROW_HEIGHT + LIST_ROW_GAP),
    ),
  );

  return rowsWithPagination * LIST_COLUMNS;
}

function useTerritoryListPagination(itemCount: number) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemCount]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const updateItemsPerPage = () => {
      setItemsPerPage(calculateItemsPerPage(itemCount, panel.clientHeight));
    };

    updateItemsPerPage();

    const observer = new ResizeObserver(updateItemsPerPage);
    observer.observe(panel);

    return () => observer.disconnect();
  }, [itemCount]);

  const totalPages = Math.max(1, Math.ceil(itemCount / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [currentPage, safeCurrentPage]);

  const paginatedItems = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return {
      startIndex,
      endIndex: startIndex + itemsPerPage,
    };
  }, [safeCurrentPage, itemsPerPage]);

  return {
    panelRef,
    itemsPerPage,
    currentPage: safeCurrentPage,
    setCurrentPage,
    totalPages,
    paginatedItems,
  };
}

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
  const { panelRef, currentPage, setCurrentPage, totalPages, paginatedItems } =
    useTerritoryListPagination(territories.length);
  const [hoveredMapArea, setHoveredMapArea] = useState<string | null>(null);

  if (items.length === 0) {
    return null;
  }

  const translationKey = `${translateNamespace}.${entityType}`;
  const basePath = `/${entityType}`;
  const visibleTerritories = territories.slice(
    paginatedItems.startIndex,
    paginatedItems.endIndex,
  );
  const showPagination = totalPages > 1;

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {selectedKPI && (
          <div className={cn("relative", PANEL_CLASS)}>
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
                fitToBounds
                showTooltip={false}
                hoveredArea={hoveredMapArea}
                onHoveredAreaChange={setHoveredMapArea}
                className="max-w-none"
              />
            )}
          </div>
        )}
        <div
          ref={panelRef}
          className={cn("flex flex-col min-h-0", PANEL_CLASS)}
        >
          <div className="grid flex-1 min-h-0 grid-cols-2 gap-x-3 gap-y-2 content-start">
            {visibleTerritories.map((territory) => {
              const isHovered =
                hoveredMapArea?.toLowerCase() ===
                territory.mapName.toLowerCase();

              return (
                <div
                  key={territory.displayName}
                  className="flex min-w-0 items-center gap-2"
                  onMouseEnter={() => setHoveredMapArea(territory.mapName)}
                  onMouseLeave={() => setHoveredMapArea(null)}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: territory.fillColor }}
                    aria-hidden
                  />
                  <LocalizedLink
                    to={`${basePath}/${territory.displayName}`}
                    className={cn(
                      "min-w-0 flex-1 truncate text-sm leading-5 text-grey hover:text-white md:text-base",
                      isHovered && "text-white",
                    )}
                  >
                    {territory.displayName}
                  </LocalizedLink>
                </div>
              );
            })}
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
