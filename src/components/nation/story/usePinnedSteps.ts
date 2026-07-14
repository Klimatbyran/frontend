import { useEffect, useRef, useState } from "react";

export type PinMode = "before" | "pinned" | "after";

/**
 * Scroll-driven pinning used by the nation story sections.
 *
 * Renders a tall section (`stepCount * stepVh`) and reports the current step
 * derived from scroll position. The visual "stage" should be positioned with
 * the returned `stageStyle`: absolute at the top before pinning, fixed while
 * the section fully covers the viewport, absolute at the bottom afterwards.
 * This keeps the pinned content inside the section bounds (no overlap with
 * neighbouring sections) and works regardless of the scroll container – the
 * layout's `overflow-x-hidden` breaks `position: sticky`, so we avoid it.
 */
export function usePinnedSteps(stepCount: number, stepVh = 90) {
  const ref = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<PinMode>("before");
  const [stageBounds, setStageBounds] = useState({ left: 0, width: 0 });
  const sectionVh = stepCount * stepVh;

  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      const pinDistance = rect.height - viewport;
      const scrolled = -rect.top;

      let nextMode: PinMode = "pinned";
      if (rect.top > 0) nextMode = "before";
      else if (scrolled >= pinDistance) nextMode = "after";

      const progress =
        pinDistance > 0 ? Math.min(Math.max(scrolled / pinDistance, 0), 1) : 0;
      const nextStep = Math.min(
        Math.max(Math.floor(progress * stepCount), 0),
        stepCount - 1,
      );

      setStageBounds({ left: rect.left, width: rect.width });
      setMode(nextMode);
      setStep(nextStep);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [stepCount, stepVh]);

  const stageStyle: React.CSSProperties =
    mode === "pinned"
      ? {
          position: "fixed",
          top: 0,
          left: stageBounds.left,
          width: stageBounds.width,
        }
      : mode === "before"
        ? { position: "absolute", top: 0, left: 0, right: 0 }
        : {
            position: "absolute",
            top: `calc(${sectionVh}vh - 100vh)`,
            left: 0,
            right: 0,
          };

  return { ref, step, mode, sectionVh, stageStyle };
}
