import { useState } from "react";
import { Map, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FeatureCollection } from "geojson";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import MapOfSweden from "@/components/maps/SwedenMap";
import europeGeoJson from "@/data/europeGeo.json";
import { useRankedEuropeURLParams } from "@/hooks/europe/useRankedEuropeURLParams";
import { useEurope, useEuropeanKPIs } from "@/hooks/europe/useEuropeKPIs";
import { useEuropeanData } from "@/hooks/europe/useEuropeanData";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import EuropeanInsightsPanel from "@/components/europe/EuropeanInsightsPanel";
import { EuropeanRankedList } from "@/components/europe/EuropeanRankedList";
import { KPIDataSelector } from "@/components/ranked/KPIDataSelector";
import { createEntityClickHandler } from "@/utils/routing";
import { KPIValue } from "@/types/rankings";
import { EuropeanCountry } from "@/types/europe";
import { DataItem } from "@/components/maps/SwedenMap";
import React from "react";

interface EuropeanContentViewProps {
  viewMode: "map" | "list";
  filteredGeoData: FeatureCollection;
  mapData: DataItem[];
  selectedKPI: KPIValue<EuropeanCountry>;
  onAreaClick: (name: string) => void;
  europeanRankedList: React.ReactNode;
}

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

function EuropeanContentView({
  viewMode,
  filteredGeoData,
  mapData,
  selectedKPI,
  onAreaClick,
  europeanRankedList,
}: EuropeanContentViewProps) {
  const renderMapOrList = (isMobile: boolean) =>
    viewMode === "map" ? (
      <div className={isMobile ? "relative h-[65vh]" : "relative h-full"}>
        <MapOfSweden
          entityType="europe"
          geoData={filteredGeoData}
          data={mapData}
          selectedKPI={selectedKPI}
          onAreaClick={onAreaClick}
          defaultCenter={[55, 15]}
          defaultZoom={3}
          propertyNameField="NAME"
        />
      </div>
    ) : (
      europeanRankedList
    );

  return (
    <>
      <div className="lg:hidden space-y-6">{renderMapOrList(true)}</div>
      <div className="hidden lg:grid grid-cols-1 gap-6">
        <div className="grid grid-cols-2 gap-6">
          {renderMapOrList(false)}
          {viewMode === "map" ? europeanRankedList : null}
        </div>
      </div>
    </>
  );
}

export function EuropeanRankedPage() {
  const europeanKPIs = useEuropeanKPIs();
  const [geoData] = useState<FeatureCollection>(
    europeGeoJson as FeatureCollection,
  );
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
  const { countryEntities, mapData, filteredGeoData, countriesAsEntities } =
    useEuropeanData(countriesData, selectedKPI, geoData);
  const handleCountryAreaClick = (name: string) => {
    const country = countriesData.find((c) => c.name === name);
    handleCountryClick(country || name);
  };
  const europeanRankedList = (
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

  return (
    <>
      <EuropeanPageHeader
        selectedKPI={selectedKPI}
        onKPIChange={handleKPIChange}
        europeanKPIs={europeanKPIs}
        viewMode={viewMode}
        onViewModeChange={(mode) => setViewModeInURL(mode)}
      />
      <EuropeanContentView
        viewMode={viewMode}
        filteredGeoData={filteredGeoData}
        mapData={mapData}
        selectedKPI={selectedKPI}
        onAreaClick={handleCountryAreaClick}
        europeanRankedList={europeanRankedList}
      />
      <EuropeanInsightsPanel
        countriesData={countriesAsEntities}
        selectedKPI={selectedKPI}
      />
    </>
  );
}
