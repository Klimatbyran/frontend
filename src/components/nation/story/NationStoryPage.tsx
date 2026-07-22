import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { NationBathtub } from "@/components/nation/story/NationBathtub";
import { NationConclusion } from "@/components/nation/story/NationConclusion";
import { NationEmissionsJourney } from "@/components/nation/story/NationEmissionsJourney";
import { NationIntroPunch } from "@/components/nation/story/NationIntroPunch";
import { NationStackedChart } from "@/components/nation/story/NationStackedChart";
import { StoryScrollHint } from "@/components/nation/story/StoryScrollHint";
import { NATION_STORY_TEXT } from "@/components/nation/story/nationStoryColors";
import type { NationStoryDetails } from "@/hooks/nation/useNationStoryDetails";
import type { NationStoryMetrics } from "@/utils/data/nationStoryMetrics";

type NationStoryPageProps = {
  nation: NationStoryDetails;
  metrics: NationStoryMetrics;
};

function FullScreenSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center px-4 md:px-8 py-8 md:py-10">
      <div className="w-full max-w-4xl mx-auto">{children}</div>
    </section>
  );
}

export function NationStoryPage({
  nation: _nation,
  metrics,
}: NationStoryPageProps) {
  const { t } = useTranslation();
  const conclusionRef = useRef<HTMLElement>(null);

  return (
    <div className="bg-black text-white pb-16 md:pb-24">
      {/* Intro: text + tall Sweden map side-by-side on desktop */}
      <section className="relative flex items-center justify-center min-h-[100svh] px-4 md:px-8 pt-4 md:pt-8 pb-20 md:pb-28">
        <div className="w-full max-w-4xl mx-auto pt-1 md:pt-2">
          <div className="flex flex-col items-center text-center md:text-left md:items-start gap-2 mb-4 md:mb-6">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Flag_of_Sweden.svg"
              alt=""
              className="h-8 w-12 md:h-10 md:w-16 object-contain opacity-90 rounded-sm"
            />
            <h1 className="text-2xl md:text-5xl font-light text-white">
              {t("nation.story.intro.title")}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-5 md:gap-10 items-center">
            <div className="space-y-3 md:space-y-5 text-center md:text-left order-2 md:order-1">
              <p
                className={`text-base md:text-xl ${NATION_STORY_TEXT.body} leading-snug md:leading-relaxed`}
              >
                {t("nation.story.intro.paragraph1")}
              </p>
              <p
                className={`text-sm md:text-lg ${NATION_STORY_TEXT.body} leading-snug md:leading-relaxed`}
              >
                {t("nation.story.intro.paragraph2")}
              </p>
              <p className="text-base md:text-xl text-white leading-snug md:leading-relaxed font-medium">
                {t("nation.story.intro.paragraph3")}
              </p>
            </div>

            {/* Narrow column keeps the tall silhouette from dominating */}
            <div className="order-1 md:order-2 flex justify-center md:justify-end">
              <NationIntroPunch
                metrics={metrics}
                className="w-[100px] sm:w-[112px] md:w-[128px] md:mx-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Scroll-driven journey: bubble builds up layer by layer */}
      <NationEmissionsJourney metrics={metrics} />

      {/* Bathtub metaphor – water rises with each year's emissions */}
      <NationBathtub data={metrics.bathtubData} />

      {/* Mid-story conclusion before the stacked historic chart */}
      <FullScreenSection>
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.4 }}
            className={`text-sm md:text-lg uppercase tracking-widest ${NATION_STORY_TEXT.eyebrow}`}
          >
            {t("nation.story.interlude.eyebrow")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-2xl md:text-5xl font-light leading-tight"
          >
            {t("nation.story.interlude.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className={`text-base md:text-2xl ${NATION_STORY_TEXT.body} leading-snug md:leading-relaxed`}
          >
            {t("nation.story.interlude.body")}
          </motion.p>
        </div>
      </FullScreenSection>

      {/* Historic emissions: pinned, layers reveal on scroll */}
      <NationStackedChart data={metrics.stackData} />

      {/* Conclusion – the punchline tying the journey together */}
      <section
        ref={conclusionRef}
        className="relative min-h-[80vh] flex items-center justify-center px-4 md:px-8 py-10"
      >
        <div className="w-full max-w-4xl mx-auto">
          <NationConclusion metrics={metrics} />
        </div>
      </section>

      <StoryScrollHint endRef={conclusionRef} />
    </div>
  );
}
