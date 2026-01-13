import { useState } from "react";
import { Search } from "lucide-react";
import { t } from "i18next";
import MultiPagePagination from "@/components/ui/multi-page-pagination";
import { DataPoint } from "@/types/rankings";

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

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[selectedDataPoint.key];
    const bValue = b[selectedDataPoint.key];

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    // For boolean KPIs, sort alphabetically by name
    if (
      selectedDataPoint.isBoolean &&
      typeof aValue === "boolean" &&
      typeof bValue === "boolean"
    ) {
      const aName = String(a[searchKey] || "");
      const bName = String(b[searchKey] || "");
      return aName.localeCompare(bName);
    }

    // For non-boolean values, sort by the value
    const aNum = aValue as number;
    const bNum = bValue as number;
    return selectedDataPoint.higherIsBetter ? bNum - aNum : aNum - bNum;
  });

  const filteredData = sortedData.filter((item) => {
    const searchValue = item[searchKey];
    return (
      searchValue &&
      typeof searchValue === "string" &&
      searchValue.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const originalRankMap = new Map<T, number>();
  sortedData.forEach((item, index) => {
    originalRankMap.set(item, index + 1);
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const listElement = document.querySelector(".ranked-list-items");
    if (listElement) {
      listElement.scrollTop = 0;
    }
  };

  const formatValue = (item: T) => {
    const value = item[selectedDataPoint.key];

    // If there's a custom formatter, use it
    if (selectedDataPoint.formatter) {
      return selectedDataPoint.formatter(value);
    }

    // Default formatting logic
    if (value === null) {
      return selectedDataPoint.nullValues || t("noData");
    }

    if (typeof value === "boolean") {
      // Use booleanLabels if available, otherwise fall back to generic labels
      if (selectedDataPoint.booleanLabels) {
        return value
          ? selectedDataPoint.booleanLabels.true
          : selectedDataPoint.booleanLabels.false;
      }
      return value ? t("yes") : t("no");
    }

    if (typeof value === "number") {
      return `${value.toFixed(1)}`;
    }

    return String(value);
  };

  const getOriginalRank = (item: T): number => {
    return originalRankMap.get(item) || 0;
  };

  const defaultRenderItem = (item: T, index: number) => {
    const originalRank = getOriginalRank(item);
    return (
      <button
        key={String(index)}
        onClick={() => onItemClick?.(item)}
        className="w-full p-4 hover:bg-black/40 transition-colors flex items-center justify-between group"
      >
        <div className="flex items-center gap-4">
          <span className="text-white/30 text-sm w-8">
            {selectedDataPoint.isBoolean
              ? /* Empty span to maintain indentation for boolean KPIs */
                ""
              : originalRank}
          </span>
          <span className="text-white/90 text-sm md:text-base text-left">
            {String(item[searchKey])}
          </span>
        </div>
        <span className="text-orange-2 text-sm md:text-base font-medium text-right">
          {formatValue(item)}
        </span>
      </button>
    );
  };

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
            <span>{selectedDataPoint.unit}</span>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto ranked-list-items min-h-[570px]">
        <div className="divide-y divide-white/10">
          {paginatedData.map((item, index) => {
            const originalRank = getOriginalRank(item);
            return renderItem
              ? renderItem(item, index, startIndex, originalRank)
              : defaultRenderItem(item, index);
          })}
          {/* Add empty placeholder rows to maintain height */}
          {paginatedData.length < itemsPerPage &&
            Array(itemsPerPage - paginatedData.length)
              .fill(0)
              .map((_, i) => (
                <div key={`empty-${i}`} className="p-4 h-[50px]"></div>
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
