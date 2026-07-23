import { useRef, type RefObject } from "react";
import { ChevronDown } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";

type StoryScrollHintProps = {
  /** Hide the hint once this element (typically the conclusion) enters the viewport. */
  endRef: RefObject<HTMLElement | null>;
};

/**
 * Advance one pin-step inside a multi-step section, or jump to the next
 * `[data-story-section]` when on its last step. Avoids the “black gap”
 * that a fixed scrollBy leaves at the end of tall pinned sections.
 */
function scrollToNextStoryBeat() {
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>("[data-story-section]"),
  );
  if (sections.length === 0) {
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
    return;
  }

  const probeY = window.innerHeight * 0.45;
  const currentIndex = sections.findIndex((section) => {
    const rect = section.getBoundingClientRect();
    return rect.top <= probeY && rect.bottom > probeY;
  });

  if (currentIndex >= 0) {
    const current = sections[currentIndex];
    const step = Number(current.dataset.storyStep ?? "0");
    const stepCount = Number(current.dataset.storySteps ?? "1");
    const stepVh = Number(current.dataset.storyStepVh ?? "100");

    if (stepCount > 1 && step < stepCount - 1) {
      window.scrollBy({
        top: (stepVh / 100) * window.innerHeight,
        behavior: "smooth",
      });
      return;
    }

    const next = sections[currentIndex + 1];
    if (next) {
      next.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
  }

  const nextBelow = sections.find(
    (section) => section.getBoundingClientRect().top > probeY,
  );
  if (nextBelow) {
    nextBelow.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
}

/** Fixed bounce chevron shown through the story until the conclusion. */
export function StoryScrollHint({ endRef }: StoryScrollHintProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLButtonElement>(null);
  const endReached = useInView(endRef, { amount: 0.35 });
  const visible = !endReached;

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={scrollToNextStoryBeat}
      aria-label={t("nation.story.scrollHint.label")}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      initial={false}
      animate={
        visible
          ? { opacity: [0.55, 1, 0.55], y: [0, 10, 0] }
          : { opacity: 0, y: 0 }
      }
      transition={
        visible
          ? {
              opacity: { repeat: Infinity, duration: 1.4, ease: "easeInOut" },
              y: { repeat: Infinity, duration: 1.4, ease: "easeInOut" },
            }
          : { duration: 0.35 }
      }
      className={`fixed inset-x-0 bottom-6 md:bottom-10 z-50 mx-auto flex w-fit items-center justify-center text-white/90 transition-colors hover:text-white ${visible ? "" : "pointer-events-none"}`}
    >
      <ChevronDown className="h-9 w-9" strokeWidth={2.25} aria-hidden />
    </motion.button>
  );
}
