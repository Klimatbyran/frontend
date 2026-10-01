import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useChartMotion } from "@/hooks/useChartMotion";
import type { ParisSummary } from "@/hooks/companies/parisOverviewUtils";

/**
 * A handful of companies still has to fill the block, so the dots grow as the
 * selection shrinks instead of trailing off as one sparse row.
 */
function dotSize(total: number): number {
  if (total <= 24) return 22;
  if (total <= 60) return 16;
  return 12;
}

/** Each dot pops in; the wave finishes under ~1.6s even for the full Swedish set. */
const DOT_ENTER_DURATION = 0.2;
const DOT_WAVE_SPAN = 1.35;

function dotStaggerStep(count: number): number {
  if (count <= 1) return 0;
  return DOT_WAVE_SPAN / (count - 1);
}

interface BreakdownRowProps {
  color: string;
  label: string;
  count: number;
  total: number;
  index: number;
}

function BreakdownRow({
  color,
  label,
  count,
  total,
  index,
}: BreakdownRowProps) {
  const { reduceMotion, fadeDuration, stagger, ease } = useChartMotion();

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
        {total ? Math.round((count / total) * 100) : 0}%
      </span>
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
  const { total, onTrack, offTrack, unknown, reducing, onTrackPercent } =
    summary;

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

  const size = dotSize(total);
  const dots = [
    ...Array<string>(onTrack).fill("var(--blue-3)"),
    ...Array<string>(offTrack).fill("var(--pink-3)"),
    ...Array<string>(unknown).fill("rgba(255,255,255,0.2)"),
  ];

  const staggerStep = dotStaggerStep(dots.length);

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
          {reducing > onTrack
            ? t("companiesOverviewPage.paris.manyCutting")
            : t("companiesOverviewPage.paris.restTooSlow")}
        </motion.p>
      </div>

      <div>
        <p className="text-xs text-white/40">
          {t("companiesOverviewPage.paris.dotNote")}
        </p>
        <motion.div
          aria-hidden="true"
          className="mt-2.5 flex flex-wrap"
          style={{ gap: size > 16 ? 9 : 6 }}
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: reduceMotion ? 0 : staggerStep,
              },
            },
          }}
        >
          {dots.map((color, index) => (
            <motion.span
              key={index}
              className="block rounded-full"
              style={{ width: size, height: size, backgroundColor: color }}
              variants={{
                hidden: { opacity: 0, scale: 0.35 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: reduceMotion ? 0 : DOT_ENTER_DURATION,
                    ease,
                  },
                },
              }}
            />
          ))}
        </motion.div>
        <div className="mt-3.5">
          <BreakdownRow
            color="var(--blue-3)"
            label={t("companiesOverviewPage.paris.onTrack")}
            count={onTrack}
            total={total}
            index={0}
          />
          <BreakdownRow
            color="var(--pink-3)"
            label={t("companiesOverviewPage.paris.offTrack")}
            count={offTrack}
            total={total}
            index={1}
          />
          <BreakdownRow
            color="rgba(255,255,255,0.2)"
            label={t("companiesOverviewPage.paris.notEnoughData")}
            count={unknown}
            total={total}
            index={2}
          />
        </div>
      </div>
    </section>
  );
}
