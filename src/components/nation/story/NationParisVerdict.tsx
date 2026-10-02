import { motion } from "framer-motion";
import { Trans, useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { useParisBudget } from "@/hooks/nation/useParisBudget";
import { formatMton } from "@/utils/data/nationStoryMetrics";
import {
  NATION_STORY_TEXT,
  NATION_STORY_TYPE,
} from "@/components/nation/story/nationStoryColors";

function BudgetBar({
  label,
  caption,
  widthPercent,
  color,
  delay,
}: {
  label: string;
  caption: string;
  widthPercent: number;
  color: string;
  delay: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <span className={`text-sm ${NATION_STORY_TEXT.body}`}>{label}</span>
        <span className="text-sm tabular-nums text-grey">{caption}</span>
      </div>
      <div className="h-10 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${widthPercent}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export function NationParisVerdict() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { facts } = useParisBudget();

  if (!facts) return null;

  const budgetShare = Math.min(
    100,
    (facts.budgetMton / facts.trendMton) * 100,
  );
  const unit = t("nation.story.unit.mtonCo2e");
  const formatMt = (value: number) =>
    `${formatMton(value, currentLanguage, 0)} ${unit}`;

  return (
    <section
      data-story-section
      data-story-chapter="parisVerdict"
      className="relative min-h-[100svh] flex items-center justify-center px-4 md:px-8 pt-[var(--story-stage-pad-top)] pb-[var(--story-stage-pad-bottom)] md:py-8 story-compact:py-6 lg:py-10 xl:py-8"
    >
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.45 }}
          className="space-y-4 text-center md:text-left"
        >
          <p className={`${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary}`}>
            {t("nation.story.parisVerdict.eyebrow", {
              from: facts.startYear,
              to: facts.endYear,
            })}
          </p>
          <h2 className={NATION_STORY_TYPE.title}>
            {t("nation.story.parisVerdict.title")}
          </h2>
          <p className="text-2xl font-light md:text-3xl">
            {facts.onTrack ? (
              <Trans
                i18nKey="nation.story.parisVerdict.verdictYes"
                components={[<span key="0" className="text-green-2" />]}
              />
            ) : (
              <Trans
                i18nKey="nation.story.parisVerdict.verdictNo"
                values={{ ratio: facts.overshootRatio.toFixed(1) }}
                components={[
                  <span key="0" className="text-pink-3" />,
                  <span key="1" className="text-pink-3" />,
                ]}
              />
            )}
          </p>
        </motion.div>

        <div className="relative space-y-6">
          <BudgetBar
            label={t("nation.story.parisVerdict.budgetBar")}
            caption={formatMt(facts.budgetMton)}
            widthPercent={budgetShare}
            color="var(--green-3)"
            delay={0}
          />
          <BudgetBar
            label={t("nation.story.parisVerdict.trendBar")}
            caption={formatMt(facts.trendMton)}
            widthPercent={100}
            color="var(--pink-3)"
            delay={0.25}
          />

          {!facts.onTrack && facts.budgetSpentYear && (
            <div
              className="pointer-events-none absolute inset-y-0 hidden border-l border-dashed border-white/50 md:block"
              style={{ left: `${budgetShare}%` }}
            >
              <span className="absolute -top-1 left-2 whitespace-nowrap text-xs text-white/70">
                {t("nation.story.parisVerdict.budgetSpentMarker", {
                  year: facts.budgetSpentYear,
                })}
              </span>
            </div>
          )}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body}`}
        >
          {facts.onTrack
            ? t("nation.story.parisVerdict.bodyOnTrack", {
                rate: facts.trendRatePercent.toFixed(0),
              })
            : t("nation.story.parisVerdict.bodyOffTrack", {
                trendRate: facts.trendRatePercent.toFixed(0),
                budgetYear: facts.budgetSpentYear ?? facts.endYear,
                yearsAfter: Math.max(
                  0,
                  facts.endYear - (facts.budgetSpentYear ?? facts.endYear),
                ),
              })}
        </motion.p>
      </div>
    </section>
  );
}
