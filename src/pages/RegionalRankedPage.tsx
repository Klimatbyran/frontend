import { useState, useMemo } from "react";
import { Map, List } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
import SwedenMap, { DataItem } from "@/components/maps/SwedenMap";
import regionGeoJson from "@/data/regionGeo.json";
import { FeatureCollection } from "geojson";
import { getRegionalKPIs, useRegions } from "@/hooks/useRegions";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import RankedList from "@/components/ranked/RankedList";
import { DataPoint } from "@/types/entity-rankings";
import RegionalInsightsPanel from "@/components/regions/RegionalInsightsPanel";
import { Region } from "@/types/region";
import { KPIValue } from "@/types/entity-rankings";

export function RegionalRankedPage() {
  const { t } = useTranslation();
  const [geoData] = useState(regionGeoJson);
  const { regions: regionNames, regionsData } = useRegions();
  const selectedKPI = getRegionalKPIs()[0];

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

  // Calculate regions data without calling hooks in map
  const regions: DataItem[] = useMemo(() => {
    return regionNames.map((name) => {
      const regionData = regionsData.find((r) => r.name === name);
      if (!regionData || !regionData.emissions) {
        return {
          name: name,
          id: name,
          emissions: 0,
        };
      }

      // Get the latest year's emissions
      const years = Object.keys(regionData.emissions)
        .filter((key) => !isNaN(Number(key)))
        .map((year) => Number(year))
        .sort((a, b) => a - b);

      const latestYear = years[years.length - 1];
      const latestYearData = regionData.emissions[latestYear?.toString()];

      return {
        name: name,
        id: name,
        emissions: latestYearData / 1000 || 0,
      };
    });
  }, [regionNames, regionsData]);

  const handleRegionClick = (region: DataItem) => {
    const formattedName = region.name.toLowerCase();
    navigate(`/regions/${formattedName}?view=${viewMode}`);
  };

  const asDataPoint = (kpi: unknown): DataPoint<DataItem> =>
    kpi as DataPoint<DataItem>;

  const renderMapOrList = (isMobile: boolean) =>
    viewMode === "map" ? (
      <div className={isMobile ? "relative h-[65vh]" : "relative h-full"}>
        <SwedenMap
          geoData={geoData as FeatureCollection}
          data={regions}
          selectedKPI={selectedKPI}
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
              return t("noData");
            }
            return `${(value as number).toFixed(1)}`;
          },
        })}
        onItemClick={handleRegionClick}
        searchKey="name"
        searchPlaceholder={t("rankedList.search.placeholder")}
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
            map: t("viewModeToggle.map"),
            list: t("viewModeToggle.list"),
          }}
          showTitles={true}
          icons={{
            map: <Map className="w-4 h-4" />,
            list: <List className="w-4 h-4" />,
          }}
        />
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-6">
        {renderMapOrList(true)}
        <RegionalInsightsPanel
          regionData={regions as unknown as Region[]}
          selectedKPI={selectedKPI as unknown as KPIValue}
        />
      </div>

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
                    return t("noData");
                  }
                  return `${(value as number).toFixed(1)}`;
                },
              })}
              onItemClick={handleRegionClick}
              searchKey="name"
              searchPlaceholder={t("rankedList.search.placeholder")}
            />
          ) : null}
        </div>
        <RegionalInsightsPanel
          regionData={regions as unknown as Region[]}
          selectedKPI={selectedKPI as unknown as KPIValue}
        />
      </div>
    </>
  );
}
