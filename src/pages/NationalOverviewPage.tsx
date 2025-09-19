import { useState } from "react";

import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
import SwedenMap from "@/components/municipalities/map/SwedenMap";
import regionGeoJson from "@/data/regionGeo.json";
import { FeatureCollection } from "geojson";
import { isMobile } from "react-device-detect";

export function NationalOverviewPage() {
  const { t } = useTranslation();
  const [geoData] = useState(regionGeoJson);

  return (
    <>
      <PageHeader
        title={t("municipalitiesRankedPage.title")}
        description={t("municipalitiesRankedPage.description")}
        className="-ml-4"
      />
      <div className={isMobile ? "relative h-[65vh]" : "relative h-full"}>
        <SwedenMap
          geoData={geoData as FeatureCollection}
          data={municipalities.map((m) => ({ ...m, id: m.name }))}
          selectedAttribute={{ key: "name", label: "Name", unit: "" }}
          onRegionClick={handleMunicipalityClick}
        />
      </div>
    </>
  );
}
