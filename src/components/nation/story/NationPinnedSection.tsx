import { useRef, type ReactNode } from "react";
import { useScroll, useSpring } from "framer-motion";
import type { MotionValue } from "framer-motion";

type NationPinnedSectionProps = {
  heightVh?: number;
  children: (scrollYProgress: MotionValue<number>) => ReactNode;
  className?: string;
};

export function NationPinnedSection({
  heightVh = 220,
  children,
  className = "",
}: NationPinnedSectionProps) {
  const ref = useRef<HTMLElement>(null);

  // progress=0: section top at viewport bottom (section approaching from below)
  // progress=1: section center at viewport center (section perfectly centered)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 28,
    mass: 0.35,
    restDelta: 0.001,
  });

  return (
    <section
      ref={ref}
      className={`relative w-full ${className}`}
      style={{ height: `${heightVh}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8 h-full flex flex-col justify-center">
          {children(smoothProgress)}
        </div>
      </div>
    </section>
  );
}
