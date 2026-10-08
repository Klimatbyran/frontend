import { motion } from "framer-motion";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useChartMotion } from "@/hooks/useChartMotion";
import { useEnteredView } from "@/hooks/useEnteredView";
import { ScrollReveal } from "@/components/companies/overview/ScrollReveal";
import {
  summariseReporting,
  TREND_MIN_YEARS,
} from "@/hooks/companies/parisOverviewUtils";
import type { OverviewCompany } from "@/hooks/companies/parisOverviewUtils";

const ENOUGH_COLOR = "var(--blue-3)";
const TOO_LITTLE_COLOR = "var(--pink-3)";

function percentLabel(part: number, total: number, other: number): number {
  if (total === 0 || part === 0) return 0;
  if (other === 0) return 100;
  return Math.round((part / total) * 100);
}

export function ReportingCoverage({
  companies,
}: {
  companies: OverviewCompany[];
}) {
  const { t } = useTranslation();
  const { reduceMotion, barDuration, ease } = useChartMotion();
  const { ref, entered } = useEnteredView<HTMLElement>({
    enabled: !reduceMotion,
  });
  const show = reduceMotion || entered;
  const split = useMemo(() => summariseReporting(companies), [companies]);

  if (split.total === 0) return null;

  const enoughPercent = percentLabel(
    split.enough,
    split.total,
    split.tooLittle,
  );
  const tooLittlePercent =
    split.tooLittle === 0 ? 0 : split.enough === 0 ? 100 : 100 - enoughPercent;
  const enoughWidth = (split.enough / split.total) * 100;
  const yearCopy = { min: TREND_MIN_YEARS };

  return (
    <ScrollReveal>
      <section ref={ref} className="rounded-level-2 bg-black-2 p-6 md:p-7">
        <h2 className="text-xl font-light md:text-[21px]">
          {t("companiesOverviewPage.paris.reportingTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          {t("companiesOverviewPage.paris.reportingDescription", yearCopy)}
        </p>

        <div
          className="mt-6 flex h-4 overflow-hidden rounded-full bg-white/10"
          role="img"
          aria-label={t("companiesOverviewPage.paris.reportingAria", {
            ...yearCopy,
            enough: split.enough,
            tooLittle: split.tooLittle,
            enoughPercent,
            tooLittlePercent,
          })}
        >
          {split.enough > 0 && (
            <motion.div
              className="h-full origin-left"
              style={{
                width: `${enoughWidth}%`,
                backgroundColor: ENOUGH_COLOR,
              }}
              initial={reduceMotion ? false : { scaleX: 0 }}
              animate={{ scaleX: show ? 1 : 0 }}
              transition={{
                duration: reduceMotion ? 0 : barDuration,
                ease,
              }}
            />
          )}
          {split.tooLittle > 0 && (
            <motion.div
              className="h-full origin-right"
              style={{
                width: `${100 - enoughWidth}%`,
                backgroundColor: TOO_LITTLE_COLOR,
              }}
              initial={reduceMotion ? false : { scaleX: 0 }}
              animate={{ scaleX: show ? 1 : 0 }}
              transition={{
                duration: reduceMotion ? 0 : barDuration,
                ease,
              }}
            />
          )}
        </div>

        <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <CoverageFigure
            color={ENOUGH_COLOR}
            label={t("companiesOverviewPage.paris.reportingEnough")}
            count={split.enough}
            percent={enoughPercent}
            index={0}
            revealed={show}
          />
          <CoverageFigure
            color={TOO_LITTLE_COLOR}
            label={t("companiesOverviewPage.paris.reportingTooLittle")}
            count={split.tooLittle}
            percent={tooLittlePercent}
            index={1}
            revealed={show}
          />
        </div>
      </section>
    </ScrollReveal>
  );
}

function CoverageFigure({
  color,
  label,
  count,
  percent,
  index,
  revealed,
}: {
  color: string;
  label: string;
  count: number;
  percent: number;
  index: number;
  revealed: boolean;
}) {
  const { reduceMotion, fadeDuration, stagger, ease } = useChartMotion();
  const show = reduceMotion || revealed;

  return (
    <motion.div
      className="min-w-0"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      transition={{
        duration: fadeDuration,
        delay: stagger(index, 0.06),
        ease,
      }}
    >
      <p className="text-3xl font-medium tabular-nums leading-none md:text-4xl">
        {count}
      </p>
      <p className="mt-2 flex items-start gap-2 text-sm leading-snug text-white/70">
        <span
          className="mt-1 size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="min-w-0 break-words">
          {label}
          <span className="ml-2 tabular-nums text-white/40">{percent}%</span>
        </span>
      </p>
    </motion.div>
  );
}
