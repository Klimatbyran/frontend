import { useTranslation } from "react-i18next";
import { motion, useTransform, type MotionValue } from "framer-motion";
import type { NationStoryMetrics } from "@/utils/data/nationStoryMetrics";
import {
  formatMton,
  NATION_BASELINE_YEAR,
} from "@/utils/data/nationStoryMetrics";
import { formatPercentChange } from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";

// Section is 200vh → 100vh scrollable. Spread content across 0–0.95.
type NationOilExportsSectionProps = {
  metrics: NationStoryMetrics;
  scrollYProgress: MotionValue<number>;
};

export function NationOilExportsSection({
  metrics,
  scrollYProgress,
}: NationOilExportsSectionProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const headerOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0, 0.15], [28, 0]);
  const oilBarReveal = useTransform(scrollYProgress, [0.18, 0.48], [0, 1]);
  const stackReveal = useTransform(scrollYProgress, [0.42, 0.68], [0, 1]);
  const textReveal = useTransform(scrollYProgress, [0.62, 0.88], [0, 1]);

  const maxMton = metrics.combinedLatestMton + metrics.oilExportLatestMton;
  const barHeight = 260;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        style={{ opacity: headerOpacity, y: headerY }}
        className="mb-10"
      >
        <h2 className="text-3xl md:text-4xl font-light text-white mb-3">
          {t("nation.story.oil.title")}
        </h2>
        <p className="text-grey text-lg">{t("nation.story.oil.description")}</p>
      </motion.div>

      <div className="flex items-end justify-center gap-10 md:gap-16">
        <div className="flex flex-col items-center gap-3">
          <div
            className="relative flex flex-col-reverse w-28 md:w-36 rounded-t-lg overflow-hidden border border-white/10"
            style={{ height: barHeight }}
          >
            <motion.div
              className="w-full"
              style={{
                height: `${(metrics.combinedLatestMton / maxMton) * 100}%`,
                backgroundColor: "var(--orange-2)",
                opacity: 0.4,
                scaleY: stackReveal,
                transformOrigin: "bottom",
              }}
            />
            <motion.div
              className="w-full"
              style={{
                height: `${(metrics.oilExportLatestMton / maxMton) * 100}%`,
                backgroundColor: "var(--pink-3)",
                scaleY: oilBarReveal,
                transformOrigin: "bottom",
              }}
            />
          </div>
          <span className="text-xs text-grey text-center">
            {t("nation.story.oil.stackLabel")}
          </span>
        </div>

        <motion.div style={{ opacity: textReveal }} className="space-y-4 max-w-sm">
          <div>
            <p className="text-sm text-grey">{NATION_BASELINE_YEAR}</p>
            <p className="text-2xl text-white">
              {formatMton(metrics.oilExport1990Mton, currentLanguage, 0)}{" "}
              {t("nation.story.unit.mton")}
            </p>
          </div>
          <div>
            <p className="text-sm text-grey">{metrics.latestYear}</p>
            <p className="text-3xl font-light" style={{ color: "var(--pink-3)" }}>
              {formatMton(metrics.oilExportLatestMton, currentLanguage, 0)}{" "}
              {t("nation.story.unit.mton")}
            </p>
            <p className="text-sm text-grey mt-1">
              {formatPercentChange(
                metrics.oilExportChangePercent,
                currentLanguage,
                true,
              )}{" "}
              {t("nation.story.comparisons.since1990")}
            </p>
          </div>
        </motion.div>
      </div>

      <motion.p
        style={{ opacity: textReveal }}
        className="mt-12 text-grey text-lg text-center max-w-2xl mx-auto"
      >
        {t("nation.story.oil.footer")}
      </motion.p>
    </div>
  );
}
