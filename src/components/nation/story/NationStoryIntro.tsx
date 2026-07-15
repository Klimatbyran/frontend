import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  formatMton,
  type NationStoryMetrics,
} from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";
import {
  NATION_STORY_COLORS,
  NATION_STORY_TEXT,
} from "@/components/nation/story/nationStoryColors";

type NationStoryIntroProps = {
  countryName: string;
  metrics: NationStoryMetrics;
};

const PREVIEW_LAYERS = [
  { color: NATION_STORY_COLORS.territorial, scale: 0.38 },
  { color: NATION_STORY_COLORS.production, scale: 0.52 },
  { color: NATION_STORY_COLORS.consumption, scale: 0.68 },
  { color: NATION_STORY_COLORS.biogenic, scale: 0.88 },
];

export function NationStoryIntro({
  countryName,
  metrics,
}: NationStoryIntroProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const ratio = Math.round(metrics.ratioReportedToFull);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center w-full max-w-5xl mx-auto">
      <div className="text-left space-y-4 md:space-y-5 order-2 md:order-1">
        <div className="flex items-center gap-3">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Flag_of_Sweden.svg"
            alt=""
            className="h-7 w-11 object-contain opacity-90 rounded-sm shrink-0"
          />
          <h1 className="text-3xl md:text-4xl font-light text-white">
            {countryName}
          </h1>
        </div>
        <p className={`text-base md:text-lg ${NATION_STORY_TEXT.body} leading-relaxed`}>
          {t("nation.story.intro.paragraph1")}
        </p>
        <p className={`text-base md:text-lg ${NATION_STORY_TEXT.body} leading-relaxed`}>
          {t("nation.story.intro.paragraph2")}
        </p>
        <p className="text-base md:text-lg text-white leading-relaxed font-medium">
          {t("nation.story.intro.paragraph3")}
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 order-1 md:order-2">
        <div className="relative w-52 h-52 md:w-60 md:h-60">
          {PREVIEW_LAYERS.map((layer, index) => (
            <motion.div
              key={layer.color}
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{
                backgroundColor: layer.color,
                width: `${layer.scale * 100}%`,
                height: `${layer.scale * 100}%`,
                x: "-50%",
                y: "-50%",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 * index, duration: 0.5, ease: "easeOut" }}
            />
          ))}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
            <span className="text-black font-bold text-2xl md:text-3xl tabular-nums leading-none">
              {ratio}×
            </span>
            <span className="text-black/80 text-xs md:text-sm font-semibold mt-1 leading-tight">
              {t("nation.story.intro.previewRatio")}
            </span>
          </div>
        </div>
        <p className={`text-sm ${NATION_STORY_TEXT.secondary} text-center max-w-xs`}>
          {t("nation.story.intro.previewCaption", {
            reported: formatMton(metrics.territorialLatestMton, currentLanguage, 0),
            full: formatMton(metrics.combinedLatestMton, currentLanguage, 0),
            year: metrics.latestYear,
          })}
        </p>
      </div>
    </div>
  );
}
