import { useRef, type ReactNode } from "react";
import { useScroll } from "framer-motion";
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
  // progress=1: section top at viewport center (animations complete with less scroll)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start center"],
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
