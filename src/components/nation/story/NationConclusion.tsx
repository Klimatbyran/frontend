import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
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

export function NationConclusion({ metrics }: NationConclusionProps) {
  const { t } = useTranslation();
  const { currentLanguage, getLocalizedPath } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto text-center space-y-5 md:space-y-8">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.4 }}
        className={`${NATION_STORY_TYPE.eyebrow} ${NATION_STORY_TEXT.eyebrow}`}
      >
        {t("nation.story.conclusion.eyebrow")}
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className={`${NATION_STORY_TYPE.title} leading-tight`}
      >
        {t("nation.story.conclusion.title")}
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-12 py-2 md:py-4"
      >
        <div className="p-1 md:p-2">
          <p
            className={`${NATION_STORY_TYPE.eyebrow} ${NATION_STORY_TEXT.secondary} mb-2 md:mb-3`}
          >
            {t("nation.story.conclusion.usualLabel")}
          </p>
          <p className={`${NATION_STORY_TYPE.display} text-blue-2`}>
            {formatMton(metrics.territorialLatestMton, currentLanguage, 0)}
          </p>
          <p
            className={`${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body} mt-1.5 md:mt-2`}
          >
            {t("nation.story.unit.millionTco2e")}
          </p>
          <p
            className={`mt-3 md:mt-4 ${NATION_STORY_TYPE.emphasis} text-blue-2 tabular-nums`}
          >
            {formatPercentChange(
              metrics.territorialChangePercent,
              currentLanguage,
            )}{" "}
            <span
              className={`font-normal ${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary}`}
            >
              {t("nation.story.conclusion.since1990")}
            </span>
          </p>
        </div>

        <div className="p-1 md:p-2">
          <p
            className={`${NATION_STORY_TYPE.eyebrow} ${NATION_STORY_TEXT.secondary} mb-2 md:mb-3`}
          >
            {t("nation.story.conclusion.fullLabel")}
          </p>
          <p className={`${NATION_STORY_TYPE.display} text-pink-3`}>
            {formatMton(metrics.combinedLatestMton, currentLanguage, 0)}
          </p>
          <p
            className={`${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body} mt-1.5 md:mt-2`}
          >
            {t("nation.story.unit.millionTco2e")}
          </p>
          <p
            className={`mt-3 md:mt-4 ${NATION_STORY_TYPE.emphasis} text-pink-3 tabular-nums`}
          >
            {formatPercentChange(
              metrics.combinedChangePercent,
              currentLanguage,
            )}{" "}
            <span
              className={`font-normal ${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary}`}
            >
              {t("nation.story.conclusion.since1990")}
            </span>
          </p>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.4 }}
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
    </div>
  );
}
