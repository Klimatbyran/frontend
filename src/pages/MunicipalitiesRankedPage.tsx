import { useState, useEffect, useCallback } from "react";
import { Map, List } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
import DataSelector from "@/components/municipalities/rankedList/MunicipalityDataSelector";
import RankedList from "@/components/ranked/RankedList";
import InsightsPanel from "@/components/municipalities/rankedList/MunicipalityInsightsPanel";
import MapOfSweden from "@/components/maps/SwedenMap";
import municipalityGeoJson from "@/data/municipalityGeo.json";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import { useMunicipalityKPIs } from "@/hooks/municipalities/useMunicipalityKPIs";
import { FeatureCollection } from "geojson";
import { Municipality } from "@/types/municipality";
import { DataPoint } from "@/types/entity-rankings";

export function MunicipalitiesRankedPage() {
  const { t } = useTranslation();
  const { municipalities, loading, error } = useMunicipalities();
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

  const handleMunicipalityClick = (municipality: Municipality) => {
    const formattedName = municipality.name.toLowerCase();
    navigate(`/municipalities/${formattedName}?view=${viewMode}`);
  };

  // Create an adapter for MapOfSweden
  const handleMunicipalityNameClick = (name: string) => {
    const municipality = municipalities.find((m) => m.name === name);
    if (municipality) {
      handleMunicipalityClick(municipality);
    } else {
      window.location.href = `/municipalities/${name.toLowerCase()}?view=${viewMode}`;
    }
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

  const renderMapOrList = (isMobile: boolean) =>
    viewMode === "map" ? (
      <div className={isMobile ? "relative h-[65vh]" : "relative h-full"}>
        <MapOfSweden
          geoData={geoData as FeatureCollection}
          data={municipalities.map((m) => {
            const { sectorEmissions, ...rest } = m;
            return { ...rest, id: m.name };
          })}
          selectedAttribute={selectedKPI}
          onRegionClick={handleMunicipalityNameClick}
        />
      </div>
    ) : (
      <RankedList
        data={municipalities}
        selectedDataPoint={asDataPoint({
          label: selectedKPI.label,
          key: selectedKPI.key as keyof Municipality,
          unit: selectedKPI.unit,
          description: selectedKPI.description,
          higherIsBetter: selectedKPI.higherIsBetter,
          nullValues: selectedKPI.nullValues,
          formatter: (value: unknown) => {
            if (value === null) {
              return selectedKPI.nullValues || t("noData");
            }

            if (typeof value === "boolean") {
              return value
                ? t(
                    `municipalities.list.kpis.${selectedKPI.key}.booleanLabels.true`,
                  )
                : t(
                    `municipalities.list.kpis.${selectedKPI.key}.booleanLabels.false`,
                  );
            }

            return `${(value as number).toFixed(1)}${selectedKPI.unit}`;
          },
        })}
        onItemClick={handleMunicipalityClick}
        searchKey="name"
        searchPlaceholder={t("rankedList.search.placeholder")}
      />
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

      <DataSelector
        selectedKPI={selectedKPI}
        onDataPointChange={(kpi) => {
          setSelectedKPI(kpi);
          setKPIInURL(kpi.label);
        }}
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
          {viewMode === "map" ? (
            <RankedList
              data={municipalities}
              selectedDataPoint={asDataPoint({
                label: selectedKPI.label,
                key: selectedKPI.key as unknown as keyof Municipality,
                unit: selectedKPI.unit,
                description: selectedKPI.description,
                higherIsBetter: selectedKPI.higherIsBetter,
                nullValues: selectedKPI.nullValues,
                formatter: (value: unknown) => {
                  if (value === null) {
                    return selectedKPI.nullValues || t("noData");
                  }

                  if (typeof value === "boolean") {
                    return value
                      ? t(
                          `municipalities.list.kpis.${selectedKPI.key}.booleanLabels.true`,
                        )
                      : t(
                          `municipalities.list.kpis.${selectedKPI.key}.booleanLabels.false`,
                        );
                  }

                  return `${(value as number).toFixed(1)}${selectedKPI.unit}`;
                },
              })}
              onItemClick={handleMunicipalityClick}
              searchKey="name"
              searchPlaceholder={t("rankedList.search.placeholder")}
            />
          ) : null}
        </div>
        <InsightsPanel
          municipalityData={municipalities}
          selectedKPI={selectedKPI}
        />
      </div>
    </>
  );
}

const asDataPoint = (kpi: unknown): DataPoint<Municipality> =>
  kpi as DataPoint<Municipality>;
