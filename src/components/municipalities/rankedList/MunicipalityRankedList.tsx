import { useState } from "react";
import { Search } from "lucide-react";
import { t } from "i18next";
import { Municipality } from "@/types/municipality";
import MultiPagePagination from "@/components/ui/multi-page-pagination";
import { useLanguage } from "@/components/LanguageProvider";
import { createSimpleStringComparator } from "@/utils/sorting";

interface DataPoint {
  label: string;
  key: keyof Municipality;
  unit: string;
  description?: string;
  higherIsBetter: boolean;
  nullValues?: string;
  isBoolean?: boolean;
}

interface RankedListProps {
  municipalityData: Municipality[];
  selectedKPI: DataPoint;
  onMunicipalityClick: (name: string) => void;
}

function MunicipalityRankedList({
  municipalityData,
  selectedKPI,
  onMunicipalityClick,
}: RankedListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { currentLanguage } = useLanguage();

  const sortedData = [...municipalityData].sort((a, b) => {
    // For boolean KPIs, sort alphabetically by municipality name
    if (selectedKPI.isBoolean) {
      const nameComparator = createSimpleStringComparator(currentLanguage);
      return nameComparator(a.name, b.name);
    }

    // For numeric KPIs, sort by value
    const aValue = a[selectedKPI.key] as number;
    const bValue = b[selectedKPI.key] as number;

    if (aValue === null && bValue === null) {
      return 0;
    }
    if (aValue === null) {
      return 1;
    }
    if (bValue === null) {
      return -1;
    }

    return selectedKPI.higherIsBetter ? bValue - aValue : aValue - bValue;
  });

  const filteredData = sortedData.filter((municipality) =>
    municipality.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const listElement = document.querySelector(".municipality-list");
    if (listElement) {
      listElement.scrollTop = 0;
    }
  };

  const municipalityValue = (municipality: Municipality) => {
    // Handle boolean KPIs with special year display
    if (selectedKPI.isBoolean) {
      const value = municipality[selectedKPI.key] as boolean;

      // Special case for climate plan with year information
      if (
        selectedKPI.key === "climatePlan" &&
        value &&
        municipality.climatePlanYear
      ) {
        return t("municipalities.list.kpis.climatePlan.hasPlanSince", {
          year: municipality.climatePlanYear,
        });
      }

      // Standard boolean display
      return value
        ? t(`municipalities.list.kpis.${selectedKPI.key}.booleanLabels.true`)
        : t(`municipalities.list.kpis.${selectedKPI.key}.booleanLabels.false`);
    }

    // Handle numeric KPIs
    const value = municipality[selectedKPI.key] as number;
    return value !== null ? `${value.toFixed(1)}` : selectedKPI.nullValues;
  };

  return (
    <div className="bg-black-2 rounded-2xl flex flex-col border border-white/10">
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
          <input
            type="text"
            placeholder={t("municipalities.list.rankedList.search.placeholder")}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-black-3 text-white rounded-xl placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>
        <div className="text-grey flex items-center pl-12 pt-4 -mb-2 w-full justify-between">
          <span>{t("municipalities.name")}</span>
          <span>{selectedKPI.unit}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto municipality-list">
        <div className="divide-y divide-white/10">
          {paginatedData.map((municipality, index) => (
            <button
              key={municipality.name}
              onClick={() => onMunicipalityClick(municipality.name)}
              className="w-full p-4 hover:bg-black/40 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <span className="text-white/30 text-sm w-8">
                  {!selectedKPI.isBoolean ? startIndex + index + 1 : ""}
                </span>
                <span className="text-white/90 text-sm md:text-base">
                  {municipality.name}
                </span>
              </div>
              <span className="text-orange-2 text-sm md:text-base font-medium text-right">
                {municipalityValue(municipality)}
              </span>
            </button>
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

export default MunicipalityRankedList;
