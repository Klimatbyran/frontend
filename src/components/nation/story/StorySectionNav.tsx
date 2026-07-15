import { useCallback, useEffect, useState, type RefObject } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";

type StorySectionNavProps = {
  sectionRefs: RefObject<HTMLElement | null>[];
  endRef: RefObject<HTMLElement | null>;
};

function getSectionOffsets(refs: RefObject<HTMLElement | null>[]) {
  return refs
    .map((ref) => ref.current)
    .filter((el): el is HTMLElement => el != null)
    .map((el) => el.getBoundingClientRect().top + window.scrollY);
}

export function StorySectionNav({
  sectionRefs,
  endRef,
}: StorySectionNavProps) {
  const { t } = useTranslation();
  const endReached = useInView(endRef, { amount: 0.35 });
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(true);

  const updateNavState = useCallback(() => {
    const offsets = getSectionOffsets(sectionRefs);
    if (offsets.length === 0) return;

    const probe = window.scrollY + window.innerHeight * 0.2;
    const first = offsets[0];
    const last = offsets[offsets.length - 1];

    setCanScrollUp(probe > first + 80);
    setCanScrollDown(probe < last - 80 && !endReached);
  }, [sectionRefs, endReached]);

  useEffect(() => {
    updateNavState();
    window.addEventListener("scroll", updateNavState, { passive: true });
    window.addEventListener("resize", updateNavState);
    return () => {
      window.removeEventListener("scroll", updateNavState);
      window.removeEventListener("resize", updateNavState);
    };
  }, [updateNavState]);

  const scrollBySection = (direction: "up" | "down") => {
    const offsets = getSectionOffsets(sectionRefs);
    if (offsets.length === 0) return;

    const probe = window.scrollY + window.innerHeight * 0.2;

    if (direction === "down") {
      const next = offsets.find((top) => top > probe + 40);
      if (next != null) {
        window.scrollTo({ top: next, behavior: "smooth" });
      }
      return;
    }

    const previous = [...offsets].reverse().find((top) => top < probe - 40);
    if (previous != null) {
      window.scrollTo({ top: previous, behavior: "smooth" });
    }
  };

  const visible = !endReached;

  return (
    <div
      className={`fixed inset-x-0 bottom-4 md:bottom-8 z-50 flex flex-col items-center gap-2 pointer-events-none ${visible ? "" : "opacity-0"}`}
      aria-hidden={!visible}
    >
      <motion.button
        type="button"
        onClick={() => scrollBySection("up")}
        aria-label={t("nation.story.scrollHint.upLabel")}
        tabIndex={visible && canScrollUp ? 0 : -1}
        initial={false}
        animate={
          visible && canScrollUp
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 8 }
        }
        transition={{ duration: 0.25 }}
        className={`pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border-2 border-orange-3/80 bg-black/70 text-orange-3 shadow-[0_0_24px_rgba(255,140,60,0.35)] backdrop-blur-sm transition-colors hover:bg-orange-3/15 ${canScrollUp ? "" : "pointer-events-none"}`}
      >
        <ChevronUp className="h-6 w-6" strokeWidth={2.5} aria-hidden />
      </motion.button>

      <motion.button
        type="button"
        onClick={() => scrollBySection("down")}
        aria-label={t("nation.story.scrollHint.label")}
        tabIndex={visible && canScrollDown ? 0 : -1}
        initial={false}
        animate={
          visible && canScrollDown
            ? { opacity: [0.7, 1, 0.7], y: [0, 8, 0] }
            : { opacity: 0, y: 0 }
        }
        transition={
          visible && canScrollDown
            ? {
                opacity: { repeat: Infinity, duration: 1.4, ease: "easeInOut" },
                y: { repeat: Infinity, duration: 1.4, ease: "easeInOut" },
              }
            : { duration: 0.25 }
        }
        className={`pointer-events-auto flex flex-col items-center gap-1 ${canScrollDown ? "" : "pointer-events-none"}`}
      >
        <span
          className="text-lg md:text-xl text-orange-3 font-medium tracking-wide"
          style={{ fontFamily: "cursive, 'Segoe Script', 'Comic Sans MS', sans-serif" }}
        >
          {t("nation.story.scrollHint.text")}
        </span>
        <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-orange-3 bg-black/70 text-orange-3 shadow-[0_0_28px_rgba(255,140,60,0.45)] backdrop-blur-sm transition-colors hover:bg-orange-3/15">
          <ChevronDown className="h-7 w-7" strokeWidth={2.5} aria-hidden />
        </span>
      </motion.button>
    </div>
  );
}
