import { useEffect, useId, useMemo, useState } from "react";
import { FeatureCollection } from "geojson";
import { MapContainer, GeoJSON, CircleMarker } from "react-leaflet";
import type L from "leaflet";
import { List, Map } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CardHeader } from "@/components/layout/CardHeader";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { EmissionSourcesRankedList } from "@/components/europe/EmissionSourcesRankedList";
import { MapInitialBoundsFitter } from "@/components/maps/MapInitialBoundsFitter";
import { MapZoomControls } from "@/components/maps/MapZoomControls";
import { MAP_FIT_BOUNDS_PADDING } from "@/components/maps/mapConstants";
import { calculateGeoBounds } from "@/components/maps/utils/geoBounds";
import { useMapZoom } from "@/components/maps/hooks/useMapZoom";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import { TERRITORY_PANEL_CLASS } from "@/hooks/territories/useTerritoryListLayout";
import { useLanguage } from "@/components/LanguageProvider";
import { useClimateTraceSectors } from "@/hooks/europe/useClimateTraceSectors";
import {
  getEmissionSourceMarkerRadius,
  RankedClimateTraceSource,
} from "@/lib/climateTraceSources";
import { formatEmissionsAbsoluteCompact } from "@/utils/formatting/localization";
import { cn } from "@/lib/utils";

import "leaflet/dist/leaflet.css";

type EmissionSourcesViewMode = "map" | "list";

const COUNTRY_OUTLINE_STYLE: L.PathOptions = {
  fillColor: "var(--black-2)",
  fillOpacity: 0.5,
  color: "var(--grey)",
  weight: 1,
};

interface CountryEmissionSourcesMapProps {
  countryGeoData: FeatureCollection;
  sources: RankedClimateTraceSource[];
  year: number;
  loading?: boolean;
  className?: string;
}

function EmissionSourceTooltip({
  source,
  totalSources,
  getSectorInfo,
}: {
  source: RankedClimateTraceSource;
  totalSources: number;
  getSectorInfo: ReturnType<typeof useClimateTraceSectors>["getSectorInfo"];
}) {
  const { t } = useTranslation();
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
        <p className="text-white/50 text-sm">
          {t("rankedList.rank", {
            rank: String(source.rank),
            total: String(totalSources),
          })}
        </p>
      </div>
    </div>
  );
}

function EmissionSourcesMapContent({
  countryGeoData,
  sources,
  hoveredSourceId,
  onHoverSource,
  getSectorInfo,
}: {
  countryGeoData: FeatureCollection;
  sources: RankedClimateTraceSource[];
  hoveredSourceId: number | null;
  onHoverSource: (sourceId: number | null) => void;
  getSectorInfo: ReturnType<typeof useClimateTraceSectors>["getSectorInfo"];
}) {
  const [isMounted, setIsMounted] = useState(false);
  const mapId = useId();

  const hoveredSource = useMemo(
    () => sources.find((source) => source.id === hoveredSourceId) ?? null,
    [hoveredSourceId, sources],
  );

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
      <div className="h-full w-full rounded-xl bg-black-3 animate-pulse" />
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
          backgroundColor: "var(--black-3)",
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
          const isHovered = hoveredSourceId === source.id;

          return (
            <CircleMarker
              key={source.id}
              center={[source.centroid.latitude, source.centroid.longitude]}
              radius={radius}
              pathOptions={{
                color: sectorInfo.color,
                fillColor: sectorInfo.color,
                fillOpacity: isHovered ? 1 : 0.85,
                weight: isHovered ? 2 : 1,
              }}
              eventHandlers={{
                mouseover: () => onHoverSource(source.id),
                mouseout: () => onHoverSource(null),
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
          totalSources={sources.length}
          getSectorInfo={getSectorInfo}
        />
      )}

      <MapZoomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        canZoomIn
        canZoomOut
        position="bottom-left"
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
  const [hoveredSourceId, setHoveredSourceId] = useState<number | null>(null);
  const [mobileViewMode, setMobileViewMode] =
    useState<EmissionSourcesViewMode>("map");

  const hasCountryGeometry = countryGeoData.features.length > 0;
  const showMapOnMobile = mobileViewMode === "map";
  const showListOnMobile = mobileViewMode === "list";

  useEffect(() => {
    if (showMapOnMobile) {
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    }
  }, [showMapOnMobile]);

  const viewToggle = (
    <ViewModeToggle
      viewMode={mobileViewMode}
      modes={["map", "list"]}
      onChange={setMobileViewMode}
      titles={{
        map: t("viewModeToggle.map"),
        list: t("viewModeToggle.list"),
      }}
      showTitles
      icons={{
        map: <Map className="w-4 h-4" />,
        list: <List className="w-4 h-4" />,
      }}
    />
  );

  return (
    <SectionWithHelp helpItems={[]} className="bg-black-3">
      <CardHeader
        title={t("europe.detailPage.emissionSources.title")}
        description={t("europe.detailPage.emissionSources.description", {
          count: sources.length,
          year,
        })}
      />

      <div className={cn("mt-8 md:hidden", className)}>{viewToggle}</div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-8 md:grid-cols-2 md:gap-6">
        <div
          className={cn(
            "relative min-w-0 overflow-hidden rounded-xl bg-black-3",
            TERRITORY_PANEL_CLASS,
            !showMapOnMobile && "hidden md:block",
          )}
        >
          {loading ? (
            <div className="h-full w-full rounded-xl bg-black-3 animate-pulse" />
          ) : !hasCountryGeometry ? (
            <div className="flex h-full items-center justify-center rounded-xl bg-black-3 px-6 text-center text-white/70">
              {t("europe.detailPage.emissionSources.noMapData")}
            </div>
          ) : (
            <EmissionSourcesMapContent
              countryGeoData={countryGeoData}
              sources={sources}
              hoveredSourceId={hoveredSourceId}
              onHoverSource={setHoveredSourceId}
              getSectorInfo={getSectorInfo}
            />
          )}
        </div>

        <div
          className={cn(
            "min-w-0",
            TERRITORY_PANEL_CLASS,
            !showListOnMobile && "hidden md:block",
          )}
        >
          <EmissionSourcesRankedList
            sources={sources}
            loading={loading}
            hoveredSourceId={hoveredSourceId}
            onHoverSource={setHoveredSourceId}
            className="h-full"
          />
        </div>
      </div>

      <p className="mt-4 text-sm text-white/50">
        {t("europe.detailPage.emissionSources.source")}
      </p>
    </SectionWithHelp>
  );
}
