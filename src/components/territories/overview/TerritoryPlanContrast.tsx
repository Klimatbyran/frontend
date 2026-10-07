import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useChartMotion } from "@/hooks/useChartMotion";
import type { PlanContrast } from "@/utils/territories/territoryOverviewStory";

const WITH_PLAN_COLOR = "var(--blue-3)";
// Grey, not pink: pink already means off the Paris path on this page.
const WITHOUT_PLAN_COLOR = "rgba(255,255,255,0.28)";

function ShareFigure({
  value,
  label,
  color,
  index,
}: {
  value: string;
  label: string;
  color: string;
  index: number;
}) {
  const { reduceMotion, fadeDuration, stagger, ease } = useChartMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: fadeDuration,
        delay: stagger(index, 0.06),
        ease,
      }}
    >
      <p className="text-3xl font-medium tabular-nums leading-none md:text-4xl">
        {value}
      </p>
      <p className="mt-2 flex items-start gap-2 text-sm leading-snug text-white/70">
        <span
          className="mt-1 size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="min-w-0">{label}</span>
      </p>
    </motion.div>
  );
}

function shareLabel(share: number | null, emptyLabel: string): string {
  if (share == null) return emptyLabel;
  return `${share}%`;
}

/** A plan and a Paris-aligned cut are different facts. This says so. */
export function TerritoryPlanContrast({
  storyKey,
  plans,
}: {
  storyKey: string;
  plans: PlanContrast;
}) {
  const { t } = useTranslation();
  const { reduceMotion, barDuration, ease } = useChartMotion();

  if (plans.total === 0) return null;

  const withWidth = (plans.withPlan / plans.total) * 100;
  const withoutPercent =
    plans.withoutPlan === 0
      ? 0
      : plans.withPlan === 0
        ? 100
        : 100 - plans.withPlanPercent;

  return (
    <section className="rounded-level-2 bg-black-2 p-6 md:p-7">
      <h2 className="text-xl font-light md:text-[21px]">
        {t(`${storyKey}.plansTitle`)}
      </h2>
      <p className="mt-2 max-w-[640px] text-sm leading-relaxed text-white/60">
        {t(`${storyKey}.plansLead`, {
          withPlan: plans.withPlan,
          total: plans.total,
        })}
      </p>

      <div
        className="mt-6 flex h-4 overflow-hidden rounded-full"
        role="img"
        aria-label={t(`${storyKey}.plansAria`, {
          withPlan: plans.withPlan,
          withoutPlan: plans.withoutPlan,
          withPlanPercent: plans.withPlanPercent,
          withoutPlanPercent: withoutPercent,
        })}
      >
        {plans.withPlan > 0 && (
          <motion.div
            className="h-full origin-left"
            style={{
              width: `${withWidth}%`,
              backgroundColor: WITH_PLAN_COLOR,
            }}
            initial={reduceMotion ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: reduceMotion ? 0 : barDuration, ease }}
          />
        )}
        {plans.withoutPlan > 0 && (
          <motion.div
            className="h-full origin-right"
            style={{
              width: `${100 - withWidth}%`,
              backgroundColor: WITHOUT_PLAN_COLOR,
            }}
            initial={reduceMotion ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: reduceMotion ? 0 : barDuration, ease }}
          />
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <ShareFigure
          value={shareLabel(plans.onTrackShareWithPlan, "–")}
          label={t(`${storyKey}.plansOnTrackWith`)}
          color={WITH_PLAN_COLOR}
          index={0}
        />
        <ShareFigure
          value={shareLabel(plans.onTrackShareWithoutPlan, "–")}
          label={t(`${storyKey}.plansOnTrackWithout`)}
          color={WITHOUT_PLAN_COLOR}
          index={1}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/55">
        <span className="inline-flex items-center gap-2">
          <i
            className="size-2.5 rounded-full"
            style={{ backgroundColor: WITH_PLAN_COLOR }}
          />
          {t(`${storyKey}.plansWith`)}
          <span className="tabular-nums text-white/40">
            {plans.withPlanPercent}%
          </span>
        </span>
        <span className="inline-flex items-center gap-2">
          <i
            className="size-2.5 rounded-full"
            style={{ backgroundColor: WITHOUT_PLAN_COLOR }}
          />
          {t(`${storyKey}.plansWithout`)}
          <span className="tabular-nums text-white/40">{withoutPercent}%</span>
        </span>
      </div>
    </section>
  );
}
