import { useRef, type RefObject } from "react";
import { ChevronDown } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";

type StoryScrollHintProps = {
  /** Hide the hint once this element (typically the conclusion) enters the viewport. */
  endRef: RefObject<HTMLElement | null>;
};

export function StoryScrollHint({ endRef }: StoryScrollHintProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLButtonElement>(null);
  const endReached = useInView(endRef, { amount: 0.35 });

  const scrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.75, behavior: "smooth" });
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={scrollDown}
      aria-label={t("nation.story.scrollHint.label")}
      aria-hidden={endReached}
      tabIndex={endReached ? -1 : 0}
      initial={false}
      animate={
        endReached
          ? { opacity: 0, y: 0 }
          : { opacity: [0.35, 1, 0.35], y: [0, 10, 0] }
      }
      transition={
        endReached
          ? { duration: 0.35 }
          : {
              opacity: { repeat: Infinity, duration: 1.6, ease: "easeInOut" },
              y: { repeat: Infinity, duration: 1.6, ease: "easeInOut" },
            }
      }
      className={`fixed inset-x-0 bottom-6 md:bottom-10 z-50 mx-auto flex w-fit items-center justify-center text-white/75 transition-colors hover:text-white ${endReached ? "pointer-events-none" : ""}`}
    >
      <ChevronDown className="h-8 w-8" strokeWidth={2} aria-hidden />
    </motion.button>
  );
}
