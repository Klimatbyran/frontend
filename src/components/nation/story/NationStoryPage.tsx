import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { NationBathtub } from "@/components/nation/story/NationBathtub";
import { NationConclusion } from "@/components/nation/story/NationConclusion";
import { NationEmissionsJourney } from "@/components/nation/story/NationEmissionsJourney";
import { NationIntroHero } from "@/components/nation/story/NationIntroPunch";
import { NationParisBudgetBathtub } from "@/components/nation/story/NationParisBudgetBathtub";
import { NationParisVerdict } from "@/components/nation/story/NationParisVerdict";
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
      className="relative min-h-[100svh] flex items-center justify-center px-4 md:px-8 pt-[var(--story-stage-pad-top)] pb-[var(--story-stage-pad-bottom)] md:py-8 story-compact:py-6 lg:py-10 xl:py-8"
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
        className="relative flex h-[100svh] min-h-0 flex-col items-center justify-center px-4 md:px-8 pt-[var(--story-hero-pad-top)] md:pt-28 story-compact:pt-24 lg:pt-36 xl:pt-44 pb-[var(--story-hero-pad-bottom)] md:pb-16 story-compact:pb-14 lg:pb-20 overflow-x-hidden"
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_38%,var(--black-2)_0%,var(--black-3)_78%)]"
        />
        <NationIntroHero metrics={metrics} />
      </section>

      <NationEmissionsJourney metrics={metrics} />

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
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className={`${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body} space-y-4 md:space-y-5`}
          >
            <p>{t("nation.story.interlude.body")}</p>
            <p>{t("nation.story.interlude.body2")}</p>
          </motion.div>
        </div>
      </FullScreenSection>

      <NationStackedChart data={metrics.stackData} />

      <NationParisVerdict />

      <FullScreenSection chapter="bathtubBridge">
        <div className="max-w-2xl mx-auto text-center space-y-5 story-short:space-y-3 md:space-y-4 lg:space-y-5">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className={NATION_STORY_TYPE.title}
          >
            {t("nation.story.bathtubBridge.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className={`${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body}`}
          >
            {t("nation.story.bathtubBridge.body")}
          </motion.p>
        </div>
      </FullScreenSection>

      <NationBathtub data={metrics.bathtubData} />

      <NationParisBudgetBathtub />

      <section
        ref={conclusionRef}
        data-story-section
        data-story-chapter="conclusion"
        className="relative min-h-[100svh] flex items-center justify-center px-4 md:px-8 pt-[var(--story-stage-pad-top)] md:pt-14 story-compact:pt-12 lg:pt-20 xl:pt-16 pb-[var(--story-stage-pad-bottom)] md:pb-8 story-compact:pb-7 lg:pb-10 xl:pb-8 overflow-x-hidden"
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,var(--black-2)_0%,var(--black-3)_78%)]"
        />
        <div className="relative w-full max-w-4xl md:max-w-7xl mx-auto md:pt-6 lg:pt-4">
          <NationConclusion metrics={metrics} />
        </div>
      </section>

      <StoryScrollHint endRef={conclusionRef} />
    </div>
  );
}
