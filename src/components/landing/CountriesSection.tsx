import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHiddenItems } from "@/components/charts";
import { SectorEmissionsChart } from "@/components/charts/sectorChart/SectorEmissions";
import { useSectorEmissions } from "@/hooks/territories/useSectorEmissions";
import { useSectors } from "@/hooks/territories/useSectors";
import { Text } from "../ui/text";
import { Button } from "../ui/button";
import { LocalizedLink } from "@/components/LocalizedLink";
import { ArrowRight } from "lucide-react";
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
    <div className="bg-black w-full flex flex-col items-center pt-44 md:pt-52">
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

        <div className="w-full max-w-6xl flex justify-end">
          <LocalizedLink to="/nation" className="w-fit pt-2">
            <Button
              variant="outline"
              size="lg"
              className="group relative w-auto h-12 rounded-md overflow-hidden font-medium border-white group-hover:border-blue-3 hover:opacity-100 active:opacity-100"
            >
              <span
                className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100"
                aria-hidden="true"
              />
              <span className="relative z-10 inline-flex items-center text-white transition-colors duration-500 group-hover:text-black">
                {t("landingPage.countriesSection.exploreButton")}
                <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
              </span>
            </Button>
          </LocalizedLink>
        </div>
      </div>
    </div>
  );
};
