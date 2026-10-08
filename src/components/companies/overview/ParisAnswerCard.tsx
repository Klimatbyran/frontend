import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useChartMotion } from "@/hooks/useChartMotion";
import type { ParisSummary } from "@/hooks/companies/parisOverviewUtils";
import type { CompanyWithKPIs } from "@/types/company";
import { ParisCompanyDots } from "./ParisCompanyDots";
import { cn } from "@/lib/utils";

interface BreakdownRowProps {
  color: string;
  label: string;
  count: number;
  /** Share of the companies these two rows cover, so the pair adds up to 100. */
  percent: number;
  index: number;
  pressed?: boolean;
  dimmed?: boolean;
  onToggle?: () => void;
}

function BreakdownRow({
  color,
  label,
  count,
  percent,
  index,
  pressed = false,
  dimmed = false,
  onToggle,
}: BreakdownRowProps) {
  const { reduceMotion, fadeDuration, stagger, ease } = useChartMotion();
  const motionProps = {
    className: cn(
      "flex w-full items-center gap-2.5 border-t border-white/10 py-3 text-sm last:border-b",
      onToggle && "cursor-pointer rounded-md px-1 text-left hover:bg-white/5",
    ),
    initial: reduceMotion ? false : { opacity: 0, y: 8 },
    animate: { opacity: dimmed ? 0.4 : 1, y: 0 },
    transition: {
      duration: fadeDuration,
      delay: stagger(index, 0.06),
      ease,
    },
  };
  const body = (
    <>
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="min-w-0 flex-1 text-white/70">{label}</span>
      <span className="font-medium tabular-nums">{count}</span>
      <span className="w-11 text-right tabular-nums text-white/40">
        {percent}%
      </span>
    </>
  );

  if (onToggle) {
    return (
      <motion.button
        type="button"
        aria-pressed={pressed}
        onClick={onToggle}
        {...motionProps}
      >
        {body}
      </motion.button>
    );
  }

  return <motion.div {...motionProps}>{body}</motion.div>;
}

export interface ParisAnswerCardProps {
  summary: ParisSummary;
  companies: CompanyWithKPIs[];
  /** Translated industry name when one is selected, otherwise null. */
  industryLabel: string | null;
}

export function ParisAnswerCard({
  summary,
  companies,
  industryLabel,
}: ParisAnswerCardProps) {
  const { t } = useTranslation();
  const { reduceMotion, fadeDuration, ease } = useChartMotion();
  const [emphasis, setEmphasis] = useState<"on" | "off" | null>(null);
  const { total, onTrack, offTrack, onTrackPercent } = summary;

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
  const onTrackShare = judged === 0 ? 0 : Math.round((onTrack / judged) * 100);
  const offTrackShare =
    offTrack === 0 ? 0 : onTrack === 0 ? 100 : 100 - onTrackShare;
  const toggleEmphasis = (next: "on" | "off") => {
    setEmphasis((current) => (current === next ? null : next));
  };

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
            {t("companiesOverviewPage.paris.heading", {
              total,
              scope,
              companies: t("companiesOverviewPage.paris.companyNoun", {
                count: total,
              }),
              verb: t("companiesOverviewPage.paris.headingVerb", {
                count: onTrack,
              }),
            })}
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
          {t("companiesOverviewPage.paris.share", {
            percent: onTrackPercent,
            count: total,
          })}
        </motion.p>
      </div>

      <div>
        <ParisCompanyDots companies={companies} emphasis={emphasis} />
        <div className="mt-3.5">
          <BreakdownRow
            color="var(--blue-3)"
            label={t("companiesOverviewPage.paris.onTrack")}
            count={onTrack}
            percent={onTrackShare}
            index={0}
            pressed={emphasis === "on"}
            dimmed={emphasis === "off"}
            onToggle={onTrack > 0 ? () => toggleEmphasis("on") : undefined}
          />
          <BreakdownRow
            color="var(--pink-3)"
            label={t("companiesOverviewPage.paris.offTrack")}
            count={offTrack}
            percent={offTrackShare}
            index={1}
            pressed={emphasis === "off"}
            dimmed={emphasis === "on"}
            onToggle={offTrack > 0 ? () => toggleEmphasis("off") : undefined}
          />
        </div>
      </div>
    </section>
  );
}
