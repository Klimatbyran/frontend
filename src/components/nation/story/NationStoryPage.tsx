import { useEffect, useRef, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { motion, useScroll } from "framer-motion";
import { useStoryEndReached } from "@/components/nation/story/useStoryEndReached";
import { NationBathtub } from "@/components/nation/story/NationBathtub";
import { NationConclusion } from "@/components/nation/story/NationConclusion";
import { NationEmissionsJourney } from "@/components/nation/story/NationEmissionsJourney";
import { NationIntroPunch } from "@/components/nation/story/NationIntroPunch";
import { NationStackedChart } from "@/components/nation/story/NationStackedChart";
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

/**
 * Thin reading-progress bar just below the fixed site header.
 * Desktop only – on mobile the step-dots timeline is the single progress cue.
 */
function StoryProgressBar() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      aria-hidden
      className="hidden md:block fixed top-12 left-0 right-0 z-40 h-0.5 origin-left bg-gradient-to-r from-orange-3 to-pink-3"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

type StorySectionState = {
  /** index of the section currently at the probe line */
  active: number;
  /** per-section state: number of pin-steps and the current step */
  sections: Array<{ steps: number; step: number }>;
};

/**
 * Fixed right-edge timeline: one dot per story chapter, so readers see the
 * story is a sequence of scenes that advance on scroll. Multi-step chapters
 * (onion, bathtub, stacked chart) show their inner steps as a segmented bar
 * while active. Reads the `data-story-*` attributes the sections already
 * expose; hides once the conclusion is in view. Mobile only – desktop uses
 * the top reading-progress bar instead.
 */
function StoryStepDots({ endRef }: { endRef: RefObject<HTMLElement | null> }) {
  const endReached = useStoryEndReached(endRef);
  const [state, setState] = useState<StorySectionState>({
    active: 0,
    sections: [],
  });

  useEffect(() => {
    const update = () => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-story-section]"),
      );
      const probeY = window.innerHeight * 0.45;
      let active = 0;
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= probeY) active = index;
      });
      setState({
        active,
        sections: sections.map((section) => ({
          steps: Number(section.dataset.storySteps ?? "1"),
          step: Number(section.dataset.storyStep ?? "0"),
        })),
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const visible = !endReached && state.sections.length > 0;

  return (
    <motion.div
      aria-hidden
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.35 }}
      className={`md:hidden fixed right-2 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2 ${visible ? "" : "pointer-events-none"}`}
    >
      {state.sections.map((section, index) => {
        const isActive = index === state.active;
        if (isActive && section.steps > 1) {
          // Active multi-step chapter: segmented bar showing the inner steps
          return (
            <span key={index} className="flex flex-col items-center gap-1">
              {Array.from({ length: section.steps }, (_, stepIndex) => (
                <span
                  key={stepIndex}
                  className="w-1.5 rounded-full transition-colors duration-300"
                  style={{
                    height: 10,
                    backgroundColor:
                      stepIndex <= section.step
                        ? "var(--blue-2)"
                        : "rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </span>
          );
        }
        return (
          <span
            key={index}
            className="rounded-full transition-all duration-300"
            style={{
              width: isActive ? 10 : 6,
              height: isActive ? 10 : 6,
              backgroundColor: isActive
                ? "var(--blue-2)"
                : index < state.active
                  ? "rgba(153,207,255,0.45)"
                  : "rgba(255,255,255,0.2)",
            }}
          />
        );
      })}
    </motion.div>
  );
}

function FullScreenSection({ children }: { children: React.ReactNode }) {
  return (
    <section
      data-story-section
      className="relative min-h-[100svh] flex items-center justify-center px-4 md:px-8 py-12 md:py-16"
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
      <StoryProgressBar />

      {/* Intro hero – one landing view: eyebrow, headline and lede up top,
          then the silhouette with callouts, then the explanation paragraphs. */}
      <section
        data-story-section
        className="relative min-h-[100svh] flex flex-col items-center justify-start px-4 md:px-8 pt-[clamp(4.5rem,17svh,9rem)] md:pt-44 pb-28 md:pb-20 overflow-hidden"
      >
        {/* Subtle depth behind the hero, using existing surface colors only */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_38%,var(--black-2)_0%,var(--black-3)_78%)]"
        />
        <div className="relative max-w-5xl mx-auto text-center space-y-2.5 md:space-y-4">
          <h1 className="text-4xl md:text-6xl font-light tracking-tight text-white">
            {t("nation.story.intro.title")}
          </h1>
          <p
            className={`${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body} max-w-2xl mx-auto`}
          >
            {t("nation.story.intro.paragraph1")}
          </p>
          {/* Extra breathing room between the copy and the map */}
          <div className="pt-6 md:pt-10">
            <NationIntroPunch metrics={metrics} />
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
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className={NATION_STORY_TYPE.title}
          >
            {t("nation.story.interlude.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className={`${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body}`}
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
        data-story-section
        className="relative min-h-[100svh] flex items-center justify-center px-4 md:px-8 pt-24 pb-12 md:py-16 overflow-hidden"
      >
        {/* Same depth backdrop as the hero – the story ends where it began */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,var(--black-2)_0%,var(--black-3)_78%)]"
        />
        <div className="relative w-full max-w-4xl mx-auto">
          <NationConclusion metrics={metrics} />
        </div>
      </section>

      <StoryScrollHint endRef={conclusionRef} />
      <StoryStepDots endRef={conclusionRef} />
    </div>
  );
}
