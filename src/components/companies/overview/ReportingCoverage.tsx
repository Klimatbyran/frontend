import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useChartMotion } from "@/hooks/useChartMotion";
import type { ParisSummary } from "@/hooks/companies/parisOverviewUtils";

function percentLabel(part: number, total: number, other: number): number {
  if (total === 0 || part === 0) return 0;
  if (other === 0) return 100;
  return Math.round((part / total) * 100);
}

export function ReportingCoverage({ summary }: { summary: ParisSummary }) {
  const { t } = useTranslation();
  const { reduceMotion, barDuration, ease } = useChartMotion();
  const { total, onTrack, offTrack, unknown } = summary;

  if (total === 0) return null;

  const enough = onTrack + offTrack;
  const enoughPercent = percentLabel(enough, total, unknown);
  const tooLittlePercent =
    unknown === 0 ? 0 : enough === 0 ? 100 : 100 - enoughPercent;
  const enoughWidth = (enough / total) * 100;

  return (
    <section className="rounded-level-2 bg-black-2 p-6 md:p-7">
      <h2 className="text-xl font-light md:text-[21px]">
        {t("companiesOverviewPage.paris.reportingTitle")}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-white/60">
        {t("companiesOverviewPage.paris.reportingDescription")}
      </p>

      <div
        className="mt-6 h-4 overflow-hidden rounded-full bg-white/15"
        role="img"
        aria-label={t("companiesOverviewPage.paris.reportingAria", {
          enough,
          tooLittle: unknown,
        })}
      >
        {enough > 0 && (
          <motion.div
            className="h-full origin-left rounded-full bg-white"
            style={{ width: `${enoughWidth}%` }}
            initial={reduceMotion ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: reduceMotion ? 0 : barDuration,
              ease,
            }}
          />
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <CoverageFigure
          color="white"
          label={t("companiesOverviewPage.paris.reportingEnough")}
          count={enough}
          percent={enoughPercent}
          index={0}
        />
        <CoverageFigure
          color="rgba(255,255,255,0.28)"
          label={t("companiesOverviewPage.paris.reportingTooLittle")}
          count={unknown}
          percent={tooLittlePercent}
          index={1}
        />
      </div>
    </section>
  );
}

function CoverageFigure({
  color,
  label,
  count,
  percent,
  index,
}: {
  color: string;
  label: string;
  count: number;
  percent: number;
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
        {count}
      </p>
      <p className="mt-2 flex items-center gap-2 text-sm text-white/70">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span>{label}</span>
        <span className="tabular-nums text-white/40">{percent}%</span>
      </p>
    </motion.div>
  );
}
