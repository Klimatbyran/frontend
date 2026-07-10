import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useContainerQuery from "@/hooks/useContainerQuery";
import {
  findTerritoryIndexByMapName,
  getTerritoryListPage,
  TerritoryListEntry,
} from "@/utils/territoryMapUtils";

/** Map panel height; keep md: height on TERRITORY_LIST_PANEL_CLASS in sync. */
export const TERRITORY_PANEL_CLASS =
  "h-[min(40rem,72vh)] min-h-[28rem] md:h-[min(32rem,55vh)] md:min-h-[20rem]";
/** List column uses the same height as the map from the md side-by-side breakpoint. */
export const TERRITORY_LIST_PANEL_CLASS =
  "flex flex-col min-w-0 md:h-[min(32rem,55vh)] md:min-h-[20rem]";
export const SIDE_BY_SIDE_MIN_WIDTH = 768;

const LIST_COLUMNS = 2;
/** Mobile list paginates in pages of this size when item count exceeds the threshold. */
export const MOBILE_TERRITORY_LIST_PAGE_SIZE = 10;
export const MOBILE_TERRITORY_LIST_PAGINATION_THRESHOLD = 10;
/** Matches TerritoryListRow legend-style card row (~52px). */
const LIST_ROW_HEIGHT = 52;
/** Matches gap-y-2 between list rows. */
const LIST_ROW_GAP = 8;
/** Reserved height for MultiPagePagination below the list grid. */
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

export function useTerritoryListLayout(
  territories: TerritoryListEntry[],
  paginationEnabled: boolean,
  hoveredMapArea: string | null,
) {
  const itemCount = territories.length;
  const panelRef = useRef<HTMLDivElement>(null);
  const [itemsPerPage, setItemsPerPage] = useState(itemCount);
  const [currentPage, setCurrentPage] = useState(1);

  const sideBySideQuery = useCallback(
    ({ width }: { width: number }) => width >= SIDE_BY_SIDE_MIN_WIDTH,
    [],
  );
  const [layoutRef, isSideBySide] =
    useContainerQuery<HTMLDivElement>(sideBySideQuery);
  const shouldPaginateDesktop = isSideBySide && paginationEnabled;
  const shouldPaginateMobile =
    !isSideBySide && itemCount > MOBILE_TERRITORY_LIST_PAGINATION_THRESHOLD;
  const shouldPaginateList = shouldPaginateDesktop || shouldPaginateMobile;

  useEffect(() => {
    setCurrentPage(1);
  }, [itemCount, shouldPaginateList]);

  useEffect(() => {
    if (!shouldPaginateList) {
      setItemsPerPage(itemCount);
      return;
    }

    if (shouldPaginateMobile) {
      setItemsPerPage(MOBILE_TERRITORY_LIST_PAGE_SIZE);
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
  }, [itemCount, shouldPaginateList, shouldPaginateMobile]);

  const totalPages = Math.max(1, Math.ceil(itemCount / itemsPerPage));
  const currentPageSafe = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage !== currentPageSafe) {
      setCurrentPage(currentPageSafe);
    }
  }, [currentPage, currentPageSafe]);

  useEffect(() => {
    if (!shouldPaginateDesktop || !hoveredMapArea || itemsPerPage <= 0) {
      return;
    }

    const index = findTerritoryIndexByMapName(territories, hoveredMapArea);
    if (index === -1) {
      return;
    }

    const targetPage = getTerritoryListPage(index, itemsPerPage);
    setCurrentPage(targetPage);
  }, [hoveredMapArea, shouldPaginateDesktop, territories, itemsPerPage]);

  const visibleTerritories = useMemo(() => {
    if (!shouldPaginateList || itemsPerPage <= 0) {
      return territories;
    }

    const startIndex = (currentPageSafe - 1) * itemsPerPage;
    return territories.slice(startIndex, startIndex + itemsPerPage);
  }, [shouldPaginateList, currentPageSafe, itemsPerPage, territories]);

  return {
    layoutRef,
    panelRef,
    currentPage: currentPageSafe,
    setCurrentPage,
    totalPages,
    visibleTerritories,
    showPagination: shouldPaginateList && totalPages > 1,
  };
}
