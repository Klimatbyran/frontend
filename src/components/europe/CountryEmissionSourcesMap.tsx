import { useEffect, useId, useMemo, useState } from "react";
import { FeatureCollection } from "geojson";
import { MapContainer, GeoJSON, CircleMarker } from "react-leaflet";
import type L from "leaflet";
import { useTranslation } from "react-i18next";
import { CardHeader } from "@/components/layout/CardHeader";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { MapInitialBoundsFitter } from "@/components/maps/MapInitialBoundsFitter";
import { MapZoomControls } from "@/components/maps/MapZoomControls";
import { MAP_FIT_BOUNDS_PADDING } from "@/components/maps/mapConstants";
import { calculateGeoBounds } from "@/components/maps/utils/geoBounds";
import { useMapZoom } from "@/components/maps/hooks/useMapZoom";
import { TERRITORY_PANEL_CLASS } from "@/hooks/territories/useTerritoryListLayout";
import { useLanguage } from "@/components/LanguageProvider";
import { useClimateTraceSectors } from "@/hooks/europe/useClimateTraceSectors";
import {
  ClimateTraceSourceSummary,
  getEmissionSourceMarkerRadius,
} from "@/lib/climateTraceSources";
import { formatEmissionsAbsoluteCompact } from "@/utils/formatting/localization";
import { cn } from "@/lib/utils";

import "leaflet/dist/leaflet.css";

const COUNTRY_OUTLINE_STYLE: L.PathOptions = {
  fillColor: "var(--black-3)",
  fillOpacity: 0.35,
  color: "var(--grey)",
  weight: 1,
};

interface CountryEmissionSourcesMapProps {
  countryGeoData: FeatureCollection;
  sources: ClimateTraceSourceSummary[];
  year: number;
  loading?: boolean;
  className?: string;
}

function EmissionSourceTooltip({
  source,
  getSectorInfo,
}: {
  source: ClimateTraceSourceSummary;
  getSectorInfo: ReturnType<typeof useClimateTraceSectors>["getSectorInfo"];
}) {
  const { currentLanguage } = useLanguage();
  const sectorInfo = getSectorInfo(source.sector);

  return (
    <div className="absolute top-4 left-4 z-[500] max-w-sm bg-black/40 backdrop-blur-sm p-4 rounded-2xl pointer-events-none">
      <p className="text-white font-medium text-xl">{source.name}</p>
      <div className="space-y-1 mt-2">
        <p className="text-white/70">{sectorInfo.translatedName}</p>
        <p className="text-orange-2">
          {formatEmissionsAbsoluteCompact(
            Math.round(source.emissionsQuantity),
            currentLanguage,
          )}{" "}
          tCO₂e
        </p>
      </div>
    </div>
  );
}

function EmissionSourcesMapContent({
  countryGeoData,
  sources,
  getSectorInfo,
}: {
  countryGeoData: FeatureCollection;
  sources: ClimateTraceSourceSummary[];
  getSectorInfo: ReturnType<typeof useClimateTraceSectors>["getSectorInfo"];
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [hoveredSource, setHoveredSource] =
    useState<ClimateTraceSourceSummary | null>(null);
  const mapId = useId();

  const mapBounds = useMemo(
    () => calculateGeoBounds(countryGeoData, { padding: 0.08 }),
    [countryGeoData],
  );

  const defaultCenter = useMemo(
    (): [number, number] => [
      (mapBounds.getNorth() + mapBounds.getSouth()) / 2,
      (mapBounds.getEast() + mapBounds.getWest()) / 2,
    ],
    [mapBounds],
  );

  const maxEmissions = useMemo(
    () => Math.max(...sources.map((source) => source.emissionsQuantity), 0),
    [sources],
  );

  const {
    mapRef,
    handleZoomIn,
    handleZoomOut,
    handleReset,
    MIN_ZOOM,
    MAX_ZOOM,
  } = useMapZoom(defaultCenter, () => 5, {
    mapBounds,
    fitBounds: true,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-full w-full rounded-xl bg-black-1 animate-pulse" />
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        key={mapId}
        center={defaultCenter}
        zoom={5}
        style={{
          height: "100%",
          width: "100%",
          backgroundColor: "var(--black-2)",
          zIndex: 0,
        }}
        zoomControl={false}
        attributionControl={false}
        maxBounds={mapBounds}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        scrollWheelZoom={false}
        ref={(instance) => {
          mapRef.current = instance;
        }}
        className="rounded-xl"
      >
        <GeoJSON data={countryGeoData} style={() => COUNTRY_OUTLINE_STYLE} />
        {sources.map((source) => {
          const sectorInfo = getSectorInfo(source.sector);
          const radius = getEmissionSourceMarkerRadius(
            source.emissionsQuantity,
            maxEmissions,
          );

          return (
            <CircleMarker
              key={source.id}
              center={[source.centroid.latitude, source.centroid.longitude]}
              radius={radius}
              pathOptions={{
                color: sectorInfo.color,
                fillColor: sectorInfo.color,
                fillOpacity: 0.85,
                weight: 1,
              }}
              eventHandlers={{
                mouseover: () => setHoveredSource(source),
                mouseout: () => setHoveredSource(null),
              }}
            />
          );
        })}
        <MapInitialBoundsFitter
          bounds={mapBounds}
          padding={MAP_FIT_BOUNDS_PADDING}
        />
      </MapContainer>

      {hoveredSource && (
        <EmissionSourceTooltip
          source={hoveredSource}
          getSectorInfo={getSectorInfo}
        />
      )}

      <MapZoomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        canZoomIn
        canZoomOut
        legendPosition="bottom-left"
      />
    </div>
  );
}

export function CountryEmissionSourcesMap({
  countryGeoData,
  sources,
  year,
  loading = false,
  className,
}: CountryEmissionSourcesMapProps) {
  const { t } = useTranslation();
  const { getSectorInfo } = useClimateTraceSectors();

  const hasCountryGeometry = countryGeoData.features.length > 0;

  return (
    <SectionWithHelp helpItems={[]}>
      <CardHeader
        title={t("europe.detailPage.emissionSources.title")}
        description={t("europe.detailPage.emissionSources.description", {
          count: sources.length,
          year,
        })}
      />
      <div className={cn("relative mt-8", TERRITORY_PANEL_CLASS, className)}>
        {loading ? (
          <div className="h-full w-full rounded-xl bg-black-1 animate-pulse" />
        ) : !hasCountryGeometry ? (
          <div className="flex h-full items-center justify-center rounded-xl bg-black-1 px-6 text-center text-white/70">
            {t("europe.detailPage.emissionSources.noMapData")}
          </div>
        ) : (
          <EmissionSourcesMapContent
            countryGeoData={countryGeoData}
            sources={sources}
            getSectorInfo={getSectorInfo}
          />
        )}
      </div>
      <p className="mt-4 text-sm text-white/50">
        {t("europe.detailPage.emissionSources.source")}
      </p>
    </SectionWithHelp>
  );
}
