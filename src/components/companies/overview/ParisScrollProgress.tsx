import { motion, useReducedMotion, useScroll } from "framer-motion";

/**
 * A hairline under the header that tracks how far down this page the reader
 * has scrolled. Pink is off track and blue is on track, the same reading
 * as the dots above the fold.
 */
export function ParisScrollProgress() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  if (reduceMotion) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-12 z-40 h-0.5 origin-left bg-gradient-to-r from-pink-3 to-blue-3"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
