import { motion } from "framer-motion";
import { FeatureCollection } from "geojson";
import { useTranslation } from "react-i18next";
import TerritoryMap from "@/components/maps/TerritoryMap";
import { OVERVIEW_MAP_DEFAULT_CENTER } from "@/components/maps/mapConstants";
import { useChartMotion } from "@/hooks/useChartMotion";
import { useLanguage } from "@/components/LanguageProvider";
import { useScreenSize } from "@/hooks/useScreenSize";
import type { DataItem, MapEntityType } from "@/types/rankings";
import type { TerritoryKpi } from "@/utils/territoryMapUtils";
import {
  formatAnnualChange,
  type PaceSummary,
  type ParisSummary,
  type StoryLens,
} from "@/utils/territories/territoryOverviewStory";

const ON_TRACK_COLOR = "var(--blue-3)";
const OFF_TRACK_COLOR = "var(--pink-3)";

function BreakdownRow({
  color,
  label,
  count,
  total,
  index,
}: {
  color: string;
  label: string;
  count: number;
  total: number;
  index: number;
}) {
  const { reduceMotion, fadeDuration, stagger, ease } = useChartMotion();
  const share = total ? Math.round((count / total) * 100) : 0;

  return (
    <motion.div
      className="flex items-center gap-2.5 border-t border-white/10 py-3 text-sm last:border-b"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: fadeDuration,
        delay: stagger(index, 0.06),
        ease,
      }}
    >
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="min-w-0 flex-1 text-white/70">{label}</span>
      <span className="font-medium tabular-nums">{count}</span>
      <span className="w-11 text-right tabular-nums text-white/40">
        {share}%
      </span>
    </motion.div>
  );
}

function AnswerCopy({
  storyKey,
  lens,
  paris,
  pace,
}: {
  storyKey: string;
  lens: StoryLens;
  paris: ParisSummary;
  pace: PaceSummary;
}) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { reduceMotion, fadeDuration, ease } = useChartMotion();

  const figure =
    lens === "paris"
      ? String(paris.onTrack)
      : pace.median == null
        ? "–"
        : formatAnnualChange(pace.median, currentLanguage);

  const heading =
    lens === "paris"
      ? t(`${storyKey}.heading`, { count: paris.total })
      : t(`${storyKey}.headingPace`);

  const support =
    lens === "paris"
      ? t(`${storyKey}.share`, {
          percent: paris.onTrackPercent,
          count: paris.total,
        })
      : t(`${storyKey}.paceShare`, {
          falling: pace.falling,
          rising: pace.rising,
        });

  const rows =
    lens === "paris"
      ? [
          {
            color: ON_TRACK_COLOR,
            label: t(`${storyKey}.onTrack`),
            count: paris.onTrack,
          },
          {
            color: OFF_TRACK_COLOR,
            label: t(`${storyKey}.offTrack`),
            count: paris.offTrack,
          },
          ...(paris.unknown > 0
            ? [
                {
                  color: "var(--grey)",
                  label: t(`${storyKey}.unknown`),
                  count: paris.unknown,
                },
              ]
            : []),
        ]
      : [
          {
            color: ON_TRACK_COLOR,
            label: t(`${storyKey}.falling`),
            count: pace.falling,
          },
          {
            color: OFF_TRACK_COLOR,
            label: t(`${storyKey}.rising`),
            count: pace.rising,
          },
          ...(pace.flat > 0
            ? [
                {
                  color: "var(--grey)",
                  label: t(`${storyKey}.flat`),
                  count: pace.flat,
                },
              ]
            : []),
        ];

  return (
    <div key={lens}>
      <p className="mb-3.5 text-xs uppercase tracking-[0.09em] text-white/45">
        {t(lens === "paris" ? `${storyKey}.kicker` : `${storyKey}.kickerPace`)}
      </p>
      <p className="max-w-[620px] text-[22px] font-light leading-snug md:text-[28px]">
        <motion.b
          className={`mb-3 block text-[56px] font-medium leading-none tracking-tighter tabular-nums md:text-[80px] ${
            lens === "pace" && pace.median != null && pace.median > 0
              ? "text-pink-3"
              : "text-blue-2"
          }`}
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: fadeDuration, ease }}
        >
          {figure}
        </motion.b>
        <motion.span
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: fadeDuration,
            delay: reduceMotion ? 0 : 0.08,
            ease,
          }}
        >
          {heading}
        </motion.span>
      </p>
      <motion.p
        className="mt-4 text-base leading-relaxed text-white/65"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: fadeDuration,
          delay: reduceMotion ? 0 : 0.14,
          ease,
        }}
      >
        {support}
      </motion.p>
      <div className="mt-3.5">
        {rows.map((row, index) => (
          <BreakdownRow
            key={row.label}
            color={row.color}
            label={row.label}
            count={row.count}
            total={paris.total}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

export function TerritoryMapAnswer({
  storyKey,
  lens,
  entityType,
  geoData,
  mapData,
  parisKpi,
  paceKpi,
  paris,
  pace,
  onAreaClick,
}: {
  storyKey: string;
  lens: StoryLens;
  entityType: MapEntityType;
  geoData: FeatureCollection;
  mapData: DataItem[];
  parisKpi: TerritoryKpi;
  paceKpi: TerritoryKpi;
  paris: ParisSummary;
  pace: PaceSummary;
  onAreaClick: (name: string) => void;
}) {
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();
  const selectedKPI = lens === "paris" ? parisKpi : paceKpi;
  const empty = paris.total === 0;

  if (empty) {
    return (
      <section
        aria-label={t(`${storyKey}.mapTitle`)}
        className="rounded-level-2 bg-black-2 px-6 py-8 md:px-10 md:py-9"
      >
        <p className="mb-3.5 text-xs uppercase tracking-[0.09em] text-white/45">
          {t(`${storyKey}.kicker`)}
        </p>
        <p className="text-2xl font-light">{t(`${storyKey}.emptyHeading`)}</p>
        <p className="mt-3.5 text-base leading-relaxed text-white/65">
          {t(`${storyKey}.emptyBody`)}
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label={t(`${storyKey}.mapTitle`)}
      className="grid overflow-hidden rounded-level-2 bg-black-2 lg:h-[680px] lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.85fr)]"
    >
      <div className="relative h-[min(70vh,620px)] min-h-[440px] lg:h-full">
        <TerritoryMap
          key={lens}
          entityType={entityType}
          geoData={geoData}
          data={mapData}
          selectedKPI={selectedKPI}
          onAreaClick={onAreaClick}
          defaultCenter={OVERVIEW_MAP_DEFAULT_CENTER}
          defaultZoom={isMobile ? 4 : undefined}
          scrollWheelZoom={false}
          showLegend={isMobile}
          fitBounds
          fitBoundsPadding={isMobile ? [16, 72] : [24, 24]}
          className="absolute inset-0 h-full max-w-none"
        />
      </div>
      <div className="flex min-h-0 flex-col justify-center overflow-y-auto border-t border-white/10 px-6 py-8 md:px-10 md:py-9 lg:border-l lg:border-t-0">
        <AnswerCopy storyKey={storyKey} lens={lens} paris={paris} pace={pace} />
      </div>
    </section>
  );
}
