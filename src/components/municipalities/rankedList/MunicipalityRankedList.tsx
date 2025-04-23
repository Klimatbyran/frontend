import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { t } from "i18next";
import { Municipality } from "@/types/municipality";
import { isMobile } from "react-device-detect";

interface DataPoint {
  label: string;
  key: keyof Municipality;
  unit: string;
  description?: string;
  higherIsBetter: boolean;
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

  const sortedData = [...municipalityData].sort((a, b) => {
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
                  {startIndex + index + 1}
                </span>
                <span className="text-white/90">{municipality.name}</span>
              </div>
              <span className="text-orange-2 font-medium">
                {municipality[selectedKPI.key] !== null
                  ? `${(municipality[selectedKPI.key] as number).toFixed(1)}${selectedKPI.unit}`
                  : "-"}
              </span>
            </button>
          ))}
        </div>
      </div>
      {totalPages > 1 && (
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="p-2 text-white/70 disabled:text-white/20 disabled:cursor-not-allowed hover:bg-black/40 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                const distance = Math.abs(page - currentPage);
                return (
                  distance === 0 ||
                  distance === 1 ||
                  page === 1 ||
                  page === totalPages
                );
              })
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="text-white/30">...</span>
                  )}
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 rounded-xl text-sm transition-colors ${
                      currentPage === page
                        ? "bg-white/10 text-orange-2"
                        : "text-white/70 hover:bg-black/40"
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="p-2 text-white/70 disabled:text-white/20 disabled:cursor-not-allowed hover:bg-black/40 rounded-xl transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default MunicipalityRankedList;
