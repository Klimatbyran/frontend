import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import { useScreenSize } from "@/hooks/useScreenSize";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const { isMobile } = useScreenSize();

  const handleSectorClick = (sectorCode: string) => {
    if (selectedSector !== sectorCode) {
      onSectorChange(sectorCode);
    }
  };

  if (availableSectors.length === 0) {
    return null;
  }

  // Mobile: Use dropdown
  if (isMobile) {
    const selectedSectorName =
      selectedSector &&
      (sectorNames[selectedSector as keyof typeof sectorNames] ||
        selectedSector);

    return (
      <div className="space-y-2">
        <label className="text-sm text-grey">
          {t("companiesTopListsPage.selectIndustry", "Select industry")}:
        </label>
        <Select
          value={selectedSector || undefined}
          onValueChange={(value) => onSectorChange(value)}
        >
          <SelectTrigger className="w-full bg-black-2 border-black-3 text-white">
            <SelectValue
              placeholder={t(
                "companiesTopListsPage.selectIndustry",
                "Select industry",
              )}
            >
              {selectedSectorName}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-black-1 border-black-3">
            {availableSectors.map((sectorCode) => {
              const sectorName =
                sectorNames[sectorCode as keyof typeof sectorNames] ||
                sectorCode;
              return (
                <SelectItem
                  key={sectorCode}
                  value={sectorCode}
                  className="text-white focus:bg-black-2"
                >
                  {sectorName}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Desktop: Use badges
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-grey mr-1">
        {t("companiesTopListsPage.selectIndustry", "Select industry")}:
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
