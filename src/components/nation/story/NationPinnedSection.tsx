import { useRef, type ReactNode } from "react";
import { useScroll, useSpring } from "framer-motion";
import type { MotionValue } from "framer-motion";

type NationPinnedSectionProps = {
  heightVh?: number;
  /** Pull section up by one viewport height so it sticks immediately after
   * the previous section un-pins, eliminating dead scroll between sections. */
  overlap?: boolean;
  children: (scrollYProgress: MotionValue<number>) => ReactNode;
  className?: string;
};

export function NationPinnedSection({
  heightVh = 220,
  overlap = false,
  children,
  className = "",
}: NationPinnedSectionProps) {
  const ref = useRef<HTMLElement>(null);

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
      className={`relative w-full bg-black ${className}`}
      style={{
        height: `${heightVh}vh`,
        // Negative margin pulls this section up so its sticky starts exactly
        // when the previous section's sticky ends – zero dead scroll between.
        marginTop: overlap ? "-100vh" : undefined,
        // Stay above lower sections while this one is sticky
        zIndex: overlap ? 10 : undefined,
      }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8 h-full flex flex-col justify-center">
          {children(smoothProgress)}
        </div>
      </div>
    </section>
  );
}
