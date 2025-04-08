import { useState } from "react";
import { Map, List } from "lucide-react";

import { useMunicipalities } from "@/hooks/useMunicipalities";
import { MunicipalityList } from "@/components/municipalities/list/MunicipalityList";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
import { useScreenSize } from "@/hooks/useScreenSize";
import MunicipalityFilter from "@/components/municipalities/list/MunicipalityListFilter";
import DataSelector, {
  dataPoints,
} from "@/components/municipalities/rankedList/MunicipalityDataSelector";
import RankedList from "@/components/municipalities/rankedList/MunicipalityRankedList";
import InsightsPanel from "@/components/municipalities/rankedList/MunicipalityInsightsPanel";
import SwedenMap from "@/components/municipalities/SwedenMap";
import municipalityGeoJson from "@/data/municipalityGeo.json";

type SortOption = "meets_paris" | "name";

interface GeoJsonFeature {
  type: string;
  properties: {
    name: string;
    [key: string]: any;
  };
  geometry: any;
}

export function MunicipalitiesPage() {
  const { t } = useTranslation();
  const { municipalities, loading, error } = useMunicipalities();
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("meets_paris");
  const [sortDirection, setSortDirection] = useState<"best" | "worst">("best");
  const isMobile = useScreenSize();

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          {t("municipalitiesPage.errorTitle")}
        </h3>
        <p className="text-grey">{t("municipalitiesPage.errorDescription")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("municipalitiesPage.title")}
        description={t("municipalitiesPage.description")}
        className="-ml-4"
      />

      {/* <MunicipalityFilter
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        isMobile={isMobile}
      />

      <MunicipalityList
        municipalities={municipalities}
        selectedRegion={selectedRegion}
        searchQuery={searchQuery}
        sortBy={sortBy}
        sortDirection={sortDirection}
      /> */}

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 px-4 py-2 bg-black/40 text-white rounded-xl hover:bg-black/60 transition-colors"
        >
          {showMap ? (
            <>
              <List className="w-5 h-5" />
              <span>{t("municipalities.list.viewToggle.showList")}</span>
            </>
          ) : (
            <>
              <Map className="w-5 h-5" />
              <span>{t("municipalities.list.viewToggle.showMap")}</span>
            </>
          )}
        </button>
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
            <RankedList
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
