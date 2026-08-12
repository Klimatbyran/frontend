import { useEffect, useState } from "react";

/** Matches the Tailwind `story-short` raw breakpoint (e.g. iPhone SE). */
const STORY_SHORT_QUERY = "(max-width: 767px) and (max-height: 700px)";

/**
 * True on short mobile viewports where pinned story stages must pack tighter
 * than the default phone layout.
 */
export function useStoryShortViewport(): boolean {
  const [isStoryShort, setIsStoryShort] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(STORY_SHORT_QUERY).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(STORY_SHORT_QUERY);
    const update = () => setIsStoryShort(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isStoryShort;
}
