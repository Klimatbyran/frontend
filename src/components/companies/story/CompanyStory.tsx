import { useRef } from "react";
import { CompanyIntroHero } from "@/components/companies/story/CompanyIntroHero";
import { ParisPaceChapter } from "@/components/companies/story/ParisPaceChapter";
import { CompanyVerdictChapter } from "@/components/companies/story/CompanyVerdictChapter";
import { CompanySectorChapter } from "@/components/companies/story/CompanySectorChapter";
import { CompanyConclusion } from "@/components/companies/story/CompanyConclusion";
import { StoryNavChrome } from "@/components/nation/story/StoryNavChrome";
import { StoryScrollHint } from "@/components/nation/story/StoryScrollHint";
import { useStoryAutoSnap } from "@/components/nation/story/useStoryAutoSnap";
import type { CompanyStoryMetrics } from "@/utils/data/companyStoryMetrics";

type CompanyStoryProps = {
  metrics: CompanyStoryMetrics;
};

/**
 * The companies story: are the companies in Klimatkollen's database keeping
 * the Paris pace? Intro field → the required pace → the verdict sort → the
 * sector race → conclusion.
 */
export function CompanyStory({ metrics }: CompanyStoryProps) {
  const conclusionRef = useRef<HTMLElement>(null);
  useStoryAutoSnap();

  return (
    <div className="bg-black text-white pb-10 md:pb-24">
      <StoryNavChrome
        endRef={conclusionRef}
        chapterLabelPrefix="companies.story.chapters"
      />

      <section
        data-story-section
        data-story-chapter="intro"
        className="relative flex h-[100svh] min-h-0 flex-col items-center justify-center px-4 md:px-8 pt-[var(--story-hero-pad-top)] md:pt-28 story-compact:pt-24 lg:pt-36 xl:pt-44 pb-[var(--story-hero-pad-bottom)] md:pb-16 story-compact:pb-14 lg:pb-20 overflow-x-hidden"
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_38%,var(--black-2)_0%,var(--black-3)_78%)]"
        />
        <CompanyIntroHero metrics={metrics} />
      </section>

      <section
        data-story-section
        data-story-chapter="pace"
        className="relative min-h-[100svh] flex items-center justify-center px-4 md:px-8 pt-[var(--story-stage-pad-top)] pb-[var(--story-stage-pad-bottom)] md:py-8 story-compact:py-6 lg:py-10 xl:py-8"
      >
        <div className="w-full max-w-4xl mx-auto">
          <ParisPaceChapter metrics={metrics} />
        </div>
      </section>

      <CompanyVerdictChapter metrics={metrics} />

      <CompanySectorChapter metrics={metrics} />

      <section
        ref={conclusionRef}
        data-story-section
        data-story-chapter="conclusion"
        className="relative min-h-[100svh] flex items-center justify-center px-4 md:px-8 pt-[var(--story-stage-pad-top)] md:pt-14 story-compact:pt-12 lg:pt-20 xl:pt-16 pb-[var(--story-stage-pad-bottom)] md:pb-8 story-compact:pb-7 lg:pb-10 xl:pb-8 overflow-x-hidden"
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,var(--black-2)_0%,var(--black-3)_78%)]"
        />
        <div className="relative w-full max-w-4xl md:max-w-7xl mx-auto md:pt-6 lg:pt-4">
          <CompanyConclusion metrics={metrics} />
        </div>
      </section>

      <StoryScrollHint endRef={conclusionRef} />
    </div>
  );
}
