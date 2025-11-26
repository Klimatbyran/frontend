import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";

interface IndustryFilterProps {
  availableSectors: string[];
  selectedSector: string | null;
  onSectorChange: (sector: string) => void;
}

export function IndustryFilter({
  availableSectors,
  selectedSector,
  onSectorChange,
}: IndustryFilterProps) {
  const { t } = useTranslation();
  const sectorNames = useSectorNames();

  const handleSectorClick = (sectorCode: string) => {
    if (selectedSector !== sectorCode) {
      onSectorChange(sectorCode);
    }
  };

  if (availableSectors.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-grey mr-1">
        {t("companiesRankedPage.selectIndustry", "Select industry")}:
      </span>
      {availableSectors.map((sectorCode) => {
        const isSelected = selectedSector === sectorCode;
        const sectorName =
          sectorNames[sectorCode as keyof typeof sectorNames] || sectorCode;

        return (
          <button
            key={sectorCode}
            type="button"
            onClick={() => handleSectorClick(sectorCode)}
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
    </div>
  );
}
