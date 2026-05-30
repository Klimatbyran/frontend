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
import { useScreenSize } from "@/hooks/useScreenSize";
import { MapEntityType } from "@/types/rankings";
import { cn } from "@/lib/utils";

const MAP_PANEL_CLASS = "h-[min(32rem,55vh)] min-h-[20rem]";
const LIST_PANEL_CLASS = "h-[min(32rem,55vh)] min-h-[20rem]";
const SIDE_BY_SIDE_MIN_WIDTH = 768;
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

function useTerritoryListPagination(itemCount: number, enabled: boolean) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [itemsPerPage, setItemsPerPage] = useState(itemCount);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemCount, enabled]);

  useEffect(() => {
    if (!enabled) {
      setItemsPerPage(itemCount);
      return;
    }

    const panel = panelRef.current;
    if (!panel) return;

    const updateItemsPerPage = () => {
      setItemsPerPage(calculateItemsPerPage(itemCount, panel.clientHeight));
    };

    updateItemsPerPage();

    const observer = new ResizeObserver(updateItemsPerPage);
    observer.observe(panel);

    return () => observer.disconnect();
  }, [itemCount, enabled]);

  const totalPages = Math.max(1, Math.ceil(itemCount / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [currentPage, safeCurrentPage]);

  const paginatedItems = useMemo(() => {
    if (!enabled || itemsPerPage <= 0) {
      return { startIndex: 0, endIndex: itemCount };
    }

    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return {
      startIndex,
      endIndex: startIndex + itemsPerPage,
    };
  }, [enabled, safeCurrentPage, itemsPerPage, itemCount]);

  return {
    panelRef,
    itemsPerPage,
    currentPage: safeCurrentPage,
    setCurrentPage,
    totalPages,
    paginatedItems,
  };
}

function useSideBySideLayout(enabled: boolean) {
  const layoutRef = useRef<HTMLDivElement>(null);
  const [isSideBySide, setIsSideBySide] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsSideBySide(false);
      return;
    }

    const node = layoutRef.current;
    if (!node) return;

    const updateLayout = () => {
      setIsSideBySide(node.clientWidth >= SIDE_BY_SIDE_MIN_WIDTH);
    };

    updateLayout();

    const observer = new ResizeObserver(updateLayout);
    observer.observe(node);

    return () => observer.disconnect();
  }, [enabled]);

  return { layoutRef, isSideBySide };
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
  const { isMobile, isTablet } = useScreenSize();
  const { layoutRef, isSideBySide } = useSideBySideLayout(items.length > 0);
  const shouldPaginateList = isSideBySide && !isMobile && !isTablet;
  const {
    panelRef,
    itemsPerPage,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems,
  } = useTerritoryListPagination(territories.length, shouldPaginateList);
  const [hoveredMapArea, setHoveredMapArea] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldPaginateList || !hoveredMapArea || itemsPerPage <= 0) {
      return;
    }

    const index = territories.findIndex(
      (territory) =>
        territory.mapName.toLowerCase() === hoveredMapArea.toLowerCase(),
    );
    if (index === -1) {
      return;
    }

    const targetPage = Math.floor(index / itemsPerPage) + 1;
    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
    }
  }, [
    hoveredMapArea,
    shouldPaginateList,
    territories,
    itemsPerPage,
    currentPage,
    setCurrentPage,
  ]);

  if (items.length === 0) {
    return null;
  }

  const translationKey = `${translateNamespace}.${entityType}`;
  const basePath = `/${entityType}`;
  const visibleTerritories = shouldPaginateList
    ? territories.slice(paginatedItems.startIndex, paginatedItems.endIndex)
    : territories;
  const showPagination = shouldPaginateList && totalPages > 1;

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
          <div className={cn("relative", MAP_PANEL_CLASS)}>
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
                fitBoundsOnMount
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
          ref={shouldPaginateList ? panelRef : undefined}
          className={cn(
            "flex flex-col",
            shouldPaginateList && cn("min-h-0", LIST_PANEL_CLASS),
          )}
        >
          <div
            className={cn(
              "grid grid-cols-2 gap-x-3 gap-y-2 content-start",
              shouldPaginateList && "flex-1 min-h-0",
            )}
          >
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
                  <span
                    className={cn(
                      "shrink-0 text-xs tabular-nums text-grey",
                      isHovered && "text-white",
                    )}
                  >
                    {territory.formattedValue}
                  </span>
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
