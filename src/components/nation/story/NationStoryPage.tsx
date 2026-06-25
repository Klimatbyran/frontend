import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { EntityListBox } from "@/components/detail/EntityListBox";
import { LocalizedLink } from "@/components/LocalizedLink";
import { NationECommerceScale } from "@/components/nation/story/NationECommerceScale";
import { NationLayerComparisons } from "@/components/nation/story/NationLayerComparisons";
import { NationOilExportsSection } from "@/components/nation/story/NationOilExportsSection";
import { NationPinnedSection } from "@/components/nation/story/NationPinnedSection";
import { NationZoomChart } from "@/components/nation/story/NationZoomChart";
import { useLanguage } from "@/components/LanguageProvider";
import type { NationDetails } from "@/hooks/nation/useNationDetails";
import type { NationStoryMetrics } from "@/utils/data/nationStoryMetrics";

type NationStoryPageProps = {
  nation: NationDetails;
  metrics: NationStoryMetrics;
  sortedRegions: string[];
  gavleEmissionsTonnes: number | null;
  smallMunicipalityName: string | null;
  smallMunicipalityTonnes: number | null;
  oilPoints: NationDetails["exportOfOilProductsPoints"];
};

/** Wrapper for non-pinned sections that still need to be full-screen centered */
function FullScreenSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 md:px-8 py-16">
      <div className="w-full max-w-4xl mx-auto">{children}</div>
    </section>
  );
}

export function NationStoryPage({
  nation,
  metrics,
  sortedRegions,
  gavleEmissionsTonnes,
  smallMunicipalityName,
  smallMunicipalityTonnes,
  oilPoints,
}: NationStoryPageProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const countryName = nation.country[currentLanguage];

  return (
    <div className="bg-black text-white pb-24">
      {/* Intro */}
      <section className="flex items-center justify-center min-h-screen px-4 md:px-8 py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {nation.logoUrl ? (
            <img
              src={nation.logoUrl}
              alt=""
              className="h-16 w-16 mx-auto object-contain opacity-80"
            />
          ) : null}
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

      {/* Zoom chart – sticky scroll-driven (sequential layer reveal) */}
      <NationPinnedSection heightVh={200}>
        {(progress) => (
          <NationZoomChart metrics={metrics} scrollYProgress={progress} />
        )}
      </NationPinnedSection>

      {/* 1990 → today – sticky scroll-driven (sequential row reveal) */}
      <NationPinnedSection heightVh={195}>
        {(progress) => (
          <NationLayerComparisons
            layers={metrics.layerComparisons}
            latestYear={metrics.latestYear}
            maxMton={metrics.maxLayerMton}
            scrollYProgress={progress}
          />
        )}
      </NationPinnedSection>

      {/* E-commerce – plain full-screen section, bars animate on viewport entry */}
      <FullScreenSection>
        <NationECommerceScale
          eCommerceTonnes={metrics.eCommerceLatestTonnes}
          eCommerceYear={metrics.eCommerceYear}
          territorialEmissionsTonnes={metrics.territorialLatestMton * 1_000_000}
          smallMunicipalityName={smallMunicipalityName}
          smallMunicipalityTonnes={smallMunicipalityTonnes}
          gavleTonnes={gavleEmissionsTonnes}
        />
      </FullScreenSection>

      {/* Oil – plain full-screen section */}
      <FullScreenSection>
        <NationOilExportsSection oilPoints={oilPoints} />
      </FullScreenSection>

      {/* Footer */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 pt-6 pb-16">
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
          <p className="mt-8 text-grey text-sm">
            {t("nation.story.footer.methodsPrompt")}{" "}
            <LocalizedLink
              to="/methodology?view=nationDataOverview"
              className="underline hover:text-white transition-colors"
            >
              {t("nation.story.footer.methodsLink")}
            </LocalizedLink>
          </p>
        </motion.div>
      </section>
    </div>
  );
}
