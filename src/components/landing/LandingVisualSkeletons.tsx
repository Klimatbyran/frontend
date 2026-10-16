import { useTranslation } from "react-i18next";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { ChartYearControls, EnhancedLegend } from "@/components/charts";
import { createTwoFuturesLegendItems } from "@/components/charts/twoFutures/createTwoFuturesLegendItems";
import {
  SWEDEN_OUTLINE_PATH,
  SWEDEN_OUTLINE_VIEWBOX,
  swedenOutlineScaleMatrix,
} from "@/components/nation/story/swedenOutlinePath";
import { LANDING_CHART_PANEL_HEIGHT_CLASS } from "@/lib/constants/landingPage";
import { cn } from "@/lib/utils";
import { DEFAULT_STATISTICAL_GRADIENT_COLORS } from "@/utils/ui/colorGradients";

const MAP_LEGEND_GRADIENT = `linear-gradient(to right,
  ${DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientStart} 0%,
  ${DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientMidLow} 33%,
  ${DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientMidHigh} 66%,
  ${DEFAULT_STATISTICAL_GRADIENT_COLORS.gradientEnd} 100%)`;

/** Same frame as the landing nation visual so the stats do not jump in. */
const NATION_VISUAL_CLASS =
  "mx-auto grid max-w-full grid-cols-1 justify-items-center gap-2 max-md:gap-1.5 story-short:gap-1 md:flex md:w-fit md:max-w-full md:items-center md:justify-center md:gap-6 story-compact:gap-6 lg:gap-10 xl:gap-14";

const NATION_MAP_CLASS =
  "relative h-[clamp(155px,28svh,300px)] story-short:h-[clamp(130px,24svh,230px)] landing-laptop:h-[clamp(280px,42svh,420px)] story-compact:landing-laptop:h-[clamp(240px,36svh,360px)] xl:h-[clamp(260px,44svh,460px)] aspect-[100/220] shrink-0";

function LoadingLabel() {
  const { t } = useTranslation();
  return <span className="sr-only">{t("landingPage.sectionLoading")}</span>;
}

function SwedenOutline({ className }: { className?: string }) {
  return (
    <svg
      viewBox={SWEDEN_OUTLINE_VIEWBOX}
      className={className}
      aria-hidden="true"
    >
      <path d={SWEDEN_OUTLINE_PATH} className="fill-white/15" />
    </svg>
  );
}

function MapZoomSkeleton() {
  const buttonClass =
    "rounded-xl bg-black/40 p-2 text-white/70 backdrop-blur-sm";

  return (
    <div
      className="absolute right-4 top-4 flex flex-col gap-2 md:bottom-4 md:left-4 md:right-auto md:top-auto"
      aria-hidden="true"
    >
      <div className={buttonClass}>
        <ZoomIn className="h-5 w-5" />
      </div>
      <div className={buttonClass}>
        <ZoomOut className="h-5 w-5" />
      </div>
      <div className={buttonClass}>
        <RotateCcw className="h-5 w-5" />
      </div>
    </div>
  );
}

/** Choropleth frame: Sweden, zoom controls, and the colour legend. */
export function LandingMapSkeleton() {
  return (
    <div role="status" aria-busy="true" className="relative h-full w-full">
      <LoadingLabel />
      <div className="absolute inset-0 flex items-center justify-center">
        <SwedenOutline className="h-[72%] w-auto animate-pulse" />
      </div>
      <MapZoomSkeleton />
      <div
        className="absolute bottom-2 left-2 right-2 rounded-2xl bg-black/60 p-2 backdrop-blur-sm md:bottom-4 md:left-auto md:right-4 md:p-4"
        aria-hidden="true"
      >
        <div className="flex w-full items-center gap-2 md:w-auto">
          <div className="h-3 w-8 shrink-0 animate-pulse rounded bg-white/20" />
          <div
            className="h-5 min-w-0 flex-1 rounded-full md:w-40 md:flex-none"
            style={{ background: MAP_LEGEND_GRADIENT }}
          />
          <div className="h-3 w-8 shrink-0 animate-pulse rounded bg-white/20" />
        </div>
      </div>
    </div>
  );
}

