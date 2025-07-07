import { useState, useEffect, useCallback } from "react";
import { Map, List } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
import DataSelector from "@/components/municipalities/rankedList/MunicipalityDataSelector";
import MunicipalityRankedList from "@/components/municipalities/rankedList/MunicipalityRankedList";
import InsightsPanel from "@/components/municipalities/rankedList/MunicipalityInsightsPanel";
import SwedenMap from "@/components/municipalities/map/SwedenMap";
import municipalityGeoJson from "@/data/municipalityGeo.json";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import { useMunicipalityKPIs } from "@/hooks/municipalities/useMunicipalityKPIs";
import { FeatureCollection } from "geojson";

export function MunicipalitiesRankedPage() {
  const { t } = useTranslation();
  const { municipalities, loading, error } = useMunicipalities();
  const municipalityKPIs = useMunicipalityKPIs();
  const [geoData] = useState(municipalityGeoJson);

  const location = useLocation();
  const navigate = useNavigate();

  const getKPIFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const kpiLabel = params.get("kpi");
    return (
      municipalityKPIs.find((kpi) => kpi.label === kpiLabel) ||
      municipalityKPIs[0]
    );
  }, [location.search, municipalityKPIs]);

  const setKPIInURL = (kpiId: string) => {
    const params = new URLSearchParams(location.search);
    params.set("kpi", kpiId);
    navigate({ search: params.toString() }, { replace: true });
  };

  const getViewModeFromURL = () => {
    const params = new URLSearchParams(location.search);
    return params.get("view") === "list" ? "list" : "map";
  };
  const setViewModeInURL = (mode: "map" | "list") => {
    const params = new URLSearchParams(location.search);
    params.set("view", mode);
    navigate({ search: params.toString() }, { replace: true });
  };

  const [selectedKPI, setSelectedKPI] = useState(getKPIFromURL());
  const viewMode = getViewModeFromURL();

  useEffect(() => {
    const kpiFromUrl = getKPIFromURL();
    if (kpiFromUrl.label !== selectedKPI.label) {
      setSelectedKPI(kpiFromUrl);
    }
  }, [getKPIFromURL, selectedKPI.label]);

  const handleMunicipalityClick = (name: string) => {
    const formattedName = name.toLowerCase();
    window.location.href = `/municipalities/${formattedName}?view=${viewMode}`;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-16">
        <div className="h-12 w-1/3 bg-black-1 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 bg-black-1 rounded-level-2" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <h3 className="text-red-500 mb-4 text-xl">
          {t("municipalitiesComparePage.errorTitle")}
        </h3>
        <p className="text-grey">
          {t("municipalitiesComparePage.errorDescription")}
        </p>
      </div>
    );
  }

  const renderMapOrList = (isMobile: boolean) =>
    viewMode === "map" ? (
      <div className={isMobile ? "relative h-[65vh]" : "relative h-full"}>
        <SwedenMap
          geoData={geoData as FeatureCollection}
          municipalityData={municipalities}
          selectedKPI={selectedKPI}
          onMunicipalityClick={handleMunicipalityClick}
        />
      </div>
    ) : (
      <MunicipalityRankedList
        municipalityData={municipalities}
        selectedKPI={selectedKPI}
        onMunicipalityClick={handleMunicipalityClick}
      />
    );

  return (
    <>
      <PageHeader
        title={t("municipalitiesRankedPage.title")}
        description={t("municipalitiesRankedPage.description")}
        className="-ml-4"
      />

      <div className="flex mb-4 lg:hidden">
        <ViewModeToggle
          viewMode={viewMode}
          modes={["map", "list"]}
          onChange={(mode) => setViewModeInURL(mode)}
          titles={{
            map: t("municipalities.list.viewToggle.showMap"),
            list: t("municipalities.list.viewToggle.showList"),
          }}
          showTitles={true}
          icons={{
            map: <Map className="w-4 h-4" />,
            list: <List className="w-4 h-4" />,
          }}
        />
      </div>

      <DataSelector
        selectedKPI={selectedKPI}
        onDataPointChange={(kpi) => {
          setSelectedKPI(kpi);
          setKPIInURL(kpi.label);
        }}
      />

      {/* Mobile */}
      <div className="lg:hidden space-y-6">
        {renderMapOrList(true)}
        <InsightsPanel
          municipalityData={municipalities}
          selectedKPI={selectedKPI}
        />
      </div>

      {/* Desktop */}
      <div className="hidden lg:grid grid-cols-1 gap-6">
        <div className="grid grid-cols-2 gap-6">
          {renderMapOrList(false)}
          {viewMode === "map" ? (
            <MunicipalityRankedList
              municipalityData={municipalities}
              selectedKPI={selectedKPI}
              onMunicipalityClick={handleMunicipalityClick}
            />
          ) : null}
        </div>
        <InsightsPanel
          municipalityData={municipalities}
          selectedKPI={selectedKPI}
        />
      </div>
    </>
  );
}
