import { useRef } from "react";
import { useScroll, type MotionValue } from "framer-motion";

type ScrollSectionOptions = {
  /** Viewport heights of scroll distance while section is active */
  heightVh?: number;
};

export function useScrollSection(options: ScrollSectionOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return {
    ref,
    scrollYProgress,
    heightVh: options.heightVh ?? 300,
  };
}

export function useRevealScroll() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.35"],
  });

  return { ref, scrollYProgress };
}

export type { MotionValue };
