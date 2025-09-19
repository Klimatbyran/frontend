import { useState } from "react";
import { Map, List } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
import SwedenMap from "@/components/municipalities/map/SwedenMap";
import municipalityGeoJson from "@/data/municipalityGeo.json";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import { FeatureCollection } from "geojson";

export function NationalOverviewPage() {
  const { t } = useTranslation();
  const [geoData] = useState(municipalityGeoJson);

  const location = useLocation();
  const navigate = useNavigate();

  const getViewModeFromURL = () => {
    const params = new URLSearchParams(location.search);
    return params.get("view") === "list" ? "list" : "map";
  };
  const setViewModeInURL = (mode: "map" | "list") => {
    const params = new URLSearchParams(location.search);
    params.set("view", mode);
    navigate({ search: params.toString() }, { replace: true });
  };

  const viewMode = getViewModeFromURL();

  const renderMapOrList = (isMobile: boolean) =>
    viewMode === "map" ? (
      <div className={isMobile ? "relative h-[65vh]" : "relative h-full"}>
        <GeographicMap
          geoData={geoData as FeatureCollection}
          data={municipalities.map((m) => ({ ...m, id: m.name }))}
          selectedAttribute={selectedKPI}
          onRegionClick={handleMunicipalityClick}
        />
      </div>
    ) : (
      <div>List</div>
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
      {renderMapOrList(true)}
    </>
  );
}
