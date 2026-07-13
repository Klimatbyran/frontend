import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import { NATION_STORY_TEXT } from "@/components/nation/story/nationStoryColors";

export function StoryScrollHint() {
  const { t } = useTranslation();
  const ref = useRef<HTMLButtonElement>(null);
  const isVisible = useInView(ref, { amount: 0.5 });

  const scrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.75, behavior: "smooth" });
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={scrollDown}
      aria-label={t("nation.story.scrollHint.label")}
      initial={false}
      animate={
        isVisible
          ? { opacity: [0.35, 1, 0.35], y: [0, 10, 0] }
          : { opacity: 0, y: 0 }
      }
      transition={
        isVisible
          ? {
              opacity: { repeat: Infinity, duration: 1.6, ease: "easeInOut" },
              y: { repeat: Infinity, duration: 1.6, ease: "easeInOut" },
            }
          : { duration: 0.35 }
      }
      className={`absolute bottom-6 md:bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 ${NATION_STORY_TEXT.secondary} transition-colors hover:text-white`}
    >
      <span className="text-sm md:text-base uppercase tracking-widest">
        {t("nation.story.scrollHint.text")}
      </span>
      <ChevronDown className="h-8 w-8" strokeWidth={2} aria-hidden />
    </motion.button>
  );
}