function ChartPlotSkeleton() {
  return (
    <div className="flex h-full min-h-[350px] gap-3 pt-14" aria-hidden="true">
      <div className="flex w-10 shrink-0 flex-col justify-between py-4">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="ml-auto h-3 w-8 animate-pulse rounded bg-white/10"
          />
        ))}
      </div>
      <div className="flex h-full min-w-0 flex-1 flex-col">
        <svg
          viewBox="0 0 640 250"
          preserveAspectRatio="none"
          className="min-h-0 w-full flex-1"
        >
          {[48, 96, 144, 192].map((y) => (
            <line
              key={y}
              x1="0"
              x2="640"
              y1={y}
              y2={y}
              stroke="currentColor"
              className="text-white/10"
            />
          ))}
          <line
            x1="280"
            x2="280"
            y1="8"
            y2="210"
            stroke="currentColor"
            strokeDasharray="4 4"
            className="text-white/30"
          />
          <polygon
            points="280,150 460,188 620,214 620,232 460,206 280,150"
            fill="var(--pink-3)"
            opacity="0.22"
          />
          <polyline
            points="8,78 70,88 140,102 210,118 280,150"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
          />
          <polyline
            points="280,150 460,188 620,214"
            fill="none"
            stroke="var(--pink-3)"
            strokeWidth="2.5"
            strokeDasharray="6 4"
          />
          <polyline
            points="280,150 460,206 620,232"
            fill="none"
            stroke="var(--green-2)"
            strokeWidth="2.5"
            strokeDasharray="6 4"
          />
        </svg>
        <div className="mt-2 flex justify-between">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="h-3 w-8 animate-pulse rounded bg-white/10"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Emissions chart frame: year toggle, two-futures lines, and legend. */
export function LandingCompanyChartSkeleton({
  chartEndYear,
  shortEndYear,
  longEndYear,
  setChartEndYear,
}: {
  chartEndYear: number;
  shortEndYear: number;
  longEndYear: number;
  setChartEndYear: (year: number) => void;
}) {
  const { t } = useTranslation();
  const legendItems = createTwoFuturesLegendItems(
    t,
    "companies.emissionsHistory",
  );

  return (
    <div
      role="status"
      aria-busy="true"
      className={cn(LANDING_CHART_PANEL_HEIGHT_CLASS, "relative flex flex-col")}
    >
      <LoadingLabel />
      <div className="absolute right-0 top-0 z-20">
        <ChartYearControls
          chartEndYear={chartEndYear}
          shortEndYear={shortEndYear}
          longEndYear={longEndYear}
          setChartEndYear={setChartEndYear}
        />
      </div>
      <div className="min-h-0 flex-1">
        <ChartPlotSkeleton />
      </div>
      <div className="space-y-2" aria-hidden="true">
        <EnhancedLegend items={legendItems} />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

function NationStatSkeleton({ tone }: { tone: "blue" | "orange" }) {
  const valueClass = tone === "blue" ? "bg-blue-3/40" : "bg-orange-3/40";

  return (
    <div aria-hidden="true">
      <div className="flex flex-col items-center px-0.5 md:hidden">
        <div className={cn("h-9 w-16 animate-pulse rounded", valueClass)} />
        <div className="mt-2 h-3 w-20 animate-pulse rounded bg-white/10" />
        <div className="mt-2 h-3 w-24 animate-pulse rounded bg-white/10" />
      </div>
      <div className="hidden min-w-[12.5rem] md:block">
        <div className="mb-2 h-4 w-40 animate-pulse rounded bg-white/10" />
        <div
          className={cn("h-12 w-24 animate-pulse rounded xl:h-14", valueClass)}
        />
        <div className="mt-2 h-4 w-36 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

/** Nested Sweden silhouettes and the two national emission figures. */
export function LandingNationVisualSkeleton() {
  return (
    <div role="status" aria-busy="true" className={NATION_VISUAL_CLASS}>
      <LoadingLabel />
      <div className={NATION_MAP_CLASS}>
        <div className="absolute inset-[5%] xl:inset-[8%]">
          <svg
            viewBox={SWEDEN_OUTLINE_VIEWBOX}
            overflow="visible"
            className="block h-full w-full animate-pulse"
            aria-hidden="true"
          >
            <path
              d={SWEDEN_OUTLINE_PATH}
              fill="var(--orange-3)"
              opacity="0.45"
            />
            <path
              d={SWEDEN_OUTLINE_PATH}
              fill="var(--blue-3)"
              transform={swedenOutlineScaleMatrix(0.55, -7)}
            />
          </svg>
        </div>
      </div>
      <div className="grid w-full max-w-[22rem] grid-cols-2 gap-x-4 md:flex md:w-auto md:max-w-none md:shrink-0 md:flex-col md:items-start md:gap-5 lg:gap-6">
        <NationStatSkeleton tone="blue" />
        <NationStatSkeleton tone="orange" />
      </div>
    </div>
  );
}
