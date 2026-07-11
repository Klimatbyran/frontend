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
import { useLanguage } from "@/components/LanguageProvider";
import { useClimateTraceSectors } from "@/hooks/europe/useClimateTraceSectors";
import {
  CLIMATE_TRACE_SOURCES_LIMIT,
  getEmissionSourceMarkerRadius,
  RankedClimateTraceSource,
} from "@/lib/climateTraceSources";
import { formatEmissionsAbsoluteCompact } from "@/utils/formatting/localization";
import { cn } from "@/lib/utils";

import "leaflet/dist/leaflet.css";

type EmissionSourcesViewMode = "map" | "list";

const EMISSION_SOURCES_MAP_CLASS =
  "h-[min(34rem,58vh)] min-h-[20rem] md:h-[min(48rem,75vh)] md:min-h-[30rem]";

const EMISSION_SOURCES_PANEL_CLASS =
  "h-[min(32rem,55vh)] min-h-[20rem] md:h-[min(42rem,70vh)] md:min-h-[28rem]";

const COUNTRY_OUTLINE_STYLE: L.PathOptions = {
  fillColor: "var(--black-1)",
  fillOpacity: 0.6,
  color: "var(--grey)",
  weight: 1,
};

const REGION_OUTLINE_STYLE: L.PathOptions = {
  fillColor: "var(--black-1)",
  fillOpacity: 0.6,
  color: "var(--grey)",
  weight: 0.75,
};

const REGION_HOVER_STYLE: L.PathOptions = {
  fillColor: "var(--white)",
  fillOpacity: 0.12,
  color: "var(--white)",
  weight: 1.25,
};

const INTERACTIVE_REGION_CLASS = "cursor-pointer";

interface CountryEmissionSourcesMapProps {
  countryGeoData: FeatureCollection;
  sources: RankedClimateTraceSource[];
  year: number;
  loading?: boolean;
  className?: string;
  /**
   * Optional sub-national boundaries (e.g. regions/counties) drawn as the base
   * layer instead of the plain country outline, with point sources overlaid.
   */
  regionsGeoData?: FeatureCollection;
  /**
   * Called with the clicked region's map name when a region boundary is
   * selected. Enables hover highlighting and navigation on the region layer.
   */
  onRegionSelect?: (regionMapName: string) => void;
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
    <div className="pointer-events-none absolute top-4 left-4 z-[500] max-w-[15rem] rounded-2xl border border-white/10 bg-black-1/80 p-4 shadow-xl ring-1 ring-white/5 backdrop-blur-md sm:max-w-sm">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: sectorInfo.color }}
        />
        <p className="truncate text-xs font-medium uppercase tracking-wide text-white/60">
          {sectorInfo.translatedName}
        </p>
      </div>
      <p className="mt-1.5 text-lg font-semibold leading-tight text-white">
        {source.name}
      </p>
      <p
        className="mt-2 text-2xl font-bold"
        style={{ color: sectorInfo.color }}
      >
        {formatEmissionsAbsoluteCompact(
          Math.round(source.emissionsQuantity),
          currentLanguage,
        )}{" "}
        <span className="text-sm font-medium text-white/50">tCO₂e</span>
      </p>
      <p className="mt-1 text-xs text-white/50">
        {t("rankedList.rank", {
          rank: String(source.rank),
          total: String(totalSources),
        })}
      </p>
    </div>
  );
}

