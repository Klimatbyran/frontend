import { useMemo, useState } from "react";
import { Map, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FeatureCollection } from "geojson";
import { PageHeader } from "@/components/layout/PageHeader";
import TerritoryMap from "@/components/maps/TerritoryMap";
import europeGeoJson from "@/data/europeGeo.json";
import { useRankedEuropeURLParams } from "@/hooks/europe/useRankedEuropeURLParams";
import { useEuropeanKPIs } from "@/hooks/europe/useEuropeKPIs";
import { useClimateTraceEmissions } from "@/hooks/europe/useClimateTraceEmissions";
import { useEuropeanData } from "@/hooks/europe/useEuropeanData";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import EuropeanInsightsPanel from "@/components/europe/EuropeanInsightsPanel";
import { EuropeanRankedList } from "@/components/europe/EuropeanRankedList";
import { KPIDataSelector } from "@/components/ranked/KPIDataSelector";
import { DataItem, KPIValue } from "@/types/rankings";
import { EuropeanCountry } from "@/types/europe";
import { createEntityClickHandler } from "@/utils/routing";
import { RankedListItem } from "@/types/rankings";
import { useLanguage } from "@/components/LanguageProvider";
import {
  buildCountryGeoIndex,
  resolveCountryIso3,
} from "@/utils/europe/countryNames";

const MAP_COLORS = {
  null: "color-mix(in srgb, var(--black-3) 80%, transparent)",
  gradientStart: "var(--pink-5)",
  gradientMidLow: "var(--pink-4)",
  gradientMidHigh: "var(--pink-3)",
  gradientEnd: "var(--blue-3)",
};

interface EuropeanPageHeaderProps {
  selectedKPI: KPIValue<EuropeanCountry>;
  onKPIChange: (kpi: KPIValue<EuropeanCountry>) => void;
  europeanKPIs: KPIValue<EuropeanCountry>[];
  viewMode: "map" | "list";
  onViewModeChange: (mode: "map" | "list") => void;
}

function EuropeanPageHeader({
  selectedKPI,
  onKPIChange,
  europeanKPIs,
  viewMode,
  onViewModeChange,
}: EuropeanPageHeaderProps) {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader
        title={t("europeanRankedPage.title")}
        description={t("europeanRankedPage.description")}
        className="-ml-4"
      />
      <KPIDataSelector
        selectedKPI={selectedKPI}
        onKPIChange={onKPIChange}
        kpis={europeanKPIs}
        translationPrefix="europe.list"
      />
      <div className="flex mb-4 lg:hidden">
        <ViewModeToggle
          viewMode={viewMode}
          modes={["map", "list"]}
          onChange={onViewModeChange}
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
    </>
  );
}

interface EuropeanMapProps {
  geoData: FeatureCollection;
  mapData: DataItem[];
  selectedKPI: KPIValue<EuropeanCountry>;
  onAreaClick: (name: string) => void;
  className?: string;
}

function EuropeanMap({
  geoData,
  mapData,
  selectedKPI,
  onAreaClick,
  className,
}: EuropeanMapProps) {
  return (
    <div className={className}>
      <TerritoryMap
        entityType="europe"
        geoData={geoData}
        data={mapData}
        selectedKPI={selectedKPI}
        onAreaClick={onAreaClick}
        defaultCenter={[55, 15]}
        defaultZoom={3}
        propertyNameField="NAME"
        colors={MAP_COLORS}
      />
    </div>
  );
}

export function EuropeanOverviewPage() {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const europeanKPIs = useEuropeanKPIs();
  const [geoData] = useState<FeatureCollection>(
    europeGeoJson as FeatureCollection,
  );
  const countryGeoIndex = useMemo(
    () => buildCountryGeoIndex(geoData),
    [geoData],
  );
  const { emissionsByIso } = useClimateTraceEmissions();
  const {
    selectedKPI,
    setSelectedKPI,
    viewMode,
    setKPIInURL,
    setViewModeInURL,
  } = useRankedEuropeURLParams(europeanKPIs);

  const { countryEntities, mapData, filteredGeoData, countriesAsEntities } =
    useEuropeanData(selectedKPI, geoData, emissionsByIso);

  const handleCountryClick = createEntityClickHandler(
    navigate,
    "europe",
    undefined,
    currentLanguage,
  );

  const handleCountryAreaClick = (name: string) => {
    const country = countryEntities.find((item) => item.mapName === name);
    if (country) {
      handleCountryClick(country as RankedListItem);
      return;
    }

    const iso3 = resolveCountryIso3(name, countryGeoIndex.nameToIso3);
    if (iso3) {
      handleCountryClick({ id: iso3, name: iso3 });
    }
  };

  const europeanOverviewList = (
    <EuropeanRankedList
      countryEntities={countryEntities}
      selectedKPI={selectedKPI}
      onItemClick={handleCountryClick}
    />
  );

  const handleKPIChange = (kpi: KPIValue<EuropeanCountry>) => {
    setSelectedKPI(kpi);
    setKPIInURL(String(kpi.key));
  };

  const insightsPanel = (
    <EuropeanInsightsPanel
      countriesData={countriesAsEntities}
      selectedKPI={selectedKPI}
    />
  );

  return (
    <>
      <EuropeanPageHeader
        selectedKPI={selectedKPI}
        onKPIChange={handleKPIChange}
        europeanKPIs={europeanKPIs}
        viewMode={viewMode}
        onViewModeChange={(mode) => setViewModeInURL(mode)}
      />

      <div className="lg:hidden space-y-6">
        {viewMode === "map" ? (
          <EuropeanMap
            geoData={filteredGeoData}
            mapData={mapData}
            selectedKPI={selectedKPI}
            onAreaClick={handleCountryAreaClick}
            className="relative h-[65vh]"
          />
        ) : (
          europeanOverviewList
        )}
        {insightsPanel}
      </div>

      <div className="hidden lg:grid grid-cols-1 gap-6">
        <div className="grid grid-cols-2 gap-6">
          {viewMode === "map" ? (
            <EuropeanMap
              geoData={filteredGeoData}
              mapData={mapData}
              selectedKPI={selectedKPI}
              onAreaClick={handleCountryAreaClick}
              className="relative h-full"
            />
          ) : (
            europeanOverviewList
          )}
          {viewMode === "map" ? europeanOverviewList : null}
        </div>
        {insightsPanel}
      </div>
    </>
  );
}
