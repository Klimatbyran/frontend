import { useState } from "react";
import { Map, List } from "lucide-react";

import { useMunicipalities } from "@/hooks/useMunicipalities";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
import DataSelector, {
  dataPoints,
} from "@/components/municipalities/rankedList/MunicipalityDataSelector";
import MunicipalityRankedList from "@/components/municipalities/rankedList/MunicipalityRankedList";
import InsightsPanel from "@/components/municipalities/rankedList/MunicipalityInsightsPanel";
import SwedenMap from "@/components/municipalities/map/SwedenMap";
import municipalityGeoJson from "@/data/municipalityGeo.json";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";

export function MunicipalitiesRankedPage() {
  const { t } = useTranslation();
  const { municipalities, loading, error } = useMunicipalities();

  const [geoData] = useState<typeof municipalityGeoJson>(municipalityGeoJson);
  const [selectedDataPoint, setSelectedDataPoint] = useState(dataPoints[0]);
  const [showMap, setShowMap] = useState(true);

  const handleMunicipalityClick = (name: string) => {
    const formattedName = name.toLowerCase();
    window.location.href = `/municipalities/${formattedName}`;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-16">
        <div className="h-12 w-1/3 bg-black-1 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 gap-6">
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
    <div className="space-y-8">
      <PageHeader
        title={t("municipalitiesRankedPage.title")}
        description={t("municipalitiesRankedPage.description")}
        className="-ml-4"
      />

      <div className="flex">
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
        selectedDataPoint={selectedDataPoint}
        onDataPointChange={setSelectedDataPoint}
      />
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[2fr,1fr] gap-6 min-h-0">
        <div className="relative h-[60vh] lg:h-auto min-h-0">
          {showMap ? (
            <SwedenMap
              geoData={geoData}
              municipalityData={municipalities}
              selectedDataPoint={selectedDataPoint}
              onMunicipalityClick={handleMunicipalityClick}
            />
          ) : (
            <MunicipalityRankedList
              municipalityData={municipalities}
              selectedDataPoint={selectedDataPoint}
              onMunicipalityClick={handleMunicipalityClick}
            />
          )}
        </div>
        <div className="min-h-0 flex-1 lg:flex-none">
          <InsightsPanel
            municipalityData={municipalities}
            selectedDataPoint={selectedDataPoint}
          />
        </div>
      </div>
    </div>
  );
}
