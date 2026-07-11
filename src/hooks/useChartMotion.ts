import { useReducedMotion } from "framer-motion";

const CHART_EASE = [0.22, 1, 0.36, 1] as const;

export function useChartMotion() {
  const reduceMotion = useReducedMotion();

  return {
    reduceMotion: !!reduceMotion,
    ease: CHART_EASE,
    barDuration: reduceMotion ? 0 : 0.6,
    fadeDuration: reduceMotion ? 0 : 0.4,
    pieDuration: reduceMotion ? 0 : 700,
    stagger: (index: number, step = 0.08) => (reduceMotion ? 0 : index * step),
  };
}
