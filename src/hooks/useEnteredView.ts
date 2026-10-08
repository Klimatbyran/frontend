import { useEffect, useRef, useState } from "react";

type EnteredViewOptions = {
  /** When false, treat the node as already visible and skip observing. */
  enabled?: boolean;
  rootMargin?: string;
};

/**
 * Flips to true once the node scrolls into view, and stays there.
 * A missing observer, or a zero-height render (tests), counts as visible
 * so content is never stuck hidden.
 */
export function useEnteredView<T extends HTMLElement>({
  enabled = true,
  rootMargin = "0px 0px -40px 0px",
}: EnteredViewOptions = {}) {
  const ref = useRef<T>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setEntered(true);
      return;
    }

    if (el.getBoundingClientRect().height === 0) {
      setEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return { ref, entered: !enabled || entered };
}
