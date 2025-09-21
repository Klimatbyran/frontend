import { useState } from "react";

import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
import SwedenMap from "@/components/municipalities/map/SwedenMap";
import regionGeoJson from "@/data/regionGeo.json";
import { FeatureCollection } from "geojson";
import { isMobile } from "react-device-detect";
import { useRegionalData } from "@/hooks/useRegionalData";

export function RegionalRankedPage() {
  const { t } = useTranslation();
  const [geoData] = useState(regionGeoJson);

  const regionalData = useRegionalData();

  const handleRegionalClick = () => {};

  return (
    <>
      <PageHeader
        title={t("regionalRankedPage.title")}
        description={t("regionalRankedPage.description")}
        className="-ml-4"
      />
      <div
        className={
          isMobile
            ? "relative h-[65vh]"
            : "relative h-[700px] w-full flex justify-center"
        }
      >
        <SwedenMap
          geoData={geoData as FeatureCollection}
          data={regionalData.getRegions().map((name) => {
            const emissions = regionalData.getTotalEmissions(name);
            const latestYear =
              emissions.length > 0 ? emissions[emissions.length - 1] : null;
            return {
              name: name, // Names are already in the correct format
              id: name,
              emissions: latestYear?.emissions || 0,
            };
          })}
          selectedAttribute={{
            key: "emissions",
            label: "Emissions",
            unit: "ton",
          }}
          onRegionClick={handleRegionalClick}
          defaultCenter={[63, 16]}
          defaultZoom={isMobile ? 4 : 5}
        />
      </div>
    </>
  );
}
