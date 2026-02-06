import { useState, useEffect, useCallback, useMemo } from "react";
import { Map, List } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FeatureCollection } from "geojson";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPIDataSelector } from "@/components/ranked/KPIDataSelector";
import InsightsPanel from "@/components/municipalities/rankedList/MunicipalityInsightsPanel";
import MapOfSweden from "@/components/maps/SwedenMap";
import municipalityGeoJson from "@/data/municipalityGeo.json";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import { useMunicipalityKPIs } from "@/hooks/municipalities/useMunicipalityKPIs";
import { RankedListItem } from "@/types/rankings";
import { createEntityClickHandler } from "@/utils/routing";
import { MunicipalityRankedList } from "@/components/municipalities/MunicipalityRankedList";

export function MunicipalitiesTopListsPage() {
  const { t } = useTranslation();
  const { municipalities, municipalitiesLoading, municipalitiesError } =
    useMunicipalities();
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

  const handleMunicipalityClick = createEntityClickHandler(
    navigate,
    "municipality",
    viewMode,
  );

  // Create an adapter for MapOfSweden
  const handleMunicipalityAreaClick = (name: string) => {
    const municipality = municipalities.find((m) => m.name === name);
    if (municipality) {
      handleMunicipalityClick(municipality);
    } else {
      handleMunicipalityClick(name);
    }
  };

  // Transform municipalities to RankedListItem format
  const municipalityEntities: RankedListItem[] = useMemo(() => {
    return municipalities.map((municipality) => {
      const { sectorEmissions, ...rest } = municipality;
      return {
        ...rest,
        id: municipality.name,
        displayName: municipality.name,
        mapName: municipality.name,
      };
    });
  }, [municipalities]);

  if (municipalitiesLoading) {
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

  if (municipalitiesError) {
    return (
      <div className="text-center py-24">
        <h3 className="text-red-500 mb-4 text-xl">
          {t("municipalitiesRankedPage.errorTitle")}
        </h3>
        <p className="text-grey">
          {t("municipalitiesRankedPage.errorDescription")}
        </p>
      </div>
    );
  }

  const municipalityRankedList = (
    <MunicipalityRankedList
      municipalityEntities={municipalityEntities}
      selectedKPI={selectedKPI}
      onItemClick={handleMunicipalityClick}
    />
  );

  const renderMapOrList = (isMobile: boolean) =>
    viewMode === "map" ? (
      <div className={isMobile ? "relative h-[65vh]" : "relative h-full"}>
        <MapOfSweden
          entityType="municipalities"
          geoData={geoData as FeatureCollection}
          data={municipalities.map((m) => {
            const { sectorEmissions, ...rest } = m;
            return { ...rest, id: m.name };
          })}
          selectedKPI={selectedKPI}
          onAreaClick={handleMunicipalityAreaClick}
        />
      </div>
    ) : (
      municipalityRankedList
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
          showTitles
          icons={{
            map: <Map className="w-4 h-4" />,
            list: <List className="w-4 h-4" />,
          }}
        />
      </div>

      <KPIDataSelector
        selectedKPI={selectedKPI}
        onKPIChange={(kpi) => {
          setSelectedKPI(kpi);
          setKPIInURL(kpi.label);
        }}
        kpis={municipalityKPIs}
        translationPrefix="municipalities.list"
      />

      {/* Mobile Insights */}
      <div className="lg:hidden space-y-6">
        {renderMapOrList(true)}
        <InsightsPanel
          municipalityData={municipalities}
          selectedKPI={selectedKPI}
        />
      </div>

      {/* Desktop Insights */}
      <div className="hidden lg:grid grid-cols-1 gap-6">
        <div className="grid grid-cols-2 gap-6">
          {renderMapOrList(false)}
          {viewMode === "map" ? municipalityRankedList : null}
        </div>
        <InsightsPanel
          municipalityData={municipalities}
          selectedKPI={selectedKPI}
        />
      </div>
    </>
  );
}
