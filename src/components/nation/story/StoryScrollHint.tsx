import { useEffect, useRef, useState, type RefObject } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useStoryEndReached } from "@/components/nation/story/useStoryEndReached";
import { advanceStoryBeat } from "@/components/nation/story/useStoryAutoSnap";

type StoryScrollHintProps = {
  /** Hide the hint once this element (typically the conclusion) enters the viewport. */
  endRef: RefObject<HTMLElement | null>;
};

/** Fixed pulsing chevron shown through the story until the conclusion. */
export function StoryScrollHint({ endRef }: StoryScrollHintProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLButtonElement>(null);
  const endReached = useStoryEndReached(endRef);

  // Hidden while the reader is actively scrolling/swiping – the hint is an
  // idle-state affordance. Reappears shortly after the page settles.
  const [scrolling, setScrolling] = useState(false);
  const settleTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    const onScroll = () => {
      setScrolling(true);
      if (settleTimeoutRef.current) {
        window.clearTimeout(settleTimeoutRef.current);
      }
      settleTimeoutRef.current = window.setTimeout(
        () => setScrolling(false),
        650,
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (settleTimeoutRef.current) {
        window.clearTimeout(settleTimeoutRef.current);
      }
    };
  }, []);

  const visible = !endReached && !scrolling;

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={() => advanceStoryBeat(1)}
      aria-label={t("nation.story.scrollHint.label")}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      initial={false}
      animate={visible ? { opacity: [0.35, 1, 0.35] } : { opacity: 0 }}
      transition={
        visible
          ? {
              opacity: { repeat: Infinity, duration: 1.8, ease: "easeInOut" },
            }
          : { duration: 0.35 }
      }
      className={`fixed inset-x-0 bottom-4 md:bottom-6 z-50 mx-auto flex w-fit flex-col items-center justify-center gap-0 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] transition-colors hover:text-blue-2 ${visible ? "" : "pointer-events-none"}`}
    >
      <ChevronDown
        className="h-6 w-6 md:h-7 md:w-7"
        strokeWidth={2}
        aria-hidden
      />
      <span className="text-[11px] md:text-xs font-medium tracking-wide">
        <span className="md:hidden">{t("nation.story.scrollHint.swipe")}</span>
        <span className="hidden md:inline">
          {t("nation.story.scrollHint.scroll")}
        </span>
      </span>
    </motion.button>
  );
}
