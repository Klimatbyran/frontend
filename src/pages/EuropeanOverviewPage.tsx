import { useMemo, useState } from "react";
import { ArrowDownCircle, Leaf, Map, List, TrendingDown } from "lucide-react";
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
import { KPIChipSelector } from "@/components/ranked/KPIChipSelector";
import { OverviewPageSkeleton } from "@/components/ranked/OverviewPageSkeleton";
import { OverviewSplitLayout } from "@/components/ranked/OverviewSplitLayout";
import { DataItem } from "@/types/rankings";
import { EuropeanCountry } from "@/types/europe";
import { createEntityClickHandler } from "@/utils/routing";
import { RankedListItem } from "@/types/rankings";
import { useLanguage } from "@/components/LanguageProvider";
import {
  buildCountryGeoIndex,
  resolveCountryIso3,
} from "@/utils/europe/countryNames";

const EUROPE_KPI_ICONS: Record<string, React.ReactNode> = {
  emissionsPerCapita: <TrendingDown className="w-4 h-4" />,
  historicalEmissionChangePercent: <ArrowDownCircle className="w-4 h-4" />,
  meetsParis: <Leaf className="w-4 h-4" />,
};

export function EuropeanOverviewPage() {
  const { t } = useTranslation();
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
  const { emissionsByIso, isLoading, error } = useClimateTraceEmissions();
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

  if (isLoading) {
    return <OverviewPageSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <h3 className="text-red-500 mb-4 text-xl">
          {t("europeanRankedPage.errorTitle")}
        </h3>
        <p className="text-grey">{t("europeanRankedPage.errorDescription")}</p>
      </div>
    );
  }

  const viewToggle = (
    <ViewModeToggle
      viewMode={viewMode}
      modes={["map", "list"]}
      onChange={setViewModeInURL}
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
  );

  const europeanOverviewList = (
    <EuropeanRankedList
      countryEntities={countryEntities}
      selectedKPI={selectedKPI}
      onItemClick={handleCountryClick}
      headerAction={viewToggle}
    />
  );

  const mapPanel = (
    <TerritoryMap
      entityType="europe"
      geoData={filteredGeoData}
      data={mapData as DataItem[]}
      selectedKPI={selectedKPI}
      onAreaClick={handleCountryAreaClick}
      defaultCenter={[55, 15]}
      defaultZoom={3}
      propertyNameField="NAME"
      className="max-w-none"
    />
  );

  return (
    <>
      <PageHeader
        title={t("europeanRankedPage.title")}
        description={t("europeanRankedPage.description")}
        className="-ml-4"
      />

      <KPIChipSelector<EuropeanCountry>
        selectedKPI={selectedKPI}
        kpis={europeanKPIs}
        onKPIChange={(kpi) => {
          setSelectedKPI(kpi);
          setKPIInURL(String(kpi.key));
        }}
        iconMap={EUROPE_KPI_ICONS}
        translationPrefix="europe.list"
        label={t("municipalities.list.dataSelector.label")}
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <OverviewSplitLayout
            viewMode={viewMode}
            visualizationMode="map"
            visualization={mapPanel}
            list={europeanOverviewList}
            toggle={viewToggle}
          />
          <EuropeanInsightsPanel
            countriesData={countriesAsEntities}
            selectedKPI={selectedKPI}
            section="stats"
          />
        </div>

        {!selectedKPI.isBoolean && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            <EuropeanInsightsPanel
              countriesData={countriesAsEntities}
              selectedKPI={selectedKPI}
              section="top"
            />
            <EuropeanInsightsPanel
              countriesData={countriesAsEntities}
              selectedKPI={selectedKPI}
              section="bottom"
            />
            <EuropeanInsightsPanel
              countriesData={countriesAsEntities}
              selectedKPI={selectedKPI}
              section="distribution"
            />
          </div>
        )}
      </div>
    </>
  );
}
