import { useState, useEffect } from "react";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { t } from "i18next";
import MultiPagePagination from "@/components/ui/multi-page-pagination";
import { DataPoint } from "@/types/rankings";
import {
  createDefaultColorGetter,
  isMissingRankedValue,
} from "@/utils/insights/rankedListUtils";
import { cn } from "@/lib/utils";

export interface RankedListProps<T extends Record<string, unknown>> {
  data: T[];
  selectedDataPoint: DataPoint<T>;
  onItemClick?: (item: T) => void;
  searchKey?: keyof T;
  itemsPerPage?: number;
  renderItem?: (
    item: T,
    index: number,
    startIndex: number,
    originalRank: number,
  ) => React.ReactNode;
  colorItem?: (item: T) => string;
  className?: string;
  searchPlaceholder?: string;
  /** Rendered to the left of the search bar in the header row */
  headerAction?: React.ReactNode;
}

interface SortedRankedDataOptions<T extends Record<string, unknown>> {
  data: T[];
  selectedDataPoint: DataPoint<T>;
  searchKey: keyof T;
  searchTerm: string;
  itemsPerPage: number;
  currentPage: number;
  sortReversed: boolean;
}

function getDefaultSortAscending(higherIsBetter: boolean) {
  return !higherIsBetter;
}

