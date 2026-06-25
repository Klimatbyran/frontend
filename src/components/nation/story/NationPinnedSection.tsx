import { useRef, type ReactNode } from "react";
import { useScroll } from "framer-motion";
import type { MotionValue } from "framer-motion";

type NationPinnedSectionProps = {
  /** Scroll distance while pinned; 200vh = 100vh scrollable above the viewport height */
  heightVh?: number;
  children: (scrollYProgress: MotionValue<number>) => ReactNode;
  className?: string;
};

export function NationPinnedSection({
  heightVh = 200,
  children,
  className = "",
}: NationPinnedSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section
      ref={ref}
      className={`relative w-full ${className}`}
      style={{ height: `${heightVh}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8 h-full flex flex-col justify-center">
          {children(scrollYProgress)}
        </div>
      </div>
    </section>
  );
}
