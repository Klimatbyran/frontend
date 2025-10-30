import { useState, useEffect } from "react";
import { Search, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { DataPoint } from "@/types/entity-rankings";
import { t } from "i18next";
import { BooleanKPIStats } from "./BooleanKPIStats";
import { CaretDownIcon } from "@radix-ui/react-icons";

export interface BooleanGroupedListProps<T extends Record<string, unknown>> {
  data: T[];
  selectedDataPoint: DataPoint<T>;
  onItemClick?: (item: T) => void;
  searchKey?: keyof T;
  className?: string;
  searchPlaceholder?: string;
}

export function BooleanGroupedList<T extends Record<string, unknown>>({
  data,
  selectedDataPoint,
  onItemClick,
  searchKey = "name" as keyof T,
  className,
  searchPlaceholder,
}: BooleanGroupedListProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroup, setExpandedGroup] = useState<"true" | "false" | null>(
    "true",
  );
  const [currentPages, setCurrentPages] = useState<Record<string, number>>({
    true: 1,
    false: 1,
    null: 1,
  });

  const ITEMS_PER_PAGE = 10;

  const filteredData = data.filter((item) => {
    const searchValue = item[searchKey];
    return (
      searchValue &&
      typeof searchValue === "string" &&
      searchValue.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const trueItems = filteredData.filter(
    (item) => item[selectedDataPoint.key] === true,
  );
  const falseItems = filteredData.filter(
    (item) => item[selectedDataPoint.key] === false,
  );
  const nullItems = filteredData.filter(
    (item) =>
      item[selectedDataPoint.key] === null ||
      item[selectedDataPoint.key] === undefined,
  );

  const sortByName = (a: T, b: T) => {
    const aName = String(a[searchKey] || "");
    const bName = String(b[searchKey] || "");
    return aName.localeCompare(bName);
  };

  trueItems.sort(sortByName);
  falseItems.sort(sortByName);
  nullItems.sort(sortByName);

  useEffect(() => {
    if (filteredData.length === 1) {
      if (trueItems.length === 1) {
        setExpandedGroup("true");
      } else if (falseItems.length === 1) {
        setExpandedGroup("false");
      } else if (nullItems.length === 1) {
        setExpandedGroup(null);
      }
    }
  }, [
    filteredData.length,
    trueItems.length,
    falseItems.length,
    nullItems.length,
  ]);

  const getTrueLabel = () => {
    if (selectedDataPoint.booleanLabels?.true) {
      return selectedDataPoint.booleanLabels.true;
    }
    return t("yes");
  };

  const getFalseLabel = () => {
    if (selectedDataPoint.booleanLabels?.false) {
      return selectedDataPoint.booleanLabels.false;
    }
    return t("no");
  };

  const renderGroup = (
    items: T[],
    groupValue: "true" | "false" | "null",
    label: string,
    icon: React.ReactNode,
    colorClass: string,
  ) => {
    const isExpanded = expandedGroup === groupValue;
    const percentage = ((items.length / filteredData.length) * 100).toFixed(1);

    const currentPage = currentPages[groupValue] || 1;
    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedItems = items.slice(startIndex, endIndex);

    const handlePageChange = (newPage: number) => {
      setCurrentPages((prev) => ({
        ...prev,
        [groupValue]: newPage,
      }));
    };

    const handleGroupToggle = () => {
      const newExpandedState = isExpanded
        ? null
        : (groupValue as "true" | "false");
      setExpandedGroup(newExpandedState);
      // Reset to page 1 when expanding
      if (!isExpanded) {
        setCurrentPages((prev) => ({
          ...prev,
          [groupValue]: 1,
        }));
      }
    };

    return (
      <div className="border-b border-white/10 last:border-b-0">
        <button
          onClick={handleGroupToggle}
          className="w-full p-4 hover:bg-black/40 transition-colors flex items-center justify-between group"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className={`${colorClass} p-1.5 rounded-lg flex-shrink-0`}>
              {icon}
            </div>
            <div className="text-left flex-1">
              <div className="text-white/90 font-medium">{label}</div>
              <div className="text-white/50 text-sm">
                {items.length} {t("header.municipalities")} ({percentage}%)
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colorClass.replace("/10", "/30")} transition-all`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-white/50 text-sm font-medium w-12 text-right">
                {percentage}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-white/50 text-sm hidden sm:inline">
              {isExpanded ? t("collapse") : t("expand")}
            </span>
            <CaretDownIcon
              className={`w-8 h-8 text-white/50 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {isExpanded && (
          <div className="bg-black/20">
            {paginatedItems.map((item, index) => (
              <button
                key={String(index)}
                onClick={() => onItemClick?.(item)}
                className="w-full px-4 py-3 pl-16 hover:bg-black/40 transition-colors flex items-center justify-between group border-t border-white/5"
              >
                <span className="text-white/80 text-sm">
                  {String(item[searchKey])}
                </span>
                <div className={`${colorClass} p-1 rounded opacity-50`}>
                  {icon}
                </div>
              </button>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePageChange(currentPage - 1);
                  }}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/40 text-white/70 hover:bg-black/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-sm">{t("previous")}</span>
                </button>

                <div className="text-white/50 text-sm">
                  {t("page")} {currentPage} {t("of")} {totalPages}
                  <span className="hidden sm:inline">
                    {" "}
                    ({startIndex + 1}-{Math.min(endIndex, items.length)}{" "}
                    {t("of")} {items.length})
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePageChange(currentPage + 1);
                  }}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/40 text-white/70 hover:bg-black/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <span className="text-sm">{t("next")}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`bg-black-2 rounded-2xl flex flex-col border border-white/10 ${className}`}
    >
      <div className="p-4 border-b border-white/10 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black-3 text-white rounded-xl placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>

        {/* Summary Statistics */}
        {filteredData.length > 0 && (
          <BooleanKPIStats
            trueCount={trueItems.length}
            falseCount={falseItems.length}
            nullCount={nullItems.length}
            totalCount={filteredData.length}
            trueLabel={getTrueLabel()}
            falseLabel={getFalseLabel()}
            nullLabel={selectedDataPoint.nullValues || t("noData")}
          />
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-[570px]">
        {trueItems.length > 0 &&
          renderGroup(
            trueItems,
            "true",
            getTrueLabel(),
            <Check className="w-5 h-5 text-blue-3" />,
            "bg-blue-3/10",
          )}
        {falseItems.length > 0 &&
          renderGroup(
            falseItems,
            "false",
            getFalseLabel(),
            <X className="w-5 h-5 text-pink-3" />,
            "bg-pink-3/10",
          )}
        {nullItems.length > 0 &&
          renderGroup(
            nullItems,
            "null",
            selectedDataPoint.nullValues || t("noData"),
            <span className="w-5 h-5 text-white/30">?</span>,
            "bg-white/5",
          )}
      </div>

      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="text-sm text-white/50 text-center">
          {t("totalResults")}: {filteredData.length}
        </div>
      </div>
    </div>
  );
}

export default BooleanGroupedList;
