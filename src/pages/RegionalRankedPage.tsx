import { useState } from "react";
import { Map, List } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
import SwedenMap, { DataItem } from "@/components/municipalities/map/SwedenMap";
import regionGeoJson from "@/data/regionGeo.json";
import { FeatureCollection } from "geojson";
import { useRegionalData } from "@/hooks/useRegionalData";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import RankedList from "@/components/RankedList";
import { DataPoint } from "@/types/lists";

export function RegionalRankedPage() {
  const { t } = useTranslation();
  const [geoData] = useState(regionGeoJson);
  const regionalData = useRegionalData();

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
  const selectedKPI = {
    key: "emissions",
    label: "Total Emissions",
    unit: "ton",
    description: "Total emissions for the region",
    higherIsBetter: false,
  };

  const regions: DataItem[] = regionalData.getRegions().map((name) => {
    const emissions = regionalData.getTotalEmissions(name);
    const latestYear =
      emissions.length > 0 ? emissions[emissions.length - 1] : null;
    return {
      name: name,
      id: name,
      emissions: latestYear?.emissions || 0,
    };
  });

  const handleRegionalClick = (region: DataItem) => {
    const formattedName = region.name.toLowerCase();
    window.location.href = `/regions/${formattedName}?view=${viewMode}`;
  };

  const handleRegionNameClick = (name: string) => {
    const region = regions.find((r) => r.name === name);
    // if (region) {
    //   handleRegionalClick(region);
    // } else {
    //   window.location.href = `/regions/${name.toLowerCase()}?view=${viewMode}`;
    // }
  };

  const asDataPoint = (kpi: unknown): DataPoint<DataItem> =>
    kpi as DataPoint<DataItem>;

  const renderMapOrList = (isMobile: boolean) =>
    viewMode === "map" ? (
      <div className={isMobile ? "relative h-[65vh]" : "relative h-full"}>
        <SwedenMap
          geoData={geoData as FeatureCollection}
          data={regions}
          selectedAttribute={selectedKPI}
          onRegionClick={handleRegionNameClick}
          defaultCenter={[63, 16]}
          defaultZoom={isMobile ? 4 : 5}
        />
      </div>
    ) : (
      <RankedList
        data={regions}
        selectedDataPoint={asDataPoint({
          label: selectedKPI.label,
          key: selectedKPI.key as keyof DataItem,
          unit: selectedKPI.unit,
          description: selectedKPI.description,
          higherIsBetter: selectedKPI.higherIsBetter,
          formatter: (value: unknown) => {
            if (value === null) {
              return "N/A";
            }
            return `${(value as number).toFixed(1)}${selectedKPI.unit}`;
          },
        })}
        onItemClick={handleRegionalClick}
        searchKey="name"
        searchPlaceholder={t(
          "regions.list.rankedList.search.placeholder",
          "Search regions...",
        )}
      />
    );

  return (
    <>
      <PageHeader
        title={t("regionalRankedPage.title")}
        description={t("regionalRankedPage.description")}
        className="-ml-4"
      />

      <div className="flex mb-4 lg:hidden">
        <ViewModeToggle
          viewMode={viewMode}
          modes={["map", "list"]}
          onChange={(mode) => setViewModeInURL(mode)}
          titles={{
            map: t("regions.list.viewToggle.showMap", "Show Map"),
            list: t("regions.list.viewToggle.showList", "Show List"),
          }}
          showTitles={true}
          icons={{
            map: <Map className="w-4 h-4" />,
            list: <List className="w-4 h-4" />,
          }}
        />
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-6">{renderMapOrList(true)}</div>

      {/* Desktop View */}
      <div className="hidden lg:grid grid-cols-1 gap-6">
        <div className="grid grid-cols-2 gap-6">
          {renderMapOrList(false)}
          {viewMode === "map" ? (
            <RankedList
              data={regions}
              selectedDataPoint={asDataPoint({
                label: selectedKPI.label,
                key: selectedKPI.key as keyof DataItem,
                unit: selectedKPI.unit,
                description: selectedKPI.description,
                higherIsBetter: selectedKPI.higherIsBetter,
                formatter: (value: unknown) => {
                  if (value === null) {
                    return "N/A";
                  }
                  return `${(value as number).toFixed(1)}${selectedKPI.unit}`;
                },
              })}
              onItemClick={handleRegionalClick}
              searchKey="name"
              searchPlaceholder={t(
                "regions.list.rankedList.search.placeholder",
                "Search regions...",
              )}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
