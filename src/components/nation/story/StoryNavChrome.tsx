import { useEffect, useState, type RefObject } from "react";
import { ChevronUp } from "lucide-react";
import { motion, useScroll } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useStoryEndReached } from "@/components/nation/story/useStoryEndReached";
import { advanceStoryBeat } from "@/components/nation/story/useStoryAutoSnap";
import { useStorySectionState } from "@/components/nation/story/useStorySectionState";
import {
  NATION_STORY_TEXT,
  NATION_STORY_TYPE,
} from "@/components/nation/story/nationStoryColors";

const ONBOARDING_DESKTOP_KEY = "valet2026-story-onboarding-desktop";
const ONBOARDING_MOBILE_KEY = "valet2026-story-onboarding-mobile";
const FREE_SCROLL_CUE_KEY = "valet2026-story-free-scroll-cue";

function StoryProgressBar({
  endReached,
  sectionState,
}: {
  endReached: boolean;
  sectionState: ReturnType<typeof useStorySectionState>;
}) {
  const { scrollYProgress } = useScroll();
  const { t } = useTranslation();
  const chapter = sectionState.sections[sectionState.active]?.chapter;
  const chapterLabel = chapter ? t(`nation.story.chapters.${chapter}`) : null;

  return (
    <div className="hidden md:flex fixed top-12 left-0 right-0 z-40 h-8 items-center px-4 pointer-events-none">
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 origin-left bg-gradient-to-r from-orange-3 to-pink-3"
        style={{ scaleX: scrollYProgress }}
      />
      {chapterLabel && !endReached && (
        <span
          className={`relative mt-2 ${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary}`}
        >
          {chapterLabel}
          {sectionState.sections[sectionState.active]?.steps > 1 && (
            <span className="text-white/50">
              {" "}
              · {sectionState.sections[sectionState.active].step + 1}/
              {sectionState.sections[sectionState.active].steps}
            </span>
          )}
        </span>
      )}
    </div>
  );
}

function StoryMobileProgress({
  endReached,
  sectionState,
}: {
  endReached: boolean;
  sectionState: ReturnType<typeof useStorySectionState>;
}) {
  const { t } = useTranslation();
  const section = sectionState.sections[sectionState.active];
  if (endReached || !section) return null;

  const chapter = t(`nation.story.chapters.${section.chapter}`);
  const label =
    section.steps > 1
      ? `${chapter} · ${section.step + 1}/${section.steps}`
      : chapter;

  return (
    <motion.p
      key={`${sectionState.active}-${section.step}`}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`pointer-events-none fixed z-40 max-w-[min(11rem,52vw)] truncate md:hidden ${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary}`}
      style={{
        top: "calc(var(--story-site-header) + 0.35rem + env(safe-area-inset-top, 0px))",
        left: "calc(0.75rem + env(safe-area-inset-left, 0px))",
      }}
      aria-live="polite"
    >
      {label}
    </motion.p>
  );
}

function StorySectionDots({
  section,
  index,
  activeIndex,
}: {
  section: ReturnType<typeof useStorySectionState>["sections"][number];
  index: number;
  activeIndex: number;
}) {
  const isActive = index === activeIndex;
  const isPast = index < activeIndex;

  if (isActive && section.steps > 1) {
    return (
      <span className="flex flex-col items-center gap-1">
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
      className="rounded-full transition-all duration-300"
      style={{
        width: isActive ? 10 : 6,
        height: isActive ? 10 : 6,
        backgroundColor: isActive
          ? "var(--blue-2)"
          : isPast
            ? "rgba(153,207,255,0.45)"
            : "rgba(255,255,255,0.2)",
      }}
    />
  );
}

function StoryStepDots({
  endReached,
  sectionState,
}: {
  endReached: boolean;
  sectionState: ReturnType<typeof useStorySectionState>;
}) {
  const visible = !endReached && sectionState.sections.length > 0;

  return (
    <motion.div
      aria-hidden
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.35 }}
      className={`fixed top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-2 md:flex ${visible ? "" : "pointer-events-none"}`}
      style={{ right: "var(--story-rail-inset)" }}
    >
      {sectionState.sections.map((section, index) => (
        <StorySectionDots
          key={index}
          section={section}
          index={index}
          activeIndex={sectionState.active}
        />
      ))}
    </motion.div>
  );
}

