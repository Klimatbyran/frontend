import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { EntityListBox } from "@/components/detail/EntityListBox";
import { NationConclusion } from "@/components/nation/story/NationConclusion";
import { NationEmissionsJourney } from "@/components/nation/story/NationEmissionsJourney";
import { NationLayerComparisons } from "@/components/nation/story/NationLayerComparisons";
import { NationStackedChart } from "@/components/nation/story/NationStackedChart";
import { useLanguage } from "@/components/LanguageProvider";
import type { NationDetails } from "@/hooks/nation/useNationDetails";
import type { NationStoryMetrics } from "@/utils/data/nationStoryMetrics";

type NationStoryPageProps = {
  nation: NationDetails;
  metrics: NationStoryMetrics;
  sortedRegions: string[];
};

function FullScreenSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 md:px-8 py-10">
      <div className="w-full max-w-4xl mx-auto">{children}</div>
    </section>
  );
}

export function NationStoryPage({
  nation,
  metrics,
  sortedRegions,
}: NationStoryPageProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const countryName = nation.country[currentLanguage];

  return (
    <div className="bg-black text-white pb-24">
      {/* Intro */}
      <section className="flex items-start justify-center min-h-screen px-4 md:px-8 pt-16 md:pt-24 pb-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Flag_of_Sweden.svg"
            alt=""
            className="h-12 w-20 mx-auto object-contain opacity-90 rounded-sm"
          />
          <h1 className="text-4xl md:text-6xl font-light">{countryName}</h1>
          <p className="text-lg md:text-xl text-grey leading-relaxed">
            {t("nation.story.intro.paragraph1")}
          </p>
          <p className="text-lg md:text-xl text-grey leading-relaxed">
            {t("nation.story.intro.paragraph2")}
          </p>
          <p className="text-lg md:text-xl text-white leading-relaxed">
            {t("nation.story.intro.paragraph3")}
          </p>
        </div>
      </section>

      {/* Growing-bubble journey: broadening the emissions perspective */}
      <FullScreenSection>
        <NationEmissionsJourney metrics={metrics} />
      </FullScreenSection>

      {/* Bathtub metaphor – transition into the time series */}
      <section className="min-h-[70vh] flex items-center justify-center px-4 md:px-8 py-10">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="text-lg md:text-xl text-grey leading-relaxed"
          >
            {t("nation.story.bathtub.text")}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-xl md:text-2xl text-white font-light leading-snug"
          >
            {t("nation.story.bathtub.question")}
          </motion.p>
        </div>
      </section>

      <FullScreenSection>
        <NationStackedChart data={metrics.stackData} />
      </FullScreenSection>

      <FullScreenSection>
        <NationLayerComparisons
          layers={metrics.layerComparisons}
          latestYear={metrics.latestYear}
          maxMton={metrics.maxLayerMton}
        />
      </FullScreenSection>

      {/* Conclusion – the punchline tying the journey together */}
      <FullScreenSection>
        <NationConclusion metrics={metrics} />
      </FullScreenSection>

      {/* Footer */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.5 }}
        >
          <EntityListBox
            items={sortedRegions}
            entityType="regions"
            translateNamespace="nation.detailPage"
          />
        </motion.div>
      </section>
    </div>
  );
}
