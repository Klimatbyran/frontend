import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

/** Bounce chevron at the bottom of the first viewport only. */
export function StoryScrollHint() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const updateVisibility = () => {
      // Hide once the user has scrolled most of the way off the first screen.
      setVisible(window.scrollY < window.innerHeight * 0.55);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  const scrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
  };

  return (
    <motion.button
      type="button"
      onClick={scrollDown}
      aria-label={t("nation.story.scrollHint.label")}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      initial={false}
      animate={
        visible
          ? { opacity: [0.35, 1, 0.35], y: [0, 10, 0] }
          : { opacity: 0, y: 0 }
      }
      transition={
        visible
          ? {
              opacity: { repeat: Infinity, duration: 1.6, ease: "easeInOut" },
              y: { repeat: Infinity, duration: 1.6, ease: "easeInOut" },
            }
          : { duration: 0.35 }
      }
      className={`fixed inset-x-0 bottom-6 md:bottom-10 z-50 mx-auto flex w-fit items-center justify-center text-white/75 transition-colors hover:text-white ${visible ? "" : "pointer-events-none"}`}
    >
      <ChevronDown className="h-8 w-8" strokeWidth={2} aria-hidden />
    </motion.button>
  );
}