function useSortedRankedData<T extends Record<string, unknown>>({
  data,
  selectedDataPoint,
  searchKey,
  searchTerm,
  itemsPerPage,
  currentPage,
  sortReversed,
}: SortedRankedDataOptions<T>) {
  const sortAscending = sortReversed
    ? !getDefaultSortAscending(selectedDataPoint.higherIsBetter)
    : getDefaultSortAscending(selectedDataPoint.higherIsBetter);

  const withValue = data.filter(
    (item) =>
      !isMissingRankedValue(
        item[selectedDataPoint.key],
        selectedDataPoint.isBoolean,
      ),
  );
  const withoutValue = data.filter((item) =>
    isMissingRankedValue(
      item[selectedDataPoint.key],
      selectedDataPoint.isBoolean,
    ),
  );

  const sortedWithValue = [...withValue].sort((a, b) => {
    const aValue = a[selectedDataPoint.key];
    const bValue = b[selectedDataPoint.key];
    if (
      selectedDataPoint.isBoolean &&
      typeof aValue === "boolean" &&
      typeof bValue === "boolean"
    ) {
      return String(a[searchKey] || "").localeCompare(
        String(b[searchKey] || ""),
      );
    }
    const comparison = (aValue as number) - (bValue as number);
    return sortAscending ? comparison : -comparison;
  });

  const sortedWithoutValue = [...withoutValue].sort((a, b) =>
    String(a[searchKey] || "").localeCompare(String(b[searchKey] || "")),
  );

  const sortedData = [...sortedWithValue, ...sortedWithoutValue];

  const validCount = sortedWithValue.length;
  const originalRankMap = new Map<T, number>();
  sortedData.forEach((item, index) => {
    const rank =
      index < validCount
        ? sortReversed
          ? validCount - index
          : index + 1
        : index + 1;
    originalRankMap.set(item, rank);
  });

  const filteredData = sortedData.filter((item) => {
    const searchValue = item[searchKey];
    return (
      searchValue &&
      typeof searchValue === "string" &&
      searchValue.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return {
    sortedData,
    originalRankMap,
    filteredData,
    totalPages,
    startIndex,
    paginatedData,
    sortAscending,
  };
}

function useRankedItemHelpers<T extends Record<string, unknown>>(
  selectedDataPoint: DataPoint<T>,
  originalRankMap: Map<T, number>,
) {
  const formatValue = (item: T) => {
    const value = item[selectedDataPoint.key];
    if (isMissingRankedValue(value, selectedDataPoint.isBoolean)) {
      return selectedDataPoint.nullValues || t("noData");
    }
    if (selectedDataPoint.formatter) return selectedDataPoint.formatter(value);
    if (typeof value === "boolean") {
      if (selectedDataPoint.booleanLabels) {
        return value
          ? selectedDataPoint.booleanLabels.true
          : selectedDataPoint.booleanLabels.false;
      }
      return value ? t("yes") : t("no");
    }
    if (typeof value === "number") return `${value.toFixed(1)}`;
    return String(value);
  };

  const getOriginalRank = (item: T) => originalRankMap.get(item) || 0;

  const defaultColorItem = createDefaultColorGetter(
    Array.from(originalRankMap.keys()),
    selectedDataPoint.key,
    selectedDataPoint.isBoolean,
    selectedDataPoint.higherIsBetter,
  );

  return { formatValue, getOriginalRank, defaultColorItem };
}

export function RankedList<T extends Record<string, unknown>>({
  data,
  selectedDataPoint,
  onItemClick,
  searchKey = "name" as keyof T,
  itemsPerPage = 10,
  renderItem,
  colorItem,
  className,
  searchPlaceholder,
  headerAction,
}: RankedListProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortReversed, setSortReversed] = useState(false);

  useEffect(() => {
    setSortReversed(false);
    setCurrentPage(1);
  }, [selectedDataPoint.key]);

  const {
    originalRankMap,
    totalPages,
    startIndex,
    paginatedData,
    sortAscending,
  } = useSortedRankedData({
    data,
    selectedDataPoint,
    searchKey,
    searchTerm,
    itemsPerPage,
    currentPage,
    sortReversed,
  });

  const { formatValue, getOriginalRank, defaultColorItem } =
    useRankedItemHelpers(selectedDataPoint, originalRankMap);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const listElement = document.querySelector(".ranked-list-items");
    if (listElement) listElement.scrollTop = 0;
  };

  const defaultRenderItem = (item: T, index: number, color: string) => (
    <button
      key={String(index)}
      onClick={() => onItemClick?.(item)}
      className="w-full p-4 hover:bg-black/70 transition-colors flex items-center justify-between group"
    >
      <div className="flex items-center gap-4">
        <span className="text-white/30 text-sm w-8 shrink-0 tabular-nums text-left">
          {selectedDataPoint.isBoolean ? "" : getOriginalRank(item)}
        </span>
        <span className="text-white/90 text-sm md:text-base text-left">
          {String(item[searchKey])}
        </span>
      </div>
      <span
        className={cn(
          selectedDataPoint.isBoolean || item[selectedDataPoint.key] === null
            ? "font-medium"
            : "font-semibold",
          "text-sm md:text-base text-right",
        )}
        style={{ color: color }}
      >
        {formatValue(item)}
      </span>
    </button>
  );

  return (
    <div
      className={`bg-black-2 rounded-2xl border border-white/10 flex flex-col ${className}`}
    >
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-black-3 text-white rounded-xl placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
          {headerAction && (
            <div className="hidden md:block shrink-0">{headerAction}</div>
          )}
        </div>
        {selectedDataPoint.unit && (
          <div className="flex items-center justify-between pt-4 -mb-2 w-full text-grey">
            <div className="flex items-center gap-4 min-w-0">
              {!selectedDataPoint.isBoolean ? (
                <button
                  type="button"
                  onClick={() => {
                    setSortReversed((prev) => !prev);
                    setCurrentPage(1);
                  }}
                  className="w-8 shrink-0 flex items-center justify-start hover:text-white transition-colors"
                  aria-label={
                    sortAscending
                      ? t("rankedList.sort.asc")
                      : t("rankedList.sort.desc")
                  }
                >
                  {sortAscending ? (
                    <ArrowUp className="w-3 h-3" aria-hidden="true" />
                  ) : (
                    <ArrowDown className="w-3 h-3" aria-hidden="true" />
                  )}
                </button>
              ) : (
                <span className="w-8 shrink-0" aria-hidden="true" />
              )}
              <span>{t("rankedList.name")}</span>
            </div>
            <span className="shrink-0">{selectedDataPoint.unit}</span>
          </div>
        )}
      </div>
      <div className="overflow-y-auto ranked-list-items">
        <div className="h-full bg-black/40 grid grid-cols-1 auto-rows-fr [&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-white/10">
          {paginatedData.map((item, index) =>
            renderItem
              ? renderItem(item, index, startIndex, getOriginalRank(item))
              : defaultRenderItem(
                  item,
                  index,
                  colorItem ? colorItem(item) : defaultColorItem(item),
                ),
          )}
        </div>
      </div>
      {totalPages > 1 && (
        <MultiPagePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default RankedList;
