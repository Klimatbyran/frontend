import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  formatMton,
  type NationStoryMetrics,
} from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";
import { NATION_STORY_COLORS } from "@/components/nation/story/nationStoryColors";
import {
  SWEDEN_OUTLINE_PATH,
  SWEDEN_OUTLINE_VIEWBOX,
} from "@/components/nation/story/swedenOutlinePath";

type NationIntroPunchProps = {
  metrics: NationStoryMetrics;
};

export function NationIntroPunch({ metrics }: NationIntroPunchProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const reportedValue = metrics.territorialLatestMton;
  const fullValue = Math.max(metrics.combinedLatestMton, reportedValue);
  const reported = formatMton(reportedValue, currentLanguage, 0);
  const full = formatMton(fullValue, currentLanguage, 0);
  const innerScale = Math.sqrt(reportedValue / fullValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.45 }}
    >
      {/*
        Fluid height: small phones stay compact, short laptops shrink,
        large desktops can grow toward the original silhouette size.
      */}
      <div className="relative mx-auto h-[clamp(120px,26svh,180px)] md:h-[clamp(180px,30svh,340px)] w-auto aspect-[100/220]">
        <svg
          viewBox={SWEDEN_OUTLINE_VIEWBOX}
          className="h-full w-auto max-w-full mx-auto"
          role="img"
          aria-label={`${reported}–${full} ${t("nation.story.unit.mton")}`}
        >
          <motion.path
            d={SWEDEN_OUTLINE_PATH}
            fill={NATION_STORY_COLORS.consumption}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "50% 50%" }}
          />
          <motion.g
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: innerScale }}
            transition={{
              duration: 0.5,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ transformOrigin: "50% 45%" }}
          >
            <path
              d={SWEDEN_OUTLINE_PATH}
              fill={NATION_STORY_COLORS.territorial}
            />
          </motion.g>

          <text
            x="50"
            y="96"
            textAnchor="middle"
            className="fill-black font-semibold"
            style={{ fontSize: 18 }}
          >
            {reported}
          </text>
          <text
            x="50"
            y="110"
            textAnchor="middle"
            className="fill-black/70 font-medium"
            style={{ fontSize: 9 }}
          >
            {t("nation.story.unit.mton")}
          </text>

          <text
            x="72"
            y="168"
            textAnchor="middle"
            className="fill-white font-semibold"
            style={{ fontSize: 15 }}
          >
            {full}
          </text>
          <text
            x="72"
            y="180"
            textAnchor="middle"
            className="fill-white/85 font-medium"
            style={{ fontSize: 8 }}
          >
            {t("nation.story.unit.mton")}
          </text>
        </svg>
      </div>
    </motion.div>
  );
}
