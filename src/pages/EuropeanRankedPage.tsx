import { useState, useMemo } from "react";
import { Map, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FeatureCollection } from "geojson";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import MapOfSweden, { DataItem } from "@/components/maps/SwedenMap";
import europeGeoJson from "@/data/europeGeo.json";
import { useRankedEuropeURLParams } from "@/hooks/europe/useRankedEuropeURLParams";
import {
  useEurope,
  EuropeData,
  useEuropeanKPIs,
} from "@/hooks/europe/useEuropeKPIs";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import EuropeanInsightsPanel from "@/components/europe/EuropeanInsightsPanel";
import { EuropeanCountry } from "@/types/europe";
import { EuropeanRankedList } from "@/components/europe/EuropeanRankedList";
import { KPIDataSelector } from "@/components/ranked/KPIDataSelector";
import { createEntityClickHandler } from "@/utils/routing";
import { RankedListItem } from "@/types/rankings";

export function EuropeanRankedPage() {
  const { t } = useTranslation();
  const europeanKPIs = useEuropeanKPIs();
  const [geoData] = useState<FeatureCollection>(europeGeoJson as FeatureCollection);
  const { countriesData } = useEurope();

  const navigate = useNavigate();

  const {
    selectedKPI,
    setSelectedKPI,
    viewMode,
    setKPIInURL,
    setViewModeInURL,
  } = useRankedEuropeURLParams(europeanKPIs);

  const handleCountryClick = createEntityClickHandler(
    navigate,
    "europe",
    viewMode,
  );

  // Create an adapter for MapOfSweden
  const handleCountryAreaClick = (name: string) => {
    const country = countriesData.find((c) => c.name === name);
    if (country) {
      handleCountryClick(country);
    } else {
      handleCountryClick(name);
    }
  };

  // Transform countries data from European KPIs endpoint into required formats
  const countryEntities: RankedListItem[] = useMemo(() => {
    return countriesData.map((countryData: EuropeData) => {
      return {
        name: countryData.name,
        id: countryData.name,
        displayName: countryData.name,
        mapName: countryData.name,
        historicalEmissionChangePercent:
          countryData.historicalEmissionChangePercent,
        meetsParis: countryData.meetsParis,
      };
    });
  }, [countriesData]);

  const mapData: DataItem[] = useMemo(() => {
    return countryEntities.map((country) => ({
      ...country,
      id: country.mapName,
      name: country.mapName,
      displayName: country.displayName,
    }));
  }, [countryEntities]);

  const countriesAsEntities: EuropeanCountry[] = useMemo(() => {
    return countryEntities.map((country) => ({
      id: String(country.id),
      name: country.displayName,
      emissions: null,
      historicalEmissionChangePercent:
        typeof country.historicalEmissionChangePercent === "number"
          ? country.historicalEmissionChangePercent
          : null,
      meetsParis:
        typeof country.meetsParis === "boolean" ? country.meetsParis : null,
    }));
  }, [countryEntities]);

  const europeanRankedList = (
    <EuropeanRankedList
      countryEntities={countryEntities}
      selectedKPI={selectedKPI}
      onItemClick={handleCountryClick}
    />
  );

  const renderMapOrList = (isMobile: boolean) =>
    viewMode === "map" ? (
      <div className={isMobile ? "relative h-[65vh]" : "relative h-full"}>
        <MapOfSweden
          entityType="europe"
          geoData={geoData}
          data={mapData}
          selectedKPI={selectedKPI}
          onAreaClick={handleCountryAreaClick}
          defaultCenter={[55, 15]}
          propertyNameField="NAME"
        />
      </div>
    ) : (
      europeanRankedList
    );

  return (
    <>
      <PageHeader
        title={t("europeanRankedPage.title")}
        description={t("europeanRankedPage.description")}
        className="-ml-4"
      />

      <KPIDataSelector
        selectedKPI={selectedKPI}
        onKPIChange={(kpi) => {
          setSelectedKPI(kpi);
          setKPIInURL(String(kpi.key));
        }}
        kpis={europeanKPIs}
        translationPrefix="europe.list"
      />

      <div className="flex mb-4 lg:hidden">
        <ViewModeToggle
          viewMode={viewMode}
          modes={["map", "list"]}
          onChange={(mode) => setViewModeInURL(mode)}
          titles={{
            map: t("viewModeToggle.map"),
            list: t("viewModeToggle.list"),
          }}
          showTitles
          icons={{
            map: <Map className="w-4 h-4" />,
            list: <List className="w-4 h-4" />,
          }}
        />
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-6">
        {renderMapOrList(true)}
        <EuropeanInsightsPanel
          countriesData={countriesAsEntities}
          selectedKPI={selectedKPI}
        />
      </div>

      {/* Desktop View */}
      <div className="hidden lg:grid grid-cols-1 gap-6">
        <div className="grid grid-cols-2 gap-6">
          {renderMapOrList(false)}
          {viewMode === "map" ? europeanRankedList : null}
        </div>
        <EuropeanInsightsPanel
          countriesData={countriesAsEntities}
          selectedKPI={selectedKPI}
        />
      </div>
    </>
  );
}