function StoryOnboardingHint({ endReached }: { endReached: boolean }) {
  const { t } = useTranslation();
  const [hint, setHint] = useState<"desktop" | "mobile" | null>(null);

  useEffect(() => {
    if (endReached) return;
    const desktop = window.matchMedia("(min-width: 768px)").matches;
    const key = desktop ? ONBOARDING_DESKTOP_KEY : ONBOARDING_MOBILE_KEY;
    if (localStorage.getItem(key)) return;
    setHint(desktop ? "desktop" : "mobile");
  }, [endReached]);

  if (!hint) return null;

  const dismiss = () => {
    localStorage.setItem(
      hint === "desktop" ? ONBOARDING_DESKTOP_KEY : ONBOARDING_MOBILE_KEY,
      "1",
    );
    setHint(null);
  };

  return (
    <div className="fixed inset-x-4 top-[calc(var(--story-site-header)+var(--story-chapter-band)+0.75rem+env(safe-area-inset-top,0px))] z-50 mx-auto flex max-w-md items-start gap-3 rounded-lg border border-white/15 bg-black/90 px-4 py-3 backdrop-blur-sm md:top-[calc(var(--story-site-header)+1rem+env(safe-area-inset-top,0px))] md:left-auto md:right-6 md:mx-0">
      <p
        className={`flex-1 ${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body}`}
      >
        {hint === "desktop"
          ? t("nation.story.nav.onboardingDesktop")
          : t("nation.story.nav.onboardingMobile")}
      </p>
      <button
        type="button"
        onClick={dismiss}
        className={`shrink-0 ${NATION_STORY_TYPE.meta} text-blue-2 hover:text-white`}
      >
        {t("nation.story.nav.dismiss")}
      </button>
    </div>
  );
}

function StoryConclusionCue({ endReached }: { endReached: boolean }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!endReached) {
      setVisible(false);
      return;
    }
    if (localStorage.getItem(FREE_SCROLL_CUE_KEY)) return;
    setVisible(true);
    const timer = window.setTimeout(() => {
      localStorage.setItem(FREE_SCROLL_CUE_KEY, "1");
      setVisible(false);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [endReached]);

  if (!visible) return null;

  return (
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`pointer-events-none fixed inset-x-0 z-40 mx-auto w-fit max-w-[90vw] rounded-full border border-white/10 bg-black/75 px-4 py-2 text-center backdrop-blur-sm ${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.body}`}
      style={{ bottom: "calc(var(--story-bottom-reserve) + 0.5rem)" }}
    >
      {t("nation.story.nav.freeScrollCue")}
    </motion.p>
  );
}

export function StoryPreviousSectionButton({
  className = "mx-auto mb-2",
}: {
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => advanceStoryBeat(-1)}
      className={`flex items-center gap-1.5 ${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary} transition-colors hover:text-white ${className}`}
    >
      <ChevronUp className="h-4 w-4" aria-hidden />
      {t("nation.story.nav.previousSection")}
    </button>
  );
}

function StoryPreviousSectionNav({
  endReached,
  sectionState,
}: {
  endReached: boolean;
  sectionState: ReturnType<typeof useStorySectionState>;
}) {
  const chapter = sectionState.sections[sectionState.active]?.chapter;
  if (endReached || chapter !== "conclusion") return null;

  return (
    <div
      className="fixed z-40 hidden md:block left-4"
      style={{
        top: "calc(var(--story-site-header) + 2.25rem + env(safe-area-inset-top, 0px))",
      }}
    >
      <StoryPreviousSectionButton className="" />
    </div>
  );
}

export function StoryNavChrome({
  endRef,
}: {
  endRef: RefObject<HTMLElement | null>;
}) {
  const endReached = useStoryEndReached(endRef);
  const sectionState = useStorySectionState();

  return (
    <>
      <StoryProgressBar endReached={endReached} sectionState={sectionState} />
      <StoryMobileProgress
        endReached={endReached}
        sectionState={sectionState}
      />
      <StoryStepDots endReached={endReached} sectionState={sectionState} />
      <StoryPreviousSectionNav
        endReached={endReached}
        sectionState={sectionState}
      />
      <StoryOnboardingHint endReached={endReached} />
      <StoryConclusionCue endReached={endReached} />
    </>
  );
}
