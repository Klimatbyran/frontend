import { useRef } from "react";
import { NationConclusion } from "@/components/nation/story/NationConclusion";
import { NationEmissionsJourney } from "@/components/nation/story/NationEmissionsJourney";
import { NationStackedChart } from "@/components/nation/story/NationStackedChart";
import { NationStoryIntro } from "@/components/nation/story/NationStoryIntro";
import { BathtubBridgeSection } from "@/components/nation/story/BathtubBridgeSection";
import { StorySectionNav } from "@/components/nation/story/StorySectionNav";
import { StoryStageProvider } from "@/components/nation/story/storyStageContext";
import { useLanguage } from "@/components/LanguageProvider";
import type { NationStoryDetails } from "@/hooks/nation/useNationStoryDetails";
import type { NationStoryMetrics } from "@/utils/data/nationStoryMetrics";

type NationStoryPageProps = {
  nation: NationStoryDetails;
  metrics: NationStoryMetrics;
};

export function NationStoryPage({ nation, metrics }: NationStoryPageProps) {
  const { currentLanguage } = useLanguage();
  const countryName = nation.country[currentLanguage];

  const introRef = useRef<HTMLElement>(null);
  const journeyRef = useRef<HTMLElement>(null);
  const bathtubRef = useRef<HTMLElement>(null);
  const chartRef = useRef<HTMLElement>(null);
  const conclusionRef = useRef<HTMLElement>(null);

  const sectionRefs = [
    introRef,
    journeyRef,
    bathtubRef,
    chartRef,
    conclusionRef,
  ];

  return (
    <StoryStageProvider>
      <div className="bg-black text-white pb-24">
        <section
          ref={introRef}
          className="relative flex items-center justify-center min-h-[88vh] px-4 md:px-8 pt-20 md:pt-24 pb-8"
        >
          <NationStoryIntro countryName={countryName} metrics={metrics} />
        </section>

        <section ref={journeyRef} aria-label={countryName}>
          <NationEmissionsJourney metrics={metrics} />
        </section>

        <section
          ref={bathtubRef}
          className="relative min-h-screen flex items-center justify-center px-4 md:px-8 py-12"
        >
          <BathtubBridgeSection />
        </section>

        <section ref={chartRef} aria-label="Historical emissions">
          <NationStackedChart data={metrics.stackData} />
        </section>

        <section
          ref={conclusionRef}
          className="relative min-h-[80vh] flex items-center justify-center px-4 md:px-8 py-10"
        >
          <div className="w-full max-w-4xl mx-auto">
            <NationConclusion metrics={metrics} />
          </div>
        </section>

        <StorySectionNav sectionRefs={sectionRefs} endRef={conclusionRef} />
      </div>
    </StoryStageProvider>
  );
}
