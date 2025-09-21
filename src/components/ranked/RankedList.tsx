import { useState } from "react";
import { Search } from "lucide-react";
import MultiPagePagination from "@/components/ui/multi-page-pagination";
import { DataPoint } from "@/types/lists";

export interface RankedListProps<T extends Record<string, unknown>> {
  data: T[];
  selectedDataPoint: DataPoint<T>;
  onItemClick?: (item: T) => void;
  searchKey?: keyof T;
  itemsPerPage?: number;
  renderItem?: (item: T, index: number, startIndex: number) => React.ReactNode;
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
  className = "",
  searchPlaceholder = "Search...",
}: RankedListProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[selectedDataPoint.key] as number;
    const bValue = b[selectedDataPoint.key] as number;

    if (aValue === null && bValue === null) {
      return 0;
    }
    if (aValue === null) {
      return 1;
    }
    if (bValue === null) {
      return -1;
    }

    return selectedDataPoint.higherIsBetter ? bValue - aValue : aValue - bValue;
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
      return selectedDataPoint.nullValues || "N/A";
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    if (typeof value === "number") {
      return `${value.toFixed(1)}${selectedDataPoint.unit || ""}`;
    }

    return String(value);
  };

  const defaultRenderItem = (item: T, index: number, startIndex: number) => (
    <button
      key={String(index)}
      onClick={() => onItemClick?.(item)}
      className="w-full p-4 hover:bg-black/40 transition-colors flex items-center justify-between group"
    >
      <div className="flex items-center gap-4">
        <span className="text-white/30 text-sm w-8">
          {startIndex + index + 1}
        </span>
        <span className="text-white/90 text-sm md:text-base">
          {String(item[searchKey])}
        </span>
      </div>
      <span className="text-orange-2 text-sm md:text-base font-medium text-right">
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
      </div>
      <div className="flex-1 overflow-y-auto ranked-list-items">
        <div className="divide-y divide-white/10">
          {paginatedData.map((item, index) =>
            renderItem
              ? renderItem(item, index, startIndex)
              : defaultRenderItem(item, index, startIndex),
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
