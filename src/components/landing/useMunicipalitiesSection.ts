import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FeatureCollection } from "geojson";
import municipalityGeoJson from "@/data/municipalityGeo.json";
import regionGeoJson from "@/data/regionGeo.json";
import { useMunicipalityKPIs } from "@/hooks/municipalities/useMunicipalityKPIs";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import { createEntityClickHandler } from "@/utils/routing";
import { useRegionalKPIs, useRegions } from "@/hooks/regions/useRegionKPIs";
import { toMapRegionName } from "@/utils/regionUtils";

export type TerritoryMode = "municipalities" | "regions";

export function useMunicipalitiesSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const municipalityKPIs = useMunicipalityKPIs();
  const regionalKPIs = useRegionalKPIs();
  const { regionsData, loading: regionsLoading } = useRegions();
  const { municipalities, municipalitiesLoading } = useMunicipalities();

  const [territoryMode, setTerritoryMode] = useState<TerritoryMode>(
    "municipalities",
  );
  const [selectedKPIKey, setSelectedKPIKey] = useState<string>(
    "historicalEmissionChangePercent",
  );

  const activeKPIs =
    territoryMode === "municipalities" ? municipalityKPIs : regionalKPIs;

  const selectedKPI = useMemo(
    () =>
      activeKPIs.find((kpi) => String(kpi.key) === selectedKPIKey) ||
      activeKPIs.find(
        (kpi) => kpi.key === "historicalEmissionChangePercent",
      ) ||
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
    territoryMode === "municipalities"
      ? "/explore/municipalities"
      : "/explore/regions";
  const exploreLabel =
    territoryMode === "municipalities"
      ? t("landingPage.municipalitiesSection.exploreButton")
      : t("landingPage.regionsSection.exploreButton");

  const mapLoading =
    territoryMode === "municipalities" ? municipalitiesLoading : regionsLoading;

  return {
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
  };
}
