import { useState } from "react";
import { Map, List } from "lucide-react";

import { useMunicipalities } from "@/hooks/useMunicipalities";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
import DataSelector from "@/components/municipalities/rankedList/MunicipalityDataSelector";
import MunicipalityRankedList from "@/components/municipalities/rankedList/MunicipalityRankedList";
import InsightsPanel from "@/components/municipalities/rankedList/MunicipalityInsightsPanel";
import SwedenMap from "@/components/municipalities/map/SwedenMap";
import municipalityGeoJson from "@/data/municipalityGeo.json";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import { useMunicipalityKPIs } from "@/hooks/useMunicipalityKPIs";
import { FeatureCollection } from "geojson";

export function MunicipalitiesRankedPage() {
  const { t } = useTranslation();
  const { municipalities, loading, error } = useMunicipalities();
  const municipalityKPIs = useMunicipalityKPIs();

  const [geoData] = useState<typeof municipalityGeoJson>(municipalityGeoJson);
  const [selectedKPI, setSelectedKPI] = useState(municipalityKPIs[0]);
  const [showMap, setShowMap] = useState(true);

  const handleMunicipalityClick = (name: string) => {
    const formattedName = name.toLowerCase();
    window.location.href = `/municipalities/${formattedName}`;
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

  return (
    <>
      <PageHeader
        title={t("municipalitiesRankedPage.title")}
        description={t("municipalitiesRankedPage.description")}
        className="-ml-4"
      />

      <div className="flex lg:hidden">
        <ViewModeToggle
          viewMode={showMap ? "map" : "list"}
          modes={["map", "list"]}
          onChange={(mode) => setShowMap(mode === "map")}
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
        onDataPointChange={setSelectedKPI}
      />

      <div className="lg:hidden space-y-6">
        {showMap ? (
          <div className="relative h-[65vh]">
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
        )}
        <InsightsPanel
          municipalityData={municipalities}
          selectedKPI={selectedKPI}
        />
      </div>

      <div className="hidden lg:grid grid-cols-1 gap-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="relative h-full">
            <SwedenMap
              geoData={geoData as FeatureCollection}
              municipalityData={municipalities}
              selectedKPI={selectedKPI}
              onMunicipalityClick={handleMunicipalityClick}
            />
          </div>
          <MunicipalityRankedList
            municipalityData={municipalities}
            selectedKPI={selectedKPI}
            onMunicipalityClick={handleMunicipalityClick}
          />
        </div>
        <InsightsPanel
          municipalityData={municipalities}
          selectedKPI={selectedKPI}
        />
      </div>
    </>
  );
}
