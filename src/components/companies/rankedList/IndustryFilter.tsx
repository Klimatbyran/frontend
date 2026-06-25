import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { SECTOR_ORDER } from "@/lib/constants/sectors";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ALL_SECTORS_VALUE = "all";

interface IndustryFilterProps {
  availableSectors: string[];
  selectedSector: string;
  onSectorChange: (sector: string) => void;
}

export function IndustryFilter({
  availableSectors,
  selectedSector,
  onSectorChange,
}: IndustryFilterProps) {
  const { t } = useTranslation();
  const sectorNames = useSectorNames();

  const sectorOptions = useMemo(() => {
    const options = SECTOR_ORDER.filter((code) =>
      availableSectors.includes(code),
    ).map((code) => ({
      value: code,
      label: sectorNames[code],
    }));

    return [
      {
        value: ALL_SECTORS_VALUE,
        label: t("explorePage.companies.allSectors"),
      },
      ...options,
    ];
  }, [availableSectors, sectorNames, t]);

  const selectedSectorName =
    sectorOptions.find((option) => option.value === selectedSector)?.label ??
    t("explorePage.companies.allSectors");

  if (availableSectors.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm text-grey">
        {t("companiesOverviewPage.selectIndustry", "Select industry")}:
      </label>
      <Select value={selectedSector} onValueChange={onSectorChange}>
        <SelectTrigger className="w-full md:max-w-sm bg-black-2 border-black-3 text-white">
          <SelectValue
            placeholder={t(
              "companiesOverviewPage.selectIndustry",
              "Select industry",
            )}
          >
            {selectedSectorName}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-black-1 border-black-3">
          {sectorOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-white focus:bg-black-2"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
