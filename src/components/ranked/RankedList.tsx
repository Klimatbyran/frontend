import { useState, useEffect } from "react";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { t } from "i18next";
import MultiPagePagination from "@/components/ui/multi-page-pagination";
import { DataPoint } from "@/types/rankings";
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
  className?: string;
  searchPlaceholder?: string;
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

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[selectedDataPoint.key];
    const bValue = b[selectedDataPoint.key];
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
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

  const validValues = sortedData
    .map((item) => item[selectedDataPoint.key])
    .filter(
      (value) =>
        (selectedDataPoint.isBoolean && typeof value === "boolean") ||
        (typeof value === "number" && !isNaN(value as number)),
    );

  const average =
    validValues.reduce(
      (sum, value) =>
        sum +
        (selectedDataPoint.isBoolean ? (value ? 1 : 0) : (value as number)),
      0,
    ) / validValues.length;

  const originalRankMap = new Map<T, number>();
  sortedData.forEach((item, index) => originalRankMap.set(item, index + 1));

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
    average,
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
  average: number,
  originalRankMap: Map<T, number>,
) {
  const formatValue = (item: T) => {
    const value = item[selectedDataPoint.key];
    if (selectedDataPoint.formatter) return selectedDataPoint.formatter(value);
    if (value === null) return selectedDataPoint.nullValues || t("noData");
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

  const getColor = (item: T): string => {
    const value = item[selectedDataPoint.key];
    if (value === null || value === undefined) return "text-pink-3";
    if (selectedDataPoint.isBoolean) {
      return value == selectedDataPoint.higherIsBetter
        ? "text-blue-3"
        : "text-pink-3";
    }
    // TODO: comment out for now, wait for gradient implementation
    // return (value as number) > average == selectedDataPoint.higherIsBetter
    //   ? "text-blue-3"
    //   : "text-pink-3";
    return "text-orange-2";
  };

  return { formatValue, getOriginalRank, getColor };
}

export function RankedList<T extends Record<string, unknown>>({
  data,
  selectedDataPoint,
  onItemClick,
  searchKey = "name" as keyof T,
  itemsPerPage = 10,
  renderItem,
  className,
  searchPlaceholder,
}: RankedListProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortReversed, setSortReversed] = useState(false);

  useEffect(() => {
    setSortReversed(false);
    setCurrentPage(1);
  }, [selectedDataPoint.key]);

  const {
    average,
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

  const { formatValue, getOriginalRank, getColor } = useRankedItemHelpers(
    selectedDataPoint,
    average,
    originalRankMap,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const listElement = document.querySelector(".ranked-list-items");
    if (listElement) listElement.scrollTop = 0;
  };

  const defaultRenderItem = (item: T, index: number) => (
    <button
      key={String(index)}
      onClick={() => onItemClick?.(item)}
      className="w-full p-4 hover:bg-black/40 transition-colors flex items-center justify-between group"
    >
      <div className="flex items-center gap-4">
        <span className="text-white/30 text-sm w-8">
          {selectedDataPoint.isBoolean ? "" : getOriginalRank(item)}
        </span>
        <span className="text-white/90 text-sm md:text-base text-left">
          {String(item[searchKey])}
        </span>
      </div>
      <span
        className={cn(
          getColor(item),
          "text-sm md:text-base font-medium text-right",
        )}
      >
        {formatValue(item)}
      </span>
    </button>
  );

  return (
    <div
      className={`bg-black-2 rounded-2xl flex flex-col border border-white/10 ${className}`}
    >
      <div className="p-4 border-b border-white/10">
        <div className="relative">
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
        {selectedDataPoint.unit && (
          <div className="text-grey flex items-center pl-12 pt-4 -mb-2 w-full justify-between">
            <span>{t("rankedList.name")}</span>
            <button
              type="button"
              onClick={() => {
                setSortReversed((prev) => !prev);
                setCurrentPage(1);
              }}
              className="flex items-center gap-1 hover:text-white transition-colors"
              aria-label={
                sortAscending
                  ? t("rankedList.sort.asc")
                  : t("rankedList.sort.desc")
              }
            >
              <span>{selectedDataPoint.unit}</span>
              {sortAscending ? (
                <ArrowUp className="w-3 h-3" aria-hidden="true" />
              ) : (
                <ArrowDown className="w-3 h-3" aria-hidden="true" />
              )}
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto ranked-list-items min-h-[570px]">
        <div className="divide-y divide-white/10">
          {paginatedData.map((item, index) =>
            renderItem
              ? renderItem(item, index, startIndex, getOriginalRank(item))
              : defaultRenderItem(item, index),
          )}
          {paginatedData.length < itemsPerPage &&
            Array(itemsPerPage - paginatedData.length)
              .fill(0)
              .map((_, i) => (
                <div key={`empty-${i}`} className="p-4 h-[50px]" />
              ))}
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
