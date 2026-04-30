import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";
import TerritoryMap from "../maps/TerritoryMap";
import { Button } from "../ui/button";
import { LocalizedLink } from "@/components/LocalizedLink";
import { ArrowRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMunicipalitiesSection } from "./useMunicipalitiesSection";

export const MunicipalitiesSection = () => {
  const { t } = useTranslation();
  const {
    territoryMode,
    setTerritoryMode,
    selectedKPIKey,
    setSelectedKPIKey,
    activeKPIs,
    selectedKPI,
    mapLoading,
    activeMapData,
    activeGeoData,
    activeAreaClickHandler,
    sectionTitle,
    sectionDescription,
    explorePath,
    exploreLabel,
  } = useMunicipalitiesSection();

  if (!selectedKPI) {
    return null;
  }

  return (
    <div className="bg-black w-full flex flex-col items-center min-h-screen pt-44 md:pt-52">
      <div className="w-full container max-w-7xl mx-auto px-4">
        <div className="flex w-full flex-col items-start gap-8 lg:flex-row lg:gap-12">
          <div className="order-2 lg:order-2 w-full lg:w-3/5 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3 md:pt-4">
              <div className="inline-flex rounded-md border border-black-1 bg-black-2 p-1">
                <button
                  type="button"
                  onClick={() => setTerritoryMode("municipalities")}
                  className={`rounded-sm px-3 py-1 text-sm transition-colors ${
                    territoryMode === "municipalities"
                      ? "bg-white text-black"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {t("globalSearch.searchCategoryMunicipalities")}
                </button>
                <button
                  type="button"
                  onClick={() => setTerritoryMode("regions")}
                  className={`rounded-sm px-3 py-1 text-sm transition-colors ${
                    territoryMode === "regions"
                      ? "bg-white text-black"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {t("globalSearch.searchCategoryRegions")}
                </button>
              </div>

              <div className="w-full max-w-[12rem]">
                <Select
                  value={selectedKPIKey}
                  onValueChange={setSelectedKPIKey}
                >
                  <SelectTrigger className="w-full bg-black-2 border-black-1">
                    <SelectValue
                      placeholder={t("municipalities.list.dataSelector.label")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {activeKPIs.map((kpi) => (
                      <SelectItem key={String(kpi.key)} value={String(kpi.key)}>
                        {kpi.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="relative w-full h-[55vh] md:h-[65vh] lg:h-[75vh]">
              {mapLoading ? (
                <div className="h-full w-full animate-pulse bg-black-2 rounded-level-2" />
              ) : (
                <TerritoryMap
                  key={territoryMode}
                  entityType={territoryMode}
                  geoData={activeGeoData}
                  data={activeMapData}
                  selectedKPI={selectedKPI}
                  onAreaClick={activeAreaClickHandler}
                  mapBackgroundColor="transparent"
                  scrollWheelZoom={false}
                  defaultCenter={
                    territoryMode === "regions" ? [63.7, 17] : [63, 17]
                  }
                />
              )}
            </div>
          </div>

          <div className="order-1 lg:order-1 w-full lg:w-2/5 flex flex-col gap-24 lg:pt-4">
            <div className="flex flex-col gap-4">
              <Text className="text-3xl sm:text-4xl font-light">
                {sectionTitle}
              </Text>
              <Text className="text-grey font-regular text-[18px]">
                {sectionDescription}
              </Text>
            </div>
            <LocalizedLink
              to={explorePath}
              className="hidden lg:flex self-end w-fit md:pt-2"
            >
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
                  {exploreLabel}
                  <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                </span>
              </Button>
            </LocalizedLink>
          </div>

          <LocalizedLink
            to={explorePath}
            className="lg:hidden order-3 self-start w-fit"
          >
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
                {exploreLabel}
                <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
              </span>
            </Button>
          </LocalizedLink>
        </div>
      </div>
    </div>
  );
};
