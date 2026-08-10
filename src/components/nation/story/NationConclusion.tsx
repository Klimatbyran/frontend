import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LocalizedLink } from "@/components/LocalizedLink";
import {
  formatMton,
  type NationStoryMetrics,
} from "@/utils/data/nationStoryMetrics";
import { formatPercentChange } from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";
import {
  NATION_STORY_TEXT,
  NATION_STORY_TYPE,
} from "@/components/nation/story/nationStoryColors";

type NationConclusionProps = {
  metrics: NationStoryMetrics;
};

/** Counts up from zero when scrolled into view, so the final numbers land. */
function CountUpMton({ value }: { value: number }) {
  const { currentLanguage } = useLanguage();
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(() =>
    formatMton(0, currentLanguage, 0),
  );

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) {
      setDisplay(formatMton(value, currentLanguage, 0));
      return;
    }
    const controls = animate(0, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(formatMton(v, currentLanguage, 0)),
    });
    return () => controls.stop();
  }, [inView, value, currentLanguage, reducedMotion]);

  return <span ref={ref}>{display}</span>;
}

/** Site-standard sweep-fill CTA button (same treatment as the landing sections). */
function StoryCtaButton({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <LocalizedLink to={to} className="w-fit">
      <Button
        variant="outline"
        size="lg"
        className="group relative w-auto h-12 rounded-md overflow-hidden font-medium border-white group-hover:border-blue-3 hover:opacity-100 active:opacity-100"
      >
        <span
          className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100"
          aria-hidden="true"
        />
        <span className="relative z-10 inline-flex items-center text-white transition-colors duration-500 group-hover:text-black">
          {children}
          <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
        </span>
      </Button>
    </LocalizedLink>
  );
}

type ConclusionStatProps = {
  labelKey: string;
  value: number;
  changePercent: number;
  /** value / max — drives the proportional scale bar */
  share: number;
  colorClass: string;
  barColor: string;
  delay: number;
};

function ConclusionStat({
  labelKey,
  value,
  changePercent,
  share,
  colorClass,
  barColor,
  delay,
}: ConclusionStatProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, delay }}
      className="px-4 sm:px-8 md:px-12"
    >
      <p
        className={`${NATION_STORY_TYPE.eyebrow} ${NATION_STORY_TEXT.secondary} mb-3 md:mb-4`}
      >
        {t(labelKey)}
      </p>
      <p
        className={`text-6xl md:text-display font-light tabular-nums leading-none ${colorClass}`}
      >
        <CountUpMton value={value} />
      </p>
      <p
        className={`${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body} mt-2 md:mt-3`}
      >
        {t("nation.story.unit.millionTco2e")}
      </p>

      {/* Proportional scale bar – same fill metaphor as the hero and bathtub */}
      <div className="mt-5 md:mt-6 h-1.5 w-full max-w-56 mx-auto rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
          initial={{ width: 0 }}
          whileInView={{ width: `${share * 100}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 1.2, ease: "easeOut", delay: delay + 0.3 }
          }
        />
      </div>

      <p
        className={`mt-4 md:mt-5 ${NATION_STORY_TYPE.emphasis} ${colorClass} tabular-nums`}
      >
        {formatPercentChange(changePercent, currentLanguage)}{" "}
        <span
          className={`font-normal ${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary}`}
        >
          {t("nation.story.conclusion.since1990")}
        </span>
      </p>
    </motion.div>
  );
}

export function NationConclusion({ metrics }: NationConclusionProps) {
  const { t } = useTranslation();
  const { getLocalizedPath } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto text-center space-y-5 md:space-y-8">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className={NATION_STORY_TYPE.title}
      >
        {t("nation.story.conclusion.title")}
      </motion.h2>

      {/* Open two-column finale: stats stand directly on the backdrop,
          separated by a hairline on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-0 sm:divide-x sm:divide-white/10 py-4 md:py-6">
        <ConclusionStat
          labelKey="nation.story.conclusion.usualLabel"
          value={metrics.territorialLatestMton}
          changePercent={metrics.territorialChangePercent}
          share={metrics.territorialLatestMton / metrics.combinedLatestMton}
          colorClass="text-orange-3"
          barColor="var(--orange-3)"
          delay={0.15}
        />
        <ConclusionStat
          labelKey="nation.story.conclusion.fullLabel"
          value={metrics.combinedLatestMton}
          changePercent={metrics.combinedChangePercent}
          share={1}
          colorClass="text-pink-3"
          barColor="var(--pink-3)"
          delay={0.3}
        />
      </div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className={`${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary}`}
      >
        <Link
          to={getLocalizedPath("/methodology?view=nationEmissionsLayers")}
          className="underline underline-offset-4 decoration-white/40 hover:text-white hover:decoration-white transition-colors"
        >
          {t("nation.story.conclusion.methodologyLink")}
        </Link>
      </motion.p>

      {/* Closing CTA: the story hands the reader on to the data */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.45, delay: 0.25 }}
        className="pt-4 md:pt-6 space-y-4 md:space-y-5"
      >
        <p className={`${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body}`}>
          {t("nation.story.conclusion.ctaLead")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
          <StoryCtaButton to="/nation">
            {t("nation.story.conclusion.ctaNation")}
          </StoryCtaButton>
          <StoryCtaButton to="/municipalities">
            {t("nation.story.conclusion.ctaMunicipalities")}
          </StoryCtaButton>
        </div>
      </motion.div>
    </div>
  );
}
