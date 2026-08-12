import { useEffect, useState } from "react";

export type StorySectionSnapshot = {
  steps: number;
  step: number;
  chapter: string;
};

export type StorySectionState = {
  active: number;
  sections: StorySectionSnapshot[];
};

/** Scroll probe shared by step dots, chapter label, and skip-chapter logic. */
export function useStorySectionState(): StorySectionState {
  const [state, setState] = useState<StorySectionState>({
    active: 0,
    sections: [],
  });

  useEffect(() => {
    const update = () => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-story-section]"),
      );
      const probeY = window.innerHeight * 0.45;
      let active = 0;
      sections.forEach((section, index) => {
        if (section.getBoundingClientRect().top <= probeY) active = index;
      });
      setState({
        active,
        sections: sections.map((section) => ({
          steps: Number(section.dataset.storySteps ?? "1"),
          step: Number(section.dataset.storyStep ?? "0"),
          chapter: section.dataset.storyChapter ?? "intro",
        })),
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return state;
}
