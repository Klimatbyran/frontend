import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { RankedCompany } from "@/types/company";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";

interface IndustryFilterProps {
  companies: RankedCompany[];
  selectedSectors: string[];
  onSectorsChange: (sectors: string[]) => void;
}

export function IndustryFilter({
  companies,
  selectedSectors,
  onSectorsChange,
}: IndustryFilterProps) {
  const { t } = useTranslation();
  const sectorNames = useSectorNames();

  // Extract unique sectors from companies
  const availableSectors = useMemo(() => {
    const sectors = new Set<string>();
    companies.forEach((company) => {
      const sectorCode = (company as any).industry?.industryGics?.sectorCode;
      if (sectorCode) {
        sectors.add(sectorCode);
      }
    });
    return Array.from(sectors).sort();
  }, [companies]);

  const toggleSector = (sectorCode: string) => {
    if (selectedSectors.includes(sectorCode)) {
      // Remove sector
      const newSectors = selectedSectors.filter((s) => s !== sectorCode);
      onSectorsChange(newSectors.length > 0 ? newSectors : []);
    } else {
      // Add sector
      onSectorsChange([...selectedSectors, sectorCode]);
    }
  };

  if (availableSectors.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-grey mr-1">
        {t("companiesRankedPage.filterByIndustry", "Filter by industry")}:
      </span>
      {availableSectors.map((sectorCode) => {
        const isSelected = selectedSectors.includes(sectorCode);
        const sectorName =
          sectorNames[sectorCode as keyof typeof sectorNames] || sectorCode;

        return (
          <button
            key={sectorCode}
            type="button"
            onClick={() => toggleSector(sectorCode)}
            className={cn(
              "px-3 py-1.5 rounded-level-1 text-xs font-medium transition-all",
              "border",
              isSelected
                ? "bg-blue-5/30 border-blue-4 text-blue-2 hover:bg-blue-5/40"
                : "bg-black-2 border-black-3 text-grey hover:bg-black-3 hover:border-black-4",
            )}
          >
            {sectorName}
          </button>
        );
      })}
      {selectedSectors.length > 0 && (
        <button
          type="button"
          onClick={() => onSectorsChange([])}
          className="px-3 py-1.5 rounded-level-1 text-xs font-medium text-grey hover:text-white border border-black-3 hover:border-black-4 bg-black-2 hover:bg-black-3 transition-all"
        >
          {t("companiesRankedPage.clearFilters", "Clear all")}
        </button>
      )}
    </div>
  );
}
