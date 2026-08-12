import { useEffect, useState, type RefObject } from "react";

/**
 * True while the conclusion section sits at or above the probe line – i.e.
 * the reader has reached the end of the story content (or scrolled past it
 * into the footer). Unlike `useInView`, this stays true below the conclusion,
 * so end-of-story chrome doesn't reappear over the footer.
 */
export function useStoryEndReached(
  endRef: RefObject<HTMLElement | null>,
): boolean {
  const [reached, setReached] = useState(false);

  useEffect(() => {
    const update = () => {
      const el = endRef.current;
      if (!el) return;
      // Slightly later than mid-viewport so short phones keep chapter chrome
      // visible while the conclusion heading is still the main read.
      setReached(el.getBoundingClientRect().top <= window.innerHeight * 0.45);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [endRef]);

  return reached;
}
