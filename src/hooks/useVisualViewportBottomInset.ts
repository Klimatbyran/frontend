import { useLayoutEffect, useState } from "react";
import {
  getVisualViewportBottomInset,
  getVisualViewportHeight,
} from "@/utils/ui/visualViewport";

interface VisualViewportState {
  bottomInset: number;
  viewportHeight: number;
}

function readVisualViewportState(): VisualViewportState {
  if (typeof window === "undefined") {
    return { bottomInset: 0, viewportHeight: 0 };
  }

  return {
    bottomInset: getVisualViewportBottomInset(
      window.innerHeight,
      window.visualViewport,
    ),
    viewportHeight: getVisualViewportHeight(
      window.innerHeight,
      window.visualViewport,
    ),
  };
}

export function useVisualViewportBottomInset(enabled: boolean) {
  const [state, setState] = useState<VisualViewportState>(() =>
    enabled ? readVisualViewportState() : { bottomInset: 0, viewportHeight: 0 },
  );

  useLayoutEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    const update = () => {
      setState(readVisualViewportState());
    };

    update();

    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [enabled]);

  return state;
}
