import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { NationConclusion } from "@/components/nation/story/NationConclusion";
import { NationEmissionsJourney } from "@/components/nation/story/NationEmissionsJourney";
import { NationStackedChart } from "@/components/nation/story/NationStackedChart";
import { StoryScrollHint } from "@/components/nation/story/StoryScrollHint";
import { StoryStageProvider } from "@/components/nation/story/storyStageContext";
import { NATION_STORY_TEXT } from "@/components/nation/story/nationStoryColors";
import { useLanguage } from "@/components/LanguageProvider";
import type { NationStoryDetails } from "@/hooks/nation/useNationStoryDetails";
import type { NationStoryMetrics } from "@/utils/data/nationStoryMetrics";

type NationStoryPageProps = {
  nation: NationStoryDetails;
  metrics: NationStoryMetrics;
};

function FullScreenSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center px-4 md:px-8 py-10">
      <div className="w-full max-w-4xl mx-auto">{children}</div>
    </section>
  );
}

export function NationStoryPage({ nation, metrics }: NationStoryPageProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const countryName = nation.country[currentLanguage];
  const conclusionRef = useRef<HTMLElement>(null);

  return (
    <StoryStageProvider>
      <div className="bg-black text-white pb-24">
        {/* Intro */}
        <section className="relative flex items-start justify-center min-h-screen px-4 md:px-8 pt-16 md:pt-24 pb-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Flag_of_Sweden.svg"
              alt=""
              className="h-12 w-20 mx-auto object-contain opacity-90 rounded-sm"
            />
            <h1 className="text-5xl md:text-7xl font-light">{countryName}</h1>
            <h2 className="text-2xl md:text-4xl font-light text-white/90">
              {t("nation.story.intro.title")}
            </h2>
            <p
              className={`text-xl md:text-2xl ${NATION_STORY_TEXT.body} leading-relaxed`}
            >
              {t("nation.story.intro.paragraph1")}
            </p>
            <p
              className={`text-xl md:text-2xl ${NATION_STORY_TEXT.body} leading-relaxed`}
            >
              {t("nation.story.intro.paragraph2")}
            </p>
            <p className="text-xl md:text-2xl text-white leading-relaxed font-medium">
              {t("nation.story.intro.paragraph3")}
            </p>
          </div>
        </section>

        {/* Scroll-driven journey: bubble builds up layer by layer */}
        <NationEmissionsJourney metrics={metrics} />

        {/* Bathtub metaphor – after the bubble journey */}
        <FullScreenSection>
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.5 }}
              className={`text-xl md:text-2xl ${NATION_STORY_TEXT.body} leading-relaxed`}
            >
              {t("nation.story.bathtub.text")}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-2xl md:text-3xl text-white font-light leading-snug"
            >
              {t("nation.story.bathtub.question")}
            </motion.p>
          </div>
        </FullScreenSection>

        {/* Mid-story conclusion before the stacked historic chart */}
        <FullScreenSection>
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.4 }}
              className={`text-base md:text-lg uppercase tracking-widest ${NATION_STORY_TEXT.eyebrow}`}
            >
              {t("nation.story.interlude.eyebrow")}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="text-3xl md:text-5xl font-light leading-tight"
            >
              {t("nation.story.interlude.title")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className={`text-xl md:text-2xl ${NATION_STORY_TEXT.body} leading-relaxed`}
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
    </StoryStageProvider>
  );
}
