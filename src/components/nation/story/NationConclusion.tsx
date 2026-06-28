import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import type { NationStoryMetrics } from "@/utils/data/nationStoryMetrics";
import { formatMton } from "@/utils/data/nationStoryMetrics";
import { formatPercentChange } from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";

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
        className="text-sm uppercase tracking-widest text-grey"
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
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2"
      >
        <div className="p-2">
          <p className="text-xs uppercase tracking-wide text-grey mb-2">
            {t("nation.story.conclusion.usualLabel")}
          </p>
          <p className="text-4xl md:text-5xl font-light text-blue-3 tabular-nums">
            {formatMton(metrics.territorialLatestMton, currentLanguage, 0)}
            <span className="text-base text-grey ml-2">
              {t("nation.story.unit.millionTco2e")}
            </span>
          </p>
          <p className="mt-2 text-sm text-blue-3">
            {formatPercentChange(
              metrics.territorialChangePercent,
              currentLanguage,
            )}{" "}
            {t("nation.story.conclusion.since1990")}
          </p>
        </div>

        <div className="p-2">
          <p className="text-xs uppercase tracking-wide text-grey mb-2">
            {t("nation.story.conclusion.fullLabel")}
          </p>
          <p className="text-4xl md:text-5xl font-light text-pink-3 tabular-nums">
            {formatMton(metrics.combinedLatestMton, currentLanguage, 0)}
            <span className="text-base text-grey ml-2">
              {t("nation.story.unit.millionTco2e")}
            </span>
          </p>
          <p className="mt-2 text-sm text-pink-3">
            {formatPercentChange(
              metrics.combinedChangePercent,
              currentLanguage,
            )}{" "}
            {t("nation.story.conclusion.since1990")}
          </p>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="text-lg md:text-xl text-white leading-relaxed"
      >
        {t("nation.story.conclusion.body")}
      </motion.p>
    </div>
  );
}
