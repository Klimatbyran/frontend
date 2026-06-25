import type { ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";

type NationPinnedSectionProps = {
  scrollYProgress: MotionValue<number>;
  heightVh?: number;
  children: ReactNode;
  className?: string;
};

export function NationPinnedSection({
  scrollYProgress,
  heightVh = 400,
  children,
  className = "",
}: NationPinnedSectionProps) {
  const opacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.08, 0.92, 1],
    [0.96, 1, 1, 0.98],
  );

  return (
    <section
      className={`relative w-full ${className}`}
      style={{ height: `${heightVh}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <motion.div
          style={{ opacity, scale }}
          className="w-full max-w-6xl mx-auto px-4 md:px-8 h-full flex flex-col justify-center"
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
