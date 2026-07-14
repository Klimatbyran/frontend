import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  formatMton,
  type NationStoryMetrics,
} from "@/utils/data/nationStoryMetrics";
import { formatPercentChange } from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";
import { NATION_STORY_TEXT } from "@/components/nation/story/nationStoryColors";

type NationConclusionProps = {
  metrics: NationStoryMetrics;
};

export function NationConclusion({ metrics }: NationConclusionProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto text-center space-y-8">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.4 }}
        className={`text-base md:text-lg uppercase tracking-widest ${NATION_STORY_TEXT.eyebrow}`}
      >
        {t("nation.story.conclusion.eyebrow")}
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="text-3xl md:text-5xl font-light leading-tight"
      >
        {t("nation.story.conclusion.title")}
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 py-4"
      >
        <div className="p-2">
          <p
            className={`text-base md:text-lg uppercase tracking-wide ${NATION_STORY_TEXT.secondary} mb-3`}
          >
            {t("nation.story.conclusion.usualLabel")}
          </p>
          <p className="text-6xl md:text-8xl font-light text-blue-2 tabular-nums leading-none">
            {formatMton(metrics.territorialLatestMton, currentLanguage, 0)}
          </p>
          <p className={`text-lg md:text-xl ${NATION_STORY_TEXT.body} mt-2`}>
            {t("nation.story.unit.millionTco2e")}
          </p>
          <p className="mt-4 text-xl md:text-2xl font-medium text-blue-2 tabular-nums">
            {formatPercentChange(
              metrics.territorialChangePercent,
              currentLanguage,
            )}{" "}
            <span
              className={`text-lg font-normal ${NATION_STORY_TEXT.secondary}`}
            >
              {t("nation.story.conclusion.since1990")}
            </span>
          </p>
        </div>

        <div className="p-2">
          <p
            className={`text-base md:text-lg uppercase tracking-wide ${NATION_STORY_TEXT.secondary} mb-3`}
          >
            {t("nation.story.conclusion.fullLabel")}
          </p>
          <p className="text-6xl md:text-8xl font-light text-pink-3 tabular-nums leading-none">
            {formatMton(metrics.combinedLatestMton, currentLanguage, 0)}
          </p>
          <p className={`text-lg md:text-xl ${NATION_STORY_TEXT.body} mt-2`}>
            {t("nation.story.unit.millionTco2e")}
          </p>
          <p className="mt-4 text-xl md:text-2xl font-medium text-pink-3 tabular-nums">
            {formatPercentChange(
              metrics.combinedChangePercent,
              currentLanguage,
            )}{" "}
            <span
              className={`text-lg font-normal ${NATION_STORY_TEXT.secondary}`}
            >
              {t("nation.story.conclusion.since1990")}
            </span>
          </p>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="text-xl md:text-2xl text-white leading-relaxed"
      >
        {t("nation.story.conclusion.body")}
      </motion.p>
    </div>
  );
}
