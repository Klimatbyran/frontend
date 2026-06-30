import type { ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";

type ScrollRevealProps = {
  scrollYProgress: MotionValue<number>;
  /** Input range within parent progress [0-1] */
  range?: [number, number];
  children: ReactNode;
  className?: string;
  y?: number;
};

export function ScrollReveal({
  scrollYProgress,
  range = [0, 1],
  children,
  className = "",
  y = 40,
}: ScrollRevealProps) {
  const opacity = useTransform(scrollYProgress, range, [0, 1]);
  const translateY = useTransform(scrollYProgress, range, [y, 0]);

  return (
    <motion.div style={{ opacity, y: translateY }} className={className}>
      {children}
    </motion.div>
  );
}
