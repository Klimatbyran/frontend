import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHiddenItems } from "@/components/charts";
import { SectorEmissionsChart } from "@/components/charts/sectorChart/SectorEmissions";
import { useSectorEmissions } from "@/hooks/territories/useSectorEmissions";
import { useSectors } from "@/hooks/territories/useSectors";
import { Text } from "../ui/text";
import {
  getAvailableYearsFromSectors,
  getCurrentYearFromAvailable,
} from "@/utils/detail/sectorYearUtils";

export const CountriesSection = () => {
  const { t } = useTranslation();
  const { sectorEmissions } = useSectorEmissions("nation", undefined);
  const { getSectorInfo } = useSectors();
  const { hiddenItems: filteredSectors, setHiddenItems: setFilteredSectors } =
    useHiddenItems<string>([]);
  const [selectedYear, setSelectedYear] = useState<string>("2023");

  const availableYears = getAvailableYearsFromSectors(sectorEmissions);
  const currentYear = getCurrentYearFromAvailable(selectedYear, availableYears);

  return (
    <div className="bg-black w-full flex flex-col items-center pt-80">
      <div className="w-full container mx-auto px-4 items-center flex flex-col gap-10">
        <div className="flex flex-col gap-4 text-center max-w-[600px]">
          <Text className="text-4xl font-light">
            {t("landingPage.countriesSection.title")}
          </Text>
          <Text className="text-grey font-regular text-[18px]">
            {t("landingPage.countriesSection.description")}
          </Text>
        </div>
        <div className="w-full max-w-6xl">
          <SectorEmissionsChart
            sectorEmissions={sectorEmissions}
            availableYears={availableYears}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            currentYear={currentYear}
            getSectorInfo={getSectorInfo}
            filteredSectors={filteredSectors}
            onFilteredSectorsChange={setFilteredSectors}
            helpItems={[]}
            sectionClassName="bg-transparent"
            showHeader={false}
          />
        </div>
      </div>
    </div>
  );
};
