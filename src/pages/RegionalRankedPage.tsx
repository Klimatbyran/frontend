import { useCallback, useEffect, useMemo, useState } from "react";
import { Map, List } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
import SwedenMap, { DataItem } from "@/components/maps/SwedenMap";
import regionGeoJson from "@/data/regionGeo.json";
import { FeatureCollection } from "geojson";
import { useRegionalKPIs, useRegions } from "@/hooks/useRegions";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import RankedList from "@/components/ranked/RankedList";
import { DataPoint } from "@/types/entity-rankings";
import RegionalInsightsPanel from "@/components/regions/RegionalInsightsPanel";
import { Region } from "@/types/region";
import { KPIDataSelector } from "@/components/ranked/KPIDataSelector";

export function RegionalRankedPage() {
  const { t } = useTranslation();
  const regionalKPIs = useRegionalKPIs();
  const [geoData] = useState(regionGeoJson);
  const { regions: regionNames, regionsData } = useRegions();

  const location = useLocation();
  const navigate = useNavigate();

  const getKPIFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const kpiKey = params.get("kpi");

    return (
      regionalKPIs.find((kpi) => String(kpi.key) === kpiKey) || regionalKPIs[0]
    );
  }, [location.search, regionalKPIs]);

  const setKPIInURL = (kpiKey: string) => {
    const params = new URLSearchParams(location.search);
    params.set("kpi", kpiKey);
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
    if (kpiFromUrl && kpiFromUrl.key !== selectedKPI.key) {
      setSelectedKPI(kpiFromUrl);
    }
  }, [getKPIFromURL, selectedKPI.key]);

  // Calculate regions data without calling hooks in map
  const regions: DataItem[] = useMemo(() => {
    return regionNames.map((name) => {
      const regionData = regionsData.find((r) => r.name === name);

      if (!regionData || !regionData.emissions) {
        return {
          name,
          id: name,
          emissions: null,
          historicalEmissionChangePercent: null,
          meetsParis: null,
          emissionsGapToParis: null,
        };
      }

      const years = Object.keys(regionData.emissions)
        .filter((key) => !isNaN(Number(key)))
        .map((year) => Number(year))
        .sort((a, b) => a - b);

      const latestYear = years[years.length - 1];
      const latestYearData =
        latestYear !== undefined
          ? regionData.emissions[latestYear.toString()]
          : null;

      const totalTrend =
        typeof regionData.totalTrend === "number"
          ? regionData.totalTrend
          : null;
      const totalCarbonLaw =
        typeof regionData.totalCarbonLaw === "number"
          ? regionData.totalCarbonLaw
          : null;

      const emissionsGapToParis =
        totalTrend !== null && totalCarbonLaw !== null
          ? (totalTrend - totalCarbonLaw) / 1000
          : null;

      return {
        name,
        id: name,
        emissions:
          typeof latestYearData === "number" ? latestYearData / 1000 : null,
        historicalEmissionChangePercent:
          typeof regionData.historicalEmissionChangePercent === "number"
            ? regionData.historicalEmissionChangePercent
            : null,
        meetsParis:
          typeof regionData.meetsParis === "boolean"
            ? regionData.meetsParis
            : null,
        emissionsGapToParis,
      };
    });
  }, [regionNames, regionsData]);

  const regionsAsEntities = useMemo<Region[]>(() => {
    return regions.map((region) => ({
      id: String(region.id),
      name: String(region.name),
      emissions: typeof region.emissions === "number" ? region.emissions : null,
      historicalEmissionChangePercent:
        typeof region.historicalEmissionChangePercent === "number"
          ? region.historicalEmissionChangePercent
          : null,
      meetsParis:
        typeof region.meetsParis === "boolean" ? region.meetsParis : null,
      emissionsGapToParis:
        typeof region.emissionsGapToParis === "number"
          ? region.emissionsGapToParis
          : null,
    }));
  }, [regions]);

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
          nullValues: selectedKPI.nullValues,
          isBoolean: selectedKPI.isBoolean,
          booleanLabels: selectedKPI.booleanLabels,
          formatter: (value: unknown) => {
            if (value === null || value === undefined) {
              return selectedKPI.nullValues
                ? t(selectedKPI.nullValues)
                : t("noData");
            }

            if (typeof value === "boolean") {
              return value
                ? t(
                    `regions.list.kpis.${String(selectedKPI.key)}.booleanLabels.true`,
                  )
                : t(
                    `regions.list.kpis.${String(selectedKPI.key)}.booleanLabels.false`,
                  );
            }

            if (typeof value === "number") {
              return value.toFixed(1);
            }

            return String(value);
          },
        })}
        onItemClick={() => {}}
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

      <KPIDataSelector
        selectedKPI={selectedKPI}
        onKPIChange={(kpi) => {
          setSelectedKPI(kpi);
          setKPIInURL(String(kpi.key));
        }}
        kpis={regionalKPIs}
        translationPrefix="regions.list"
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
          regionData={regionsAsEntities}
          selectedKPI={selectedKPI}
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
                nullValues: selectedKPI.nullValues,
                isBoolean: selectedKPI.isBoolean,
                booleanLabels: selectedKPI.booleanLabels,
                formatter: (value: unknown) => {
                  if (value === null || value === undefined) {
                    return selectedKPI.nullValues
                      ? t(selectedKPI.nullValues)
                      : t("noData");
                  }

                  if (typeof value === "boolean") {
                    return value
                      ? t(
                          `regions.list.kpis.${String(selectedKPI.key)}.booleanLabels.true`,
                        )
                      : t(
                          `regions.list.kpis.${String(selectedKPI.key)}.booleanLabels.false`,
                        );
                  }

                  if (typeof value === "number") {
                    return value.toFixed(1);
                  }

                  return String(value);
                },
              })}
              onItemClick={() => {}}
              searchKey="name"
              searchPlaceholder={t("rankedList.search.placeholder")}
            />
          ) : null}
        </div>
        <RegionalInsightsPanel
          regionData={regionsAsEntities}
          selectedKPI={selectedKPI}
        />
      </div>
    </>
  );
}
