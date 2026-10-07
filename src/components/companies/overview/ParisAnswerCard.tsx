import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "@/components/layout/InfoTooltip";
import { useChartMotion } from "@/hooks/useChartMotion";
import type { ParisSummary } from "@/hooks/companies/parisOverviewUtils";

interface VerdictColumnProps {
  color: string;
  label: string;
  count: number;
  judged: number;
  maxCount: number;
  index: number;
}

function VerdictColumn({
  color,
  label,
  count,
  judged,
  maxCount,
  index,
}: VerdictColumnProps) {
  const { reduceMotion, fadeDuration, stagger, ease } = useChartMotion();
  const share = judged ? (count / judged) * 100 : 0;
  const barHeightPercent =
    maxCount > 0 && count > 0 ? (count / maxCount) * 100 : 0;

  return (
    <motion.div
      className="flex w-[116px] shrink-0 flex-col items-center sm:w-[128px]"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: fadeDuration,
        delay: stagger(index, 0.06),
        ease,
      }}
    >
      <div className="flex h-40 w-full items-end sm:h-44" aria-hidden>
        <motion.div
          className="relative w-full origin-bottom rounded-t-lg"
          style={{
            backgroundColor: color,
            height: `${barHeightPercent}%`,
          }}
          initial={reduceMotion ? false : { scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{
            duration: reduceMotion ? 0 : 0.7,
            delay: stagger(index, 0.08),
            ease,
          }}
        >
          {count > 0 && (
            <div className="absolute inset-x-0 top-0 flex flex-col items-center px-1 pt-2 text-center text-xs leading-tight tabular-nums">
              <span className="font-medium text-white drop-shadow-sm">
                {count}
              </span>
              <span className="text-white/75 drop-shadow-sm">
                {Math.round(share)}%
              </span>
            </div>
          )}
        </motion.div>
      </div>
      <div className="mt-3 flex min-h-[2.75rem] w-full items-start justify-center gap-1.5 px-0.5 text-center text-xs leading-snug text-white/70">
        <i
          className="mt-1 size-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span>{label}</span>
      </div>
    </motion.div>
  );
}

export interface ParisAnswerCardProps {
  summary: ParisSummary;
  /** Translated industry name when one is selected, otherwise null. */
  industryLabel: string | null;
}

export function ParisAnswerCard({
  summary,
  industryLabel,
}: ParisAnswerCardProps) {
  const { t } = useTranslation();
  const { reduceMotion, fadeDuration, ease } = useChartMotion();
  const {
    total,
    onTrack,
    offTrack,
    unknown,
    reducingNotOnTrack,
    onTrackPercent,
  } = summary;

  if (total === 0) {
    return (
      <section className="rounded-level-2 bg-black-2 px-6 py-8 md:px-10 md:py-9">
        <p className="mb-3.5 text-xs uppercase tracking-[0.09em] text-white/45">
          {t("companiesOverviewPage.paris.kicker")}
        </p>
        <p className="text-2xl font-light">
          {t("companiesOverviewPage.paris.emptyHeading")}
        </p>
        <p className="mt-3.5 text-base leading-relaxed text-white/65">
          {t("companiesOverviewPage.paris.emptyBody")}
        </p>
      </section>
    );
  }

  const scope = industryLabel
    ? t("companiesOverviewPage.paris.scopeIndustry", {
        industry: industryLabel,
      })
    : t("companiesOverviewPage.paris.scopeAll");

  const judged = onTrack + offTrack;
  const showChartPanel = judged > 0 || unknown > 0;
  const maxCount = Math.max(onTrack, offTrack);

  return (
    <section className="grid items-center gap-9 rounded-level-2 bg-black-2 px-6 py-8 md:grid-cols-[minmax(0,1fr)_minmax(340px,0.85fr)] md:gap-14 md:px-10 md:py-9">
      <div>
        <p className="mb-3.5 text-xs uppercase tracking-[0.09em] text-white/45">
          {t("companiesOverviewPage.paris.kicker")}
        </p>
        <p className="max-w-[620px] text-[22px] font-light leading-snug md:text-[28px]">
          <motion.b
            className="mb-3 block text-[68px] font-medium leading-none tracking-tighter text-blue-2 tabular-nums md:text-[92px]"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: fadeDuration, ease }}
          >
            {onTrack}
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
            {t("companiesOverviewPage.paris.heading", { count: total, scope })}
          </motion.span>
        </p>
        <motion.p
          className="mt-4 max-w-[620px] text-base leading-relaxed text-white/65"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: fadeDuration,
            delay: reduceMotion ? 0 : 0.14,
            ease,
          }}
        >
          {t("companiesOverviewPage.paris.share", { percent: onTrackPercent })}{" "}
          {reducingNotOnTrack > 0
            ? t("companiesOverviewPage.paris.manyCutting")
            : t("companiesOverviewPage.paris.restTooSlow")}
        </motion.p>
      </div>

      {showChartPanel && (
        <div>
          <div className="flex min-w-0 items-center gap-2">
            <p className="shrink-0 whitespace-nowrap text-xs text-white/40">
              {t("companiesOverviewPage.paris.chartCaption")}
            </p>
            {unknown > 0 && (
              <InfoTooltip
                ariaLabel={t("companiesOverviewPage.paris.unknownNoteAria")}
              >
                <p>
                  {t("companiesOverviewPage.paris.unknownNote", {
                    count: unknown,
                  })}
                </p>
              </InfoTooltip>
            )}
          </div>
          {judged > 0 && (
            <div
              className="mt-4 flex items-end justify-center gap-2 sm:gap-3"
              role="img"
              aria-label={t("companiesOverviewPage.paris.chartAria", {
                onTrack,
                offTrack,
              })}
            >
              <VerdictColumn
                color="var(--blue-3)"
                label={t("companiesOverviewPage.paris.onTrack")}
                count={onTrack}
                judged={judged}
                maxCount={maxCount}
                index={0}
              />
              <VerdictColumn
                color="var(--pink-3)"
                label={t("companiesOverviewPage.paris.offTrack")}
                count={offTrack}
                judged={judged}
                maxCount={maxCount}
                index={1}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
