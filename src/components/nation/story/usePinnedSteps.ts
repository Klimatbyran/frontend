import { useEffect, useRef, useState } from "react";

export type PinMode = "before" | "pinned" | "after";

export type PinnedStepsOptions = {
  /** Extra pinned scroll (in vh) before the steps – drives `enterProgress`. */
  enterVh?: number;
  /** Extra pinned scroll (in vh) after the steps – drives `exitProgress`. */
  exitVh?: number;
};

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

/**
 * Scroll-driven pinning used by the nation story sections.
 *
 * Renders a tall section (`enterVh + stepCount * stepVh + exitVh`) and reports
 * the current step derived from scroll position. The visual "stage" should be
 * positioned with the returned `stageStyle`: absolute at the top before
 * pinning, fixed while the section fully covers the viewport, absolute at the
 * bottom afterwards. This keeps the pinned content inside the section bounds
 * (no overlap with neighbouring sections) and works regardless of the scroll
 * container – the layout's `overflow-x-hidden` breaks `position: sticky`, so
 * we avoid it.
 *
 * Optional enter/exit zones reserve pinned scroll around the steps for
 * scene-transition morphs: `enterProgress` runs 0→1 across the enter zone,
 * `exitProgress` 0→1 across the exit zone, and `step`/`progress` cover the
 * steps span only, so per-step lerp math is unaffected by the zones.
 */
export function usePinnedSteps(
  stepCount: number,
  stepVh = 90,
  { enterVh = 0, exitVh = 0 }: PinnedStepsOptions = {},
) {
  const ref = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [enterProgress, setEnterProgress] = useState(enterVh > 0 ? 0 : 1);
  const [exitProgress, setExitProgress] = useState(0);
  const [mode, setMode] = useState<PinMode>("before");
  const [stageBounds, setStageBounds] = useState({ left: 0, width: 0 });
  const sectionVh = enterVh + stepCount * stepVh + exitVh;

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

      // Split the pin travel into enter / steps / exit spans (px), keeping
      // the zone sizes exact so morphs get precisely enterVh/exitVh of scroll.
      const vhPx = viewport / 100;
      const enterPx = enterVh * vhPx;
      const exitPx = exitVh * vhPx;
      const stepsPx = Math.max(pinDistance - enterPx - exitPx, 0);

      const nextEnter = enterPx > 0 ? clamp01(scrolled / enterPx) : 1;
      const nextProgress =
        stepsPx > 0 ? clamp01((scrolled - enterPx) / stepsPx) : 0;
      const nextExit =
        exitPx > 0 ? clamp01((scrolled - enterPx - stepsPx) / exitPx) : 0;
      const nextStep = Math.min(
        Math.max(Math.floor(nextProgress * stepCount), 0),
        stepCount - 1,
      );

      setStageBounds({ left: rect.left, width: rect.width });
      setMode(nextMode);
      setEnterProgress(nextEnter);
      setProgress(nextProgress);
      setExitProgress(nextExit);
      setStep(nextStep);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [stepCount, stepVh, enterVh, exitVh]);

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

  return {
    ref,
    step,
    progress,
    enterProgress,
    exitProgress,
    mode,
    sectionVh,
    stageStyle,
  };
}
