import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useEnteredView } from "@/hooks/useEnteredView";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A section rises into place as it scrolls into view, in the same quiet
 * way the nation story brings in the passages between pinned scenes.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const { ref, entered } = useEnteredView<HTMLDivElement>({
    enabled: !reduceMotion,
  });
  const show = !!reduceMotion || entered;

  return (
    <motion.div
      ref={ref}
      className={cn("min-w-0", className)}
      inert={show ? undefined : true}
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 24 }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        delay: show && !reduceMotion ? delay : 0,
        ease: EASE,
      }}
    >
      {children}
    </motion.div>
  );
}
