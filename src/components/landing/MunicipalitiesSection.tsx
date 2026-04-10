import { useMemo, useState } from "react";
import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FeatureCollection } from "geojson";
import TerritoryMap from "../maps/TerritoryMap";
import municipalityGeoJson from "@/data/municipalityGeo.json";
import { useMunicipalityKPIs } from "@/hooks/municipalities/useMunicipalityKPIs";
import { createEntityClickHandler } from "@/utils/routing";
import type { Municipality } from "@/types/municipality";
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

interface MunicipalitiesSectionProps {
  municipalities: Municipality[];
}

export const MunicipalitiesSection = ({
  municipalities,
}: MunicipalitiesSectionProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const municipalityKPIs = useMunicipalityKPIs();
  const [selectedKPIKey, setSelectedKPIKey] = useState<string>(
    "historicalEmissionChangePercent",
  );

  const selectedKPI = useMemo(
    () =>
      municipalityKPIs.find((kpi) => String(kpi.key) === selectedKPIKey) ||
      municipalityKPIs.find(
        (kpi) => kpi.key === "historicalEmissionChangePercent",
      ) ||
      municipalityKPIs[0],
    [municipalityKPIs, selectedKPIKey],
  );

  const handleMunicipalityClick = useMemo(
    () => createEntityClickHandler(navigate, "municipality", "map"),
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

  if (!selectedKPI) {
    return null;
  }

  return (
    <div className="bg-black w-full flex flex-col items-center min-h-screen pt-80">
      <div className="w-full container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
          <div className="order-2 lg:order-2 w-full lg:w-3/5 flex flex-col gap-3">
            <div className="w-full max-w-[12rem] md:pt-4">
              <Select value={selectedKPIKey} onValueChange={setSelectedKPIKey}>
                <SelectTrigger className="w-full bg-black-2 border-black-1">
                  <SelectValue
                    placeholder={t("municipalities.list.dataSelector.label")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {municipalityKPIs.map((kpi) => (
                    <SelectItem key={String(kpi.key)} value={String(kpi.key)}>
                      {kpi.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative pt-4 md:pt-0 w-full h-[55vh] md:h-[65vh] lg:h-[75vh]">
              <TerritoryMap
                entityType="municipalities"
                geoData={municipalityGeoJson as FeatureCollection}
                data={mapData}
                selectedKPI={selectedKPI}
                onAreaClick={handleMunicipalityAreaClick}
                mapBackgroundColor="transparent"
                scrollWheelZoom={false}
              />
            </div>
          </div>

          <div className="order-1 lg:order-1 w-full lg:w-2/5 flex flex-col gap-24 lg:pt-4">
            <div className="flex flex-col gap-4">
              <Text className="text-4xl font-light">
                {t("landingPage.municipalitiesSection.title")}
              </Text>
              <Text className="text-grey font-regular text-[18px]">
                {t("landingPage.municipalitiesSection.description")}
              </Text>
            </div>
            <LocalizedLink
              to="/municipalities"
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
                  Explore Municipalities
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
            to="/municipalities"
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
                Explore Municipalities
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
