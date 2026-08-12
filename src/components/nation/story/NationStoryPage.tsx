import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { NationBathtub } from "@/components/nation/story/NationBathtub";
import { NationConclusion } from "@/components/nation/story/NationConclusion";
import { NationEmissionsJourney } from "@/components/nation/story/NationEmissionsJourney";
import { NationIntroPunch } from "@/components/nation/story/NationIntroPunch";
import { NationStackedChart } from "@/components/nation/story/NationStackedChart";
import { StoryNavChrome } from "@/components/nation/story/StoryNavChrome";
import { StoryScrollHint } from "@/components/nation/story/StoryScrollHint";
import { useStoryAutoSnap } from "@/components/nation/story/useStoryAutoSnap";
import {
  NATION_STORY_TEXT,
  NATION_STORY_TYPE,
} from "@/components/nation/story/nationStoryColors";
import type { NationStoryDetails } from "@/hooks/nation/useNationStoryDetails";
import type { NationStoryMetrics } from "@/utils/data/nationStoryMetrics";

type NationStoryPageProps = {
  nation: NationStoryDetails;
  metrics: NationStoryMetrics;
};

function FullScreenSection({
  chapter,
  children,
}: {
  chapter: string;
  children: React.ReactNode;
}) {
  return (
    <section
      data-story-section
      data-story-chapter={chapter}
      className="relative min-h-[100svh] flex items-center justify-center px-4 md:px-8 pt-[var(--story-stage-pad-top)] pb-[var(--story-stage-pad-bottom)] md:py-10 lg:py-8"
    >
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
  useStoryAutoSnap();

  return (
    <div className="bg-black text-white pb-10 md:pb-24">
      <StoryNavChrome endRef={conclusionRef} />

      <section
        data-story-section
        data-story-chapter="intro"
        className="relative flex h-[100svh] min-h-0 flex-col items-center justify-center px-4 md:px-8 pt-[var(--story-hero-pad-top)] md:pt-44 pb-[var(--story-hero-pad-bottom)] md:pb-20 overflow-x-hidden"
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_38%,var(--black-2)_0%,var(--black-3)_78%)]"
        />
        <div className="relative w-full max-w-5xl mx-auto shrink-0 text-center space-y-1.5 max-md:space-y-1 story-short:space-y-0.5 md:space-y-4">
          <h1 className={`${NATION_STORY_TYPE.heroTitle} text-white`}>
            {t("nation.story.intro.title")}
          </h1>
          <p
            className={`${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body} max-w-2xl mx-auto`}
          >
            {t("nation.story.intro.paragraph1")}
          </p>
          <div className="pt-2 max-md:pt-1.5 story-short:pt-1 md:pt-10">
            <NationIntroPunch metrics={metrics} />
          </div>
        </div>
      </section>

      <NationEmissionsJourney metrics={metrics} />
      <NationBathtub data={metrics.bathtubData} />

      <FullScreenSection chapter="interlude">
        <div className="max-w-2xl mx-auto text-center space-y-5 story-short:space-y-3 md:space-y-4 lg:space-y-5">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className={NATION_STORY_TYPE.title}
          >
            {t("nation.story.interlude.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className={`${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body}`}
          >
            {t("nation.story.interlude.body")}
          </motion.p>
        </div>
      </FullScreenSection>

      <NationStackedChart data={metrics.stackData} />

      <section
        ref={conclusionRef}
        data-story-section
        data-story-chapter="conclusion"
        className="relative min-h-[100svh] flex items-center justify-center px-4 md:px-8 pt-[var(--story-stage-pad-top)] md:pt-20 lg:pt-16 pb-[var(--story-stage-pad-bottom)] md:pb-10 lg:pb-8 overflow-x-hidden"
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,var(--black-2)_0%,var(--black-3)_78%)]"
        />
        <div className="relative w-full max-w-4xl mx-auto md:pt-6 lg:pt-4">
          <NationConclusion metrics={metrics} />
        </div>
      </section>

      <StoryScrollHint endRef={conclusionRef} />
    </div>
  );
}
