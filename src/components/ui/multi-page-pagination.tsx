import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MultiPagePagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const paginationButtons = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((page) => {
      const distance = Math.abs(page - currentPage);
      return (
        distance === 0 || distance === 1 || page === 1 || page === totalPages
      );
    })
    .map((page, index, array) => (
      <React.Fragment key={page}>
        {index > 0 && array[index - 1] !== page - 1 && (
          <span className="text-white/30">...</span>
        )}
        <button
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 rounded-xl text-sm transition-colors ${
            currentPage === page
              ? "bg-white/10 text-orange-2"
              : "text-white/70 hover:bg-black/40"
          }`}
        >
          {page}
        </button>
      </React.Fragment>
    ));

  return (
    <div className="p-4 border-t border-white/10 flex items-center justify-between">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="p-2 text-white/70 disabled:text-white/20 disabled:cursor-not-allowed hover:bg-black/40 rounded-xl transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-2">{paginationButtons}</div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="p-2 text-white/70 disabled:text-white/20 disabled:cursor-not-allowed hover:bg-black/40 rounded-xl transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MultiPagePagination;
