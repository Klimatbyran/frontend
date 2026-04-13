import { useEffect, useMemo, useState } from "react";
import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FeatureCollection } from "geojson";
import TerritoryMap from "../maps/TerritoryMap";
import municipalityGeoJson from "@/data/municipalityGeo.json";
import regionGeoJson from "@/data/regionGeo.json";
import { useMunicipalityKPIs } from "@/hooks/municipalities/useMunicipalityKPIs";
import { createEntityClickHandler } from "@/utils/routing";
import type { Municipality } from "@/types/municipality";
import { Button } from "../ui/button";
import { LocalizedLink } from "@/components/LocalizedLink";
import { ArrowRight } from "lucide-react";
import { useRegionalKPIs, useRegions } from "@/hooks/regions/useRegionKPIs";
import { toMapRegionName } from "@/utils/regionUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MunicipalitiesSectionProps {
  municipalities: Municipality[];
}

type TerritoryMode = "municipalities" | "regions";

export const MunicipalitiesSection = ({
  municipalities,
}: MunicipalitiesSectionProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const municipalityKPIs = useMunicipalityKPIs();
  const regionalKPIs = useRegionalKPIs();
  const { regionsData } = useRegions();
  const [territoryMode, setTerritoryMode] =
    useState<TerritoryMode>("municipalities");
  const [selectedKPIKey, setSelectedKPIKey] = useState<string>(
    "historicalEmissionChangePercent",
  );

  const activeKPIs =
    territoryMode === "municipalities" ? municipalityKPIs : regionalKPIs;

  const selectedKPI = useMemo(
    () =>
      activeKPIs.find((kpi) => String(kpi.key) === selectedKPIKey) ||
      activeKPIs.find((kpi) => kpi.key === "historicalEmissionChangePercent") ||
      activeKPIs[0],
    [activeKPIs, selectedKPIKey],
  );

  useEffect(() => {
    if (activeKPIs.length === 0) {
      return;
    }

    const hasSelectedKPI = activeKPIs.some(
      (kpi) => String(kpi.key) === selectedKPIKey,
    );

    if (!hasSelectedKPI) {
      const fallbackKPI =
        activeKPIs.find(
          (kpi) => kpi.key === "historicalEmissionChangePercent",
        ) || activeKPIs[0];

      setSelectedKPIKey(String(fallbackKPI.key));
    }
  }, [activeKPIs, selectedKPIKey]);

  const handleMunicipalityClick = useMemo(
    () => createEntityClickHandler(navigate, "municipality", "map"),
    [navigate],
  );
  const handleRegionClick = useMemo(
    () => createEntityClickHandler(navigate, "region"),
    [navigate],
  );

  const handleMunicipalityAreaClick = (name: string) => {
    const municipality = municipalities.find((m) => m.name === name);
    if (municipality) {
      handleMunicipalityClick(municipality);
      return;
    }

    handleMunicipalityClick(name);
  };

  const mapData = useMemo(
    () =>
      municipalities.map((m) => {
        const { sectorEmissions, ...rest } = m;
        return { ...rest, id: m.name };
      }),
    [municipalities],
  );

  const regionMapData = useMemo(
    () =>
      regionsData.map((region) => {
        const mapName = toMapRegionName(region.name);
        return {
          ...region,
          id: mapName,
          name: mapName,
          displayName: region.name,
        };
      }),
    [regionsData],
  );

  const handleRegionAreaClick = (name: string) => {
    const matchedRegion = regionsData.find(
      (region) => toMapRegionName(region.name) === name || region.name === name,
    );

    if (matchedRegion) {
      handleRegionClick(matchedRegion.name);
      return;
    }

    handleRegionClick(name);
  };

  const activeMapData =
    territoryMode === "municipalities" ? mapData : regionMapData;
  const activeGeoData =
    territoryMode === "municipalities"
      ? (municipalityGeoJson as FeatureCollection)
      : (regionGeoJson as FeatureCollection);
  const activeAreaClickHandler =
    territoryMode === "municipalities"
      ? handleMunicipalityAreaClick
      : handleRegionAreaClick;
  const sectionTitle =
    territoryMode === "municipalities"
      ? t("landingPage.municipalitiesSection.title")
      : t("landingPage.regionsSection.title");
  const sectionDescription =
    territoryMode === "municipalities"
      ? t("landingPage.municipalitiesSection.description")
      : t("landingPage.regionsSection.description");
  const explorePath =
    territoryMode === "municipalities" ? "/municipalities" : "/regions";
  const exploreLabel =
    territoryMode === "municipalities"
      ? "Explore Municipalities"
      : "Explore Regions";

  if (!selectedKPI) {
    return null;
  }

  return (
    <div className="bg-black w-full flex flex-col items-center min-h-screen pt-44 md:pt-52">
      <div className="w-full container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
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

            <div className="relative pt-4 md:pt-0 w-full h-[55vh] md:h-[65vh] lg:h-[75vh]">
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
            </div>
          </div>

          <div className="order-1 lg:order-1 w-full lg:w-2/5 flex flex-col gap-24 lg:pt-4">
            <div className="flex flex-col gap-4">
              <Text className="text-4xl font-light">{sectionTitle}</Text>
              <Text className="text-grey font-regular text-[18px]">
                {sectionDescription}
              </Text>
            </div>
            <LocalizedLink
              to={explorePath}
              className="hidden lg:flex self-end w-fit pt-2"
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
                </span>
                <ArrowRight
                  className="w-5 h-5 ml-2"
                  aria-hidden="true"
                  color="white"
                />
              </Button>
            </LocalizedLink>
          </div>

          <LocalizedLink
            to={explorePath}
            className="lg:hidden order-3 self-end w-fit pt-2"
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
              </span>
              <ArrowRight
                className="w-5 h-5 ml-2"
                aria-hidden="true"
                color="white"
              />
            </Button>
          </LocalizedLink>
        </div>
      </div>
    </div>
  );
};