function SectorLegend({
  sectors,
}: {
  sectors: { name: string; color: string }[];
}) {
  const { t } = useTranslation();

  if (sectors.length === 0) return null;

  return (
    <div className="pointer-events-none absolute top-4 right-4 z-[500] max-w-[55%] rounded-2xl border border-white/10 bg-black-1/70 p-3 shadow-lg ring-1 ring-white/5 backdrop-blur-md">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/50">
        {t("europe.detailPage.emissionSources.legendTitle")}
      </p>
      <ul className="flex flex-col gap-1.5">
        {sectors.map((sector) => (
          <li key={sector.name} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: sector.color }}
            />
            <span className="truncate text-xs text-white/80">
              {sector.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmissionSourcesMapContent({
  countryGeoData,
  regionsGeoData,
  sources,
  hoveredSourceId,
  onHoverSource,
  onRegionSelect,
  getSectorInfo,
}: {
  countryGeoData: FeatureCollection;
  regionsGeoData?: FeatureCollection;
  sources: RankedClimateTraceSource[];
  hoveredSourceId: number | null;
  onHoverSource: (sourceId: number | null) => void;
  onRegionSelect?: (regionMapName: string) => void;
  getSectorInfo: ReturnType<typeof useClimateTraceSectors>["getSectorInfo"];
}) {
  const [isMounted, setIsMounted] = useState(false);
  const mapId = useId();

  const hoveredSource = useMemo(
    () => sources.find((source) => source.id === hoveredSourceId) ?? null,
    [hoveredSourceId, sources],
  );

  const baseGeoData = regionsGeoData ?? countryGeoData;

  const mapBounds = useMemo(
    () => calculateGeoBounds(baseGeoData, { padding: 0.08 }),
    [baseGeoData],
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

  const legendSectors = useMemo(() => {
    const seen = new Set<string>();
    const result: { name: string; color: string }[] = [];
    for (const source of sources) {
      if (seen.has(source.sector)) continue;
      seen.add(source.sector);
      const info = getSectorInfo(source.sector);
      result.push({ name: info.translatedName, color: info.color });
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [sources, getSectorInfo]);

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
      <div className="h-full w-full rounded-xl bg-black-2 animate-pulse" />
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
        {regionsGeoData ? (
          <GeoJSON
            data={regionsGeoData}
            style={() =>
              onRegionSelect
                ? {
                    ...REGION_OUTLINE_STYLE,
                    className: INTERACTIVE_REGION_CLASS,
                  }
                : REGION_OUTLINE_STYLE
            }
            onEachFeature={(feature, layer) => {
              if (!onRegionSelect) return;
              const path = layer as L.Path;
              const regionName = feature?.properties?.name;
              layer.on({
                mouseover: () => path.setStyle(REGION_HOVER_STYLE),
                mouseout: () =>
                  path.setStyle({
                    ...REGION_OUTLINE_STYLE,
                    className: INTERACTIVE_REGION_CLASS,
                  }),
                click: () => {
                  if (regionName) onRegionSelect(String(regionName));
                },
              });
            }}
          />
        ) : (
          <GeoJSON data={countryGeoData} style={() => COUNTRY_OUTLINE_STYLE} />
        )}
        {sources.map((source) => {
          const sectorInfo = getSectorInfo(source.sector);
          const baseRadius = getEmissionSourceMarkerRadius(
            source.emissionsQuantity,
            maxEmissions,
          );
          const isHovered = hoveredSourceId === source.id;
          const radius = isHovered ? baseRadius + 3 : baseRadius;

          return (
            <CircleMarker
              key={source.id}
              center={[source.centroid.latitude, source.centroid.longitude]}
              radius={radius}
              pathOptions={{
                color: isHovered ? "var(--white)" : sectorInfo.color,
                fillColor: sectorInfo.color,
                fillOpacity: isHovered ? 0.95 : 0.75,
                opacity: isHovered ? 1 : 0.9,
                weight: isHovered ? 2.5 : 1,
              }}
              eventHandlers={{
                mouseover: (event) => {
                  (event.target as L.Path).bringToFront?.();
                  onHoverSource(source.id);
                },
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

      {hoveredSource ? (
        <EmissionSourceTooltip
          source={hoveredSource}
          totalSources={sources.length}
          getSectorInfo={getSectorInfo}
        />
      ) : (
        <SectorLegend sectors={legendSectors} />
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
  regionsGeoData,
  onRegionSelect,
}: CountryEmissionSourcesMapProps) {
  const { t } = useTranslation();
  const { getSectorInfo } = useClimateTraceSectors();
  const [hoveredSourceId, setHoveredSourceId] = useState<number | null>(null);
  const [mobileViewMode, setMobileViewMode] =
    useState<EmissionSourcesViewMode>("map");

  const hasCountryGeometry =
    (regionsGeoData?.features.length ?? 0) > 0 ||
    countryGeoData.features.length > 0;
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

  const cardHeader = (
    <CardHeader
      className="[&>div]:mb-2 [&>div]:@lg:mb-2"
      title={t("europe.detailPage.emissionSources.title")}
      description={t("europe.detailPage.emissionSources.description", {
        count: CLIMATE_TRACE_SOURCES_LIMIT,
        year,
      })}
    />
  );

  const rankedList = (
    <EmissionSourcesRankedList
      sources={sources}
      loading={loading}
      hoveredSourceId={hoveredSourceId}
      onHoverSource={setHoveredSourceId}
      className="h-full"
    />
  );

  const mapPanel = (
    <div
      className={cn(
        "relative min-w-0 overflow-hidden rounded-xl bg-black-2 ring-1 ring-white/10 shadow-2xl shadow-black/40",
        EMISSION_SOURCES_MAP_CLASS,
      )}
    >
      {loading ? (
        <div className="h-full w-full rounded-xl bg-black-2 animate-pulse" />
      ) : !hasCountryGeometry ? (
        <div className="flex h-full items-center justify-center rounded-xl bg-black-2 px-6 text-center text-white/70">
          {t("europe.detailPage.emissionSources.noMapData")}
        </div>
      ) : (
        <EmissionSourcesMapContent
          countryGeoData={countryGeoData}
          regionsGeoData={regionsGeoData}
          sources={sources}
          hoveredSourceId={hoveredSourceId}
          onHoverSource={setHoveredSourceId}
          onRegionSelect={onRegionSelect}
          getSectorInfo={getSectorInfo}
        />
      )}
    </div>
  );

  return (
    <SectionWithHelp helpItems={[]}>
      <div className="md:hidden">
        {cardHeader}

        <div className={cn("mt-8", className)}>{viewToggle}</div>

        <div className="mt-4 grid grid-cols-1 gap-4">
          {showMapOnMobile && mapPanel}
          {showListOnMobile && (
            <div className={cn("min-w-0", EMISSION_SOURCES_PANEL_CLASS)}>
              {rankedList}
            </div>
          )}
        </div>
      </div>

      <div className="hidden md:grid md:grid-cols-2 md:items-stretch md:gap-6">
        <div className="flex min-w-0 flex-col">
          {cardHeader}
          <div className="mt-4">{mapPanel}</div>
        </div>

        <div className="min-w-0 h-full">{rankedList}</div>
      </div>
    </SectionWithHelp>
  );
}
