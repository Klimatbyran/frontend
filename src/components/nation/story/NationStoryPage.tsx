import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform } from "framer-motion";
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
};

export function NationStoryPage({
  nation,
  metrics,
  sortedRegions,
  gavleEmissionsTonnes,
  smallMunicipalityName,
  smallMunicipalityTonnes,
}: NationStoryPageProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const countryName = nation.country[currentLanguage];

  // Intro section has its own scroll tracking
  const introRef = useRef<HTMLElement>(null);
  const { scrollYProgress: introProgress } = useScroll({
    target: introRef,
    offset: ["start start", "end end"],
  });
  const introP1 = useTransform(introProgress, [0, 0.3], [0, 1]);
  const introP2 = useTransform(introProgress, [0.28, 0.58], [0, 1]);
  const introP3 = useTransform(introProgress, [0.56, 0.86], [0, 1]);
  const introP1Y = useTransform(introP1, [0, 1], [20, 0]);
  const introP2Y = useTransform(introP2, [0, 1], [20, 0]);
  const introP3Y = useTransform(introP3, [0, 1], [20, 0]);

  return (
    <div className="bg-black text-white pb-24">
      {/* Intro – 230vh so 3 paragraphs have ~43vh each to animate in */}
      <section
        ref={introRef}
        className="relative"
        style={{ height: "230vh" }}
      >
        <div className="sticky top-0 h-screen flex items-center justify-center px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {nation.logoUrl ? (
              <img
                src={nation.logoUrl}
                alt=""
                className="h-16 w-16 mx-auto object-contain opacity-80"
              />
            ) : null}
            <h1 className="text-4xl md:text-6xl font-light">{countryName}</h1>
            <motion.p
              style={{ opacity: introP1, y: introP1Y }}
              className="text-lg md:text-xl text-grey leading-relaxed"
            >
              {t("nation.story.intro.paragraph1")}
            </motion.p>
            <motion.p
              style={{ opacity: introP2, y: introP2Y }}
              className="text-lg md:text-xl text-grey leading-relaxed"
            >
              {t("nation.story.intro.paragraph2")}
            </motion.p>
            <motion.p
              style={{ opacity: introP3, y: introP3Y }}
              className="text-lg md:text-xl text-white leading-relaxed"
            >
              {t("nation.story.intro.paragraph3")}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Zoom-out chart – 4 phases, each needs ~50vh of scroll; total ~280vh */}
      <NationPinnedSection heightVh={280}>
        {(progress) => (
          <NationZoomChart metrics={metrics} scrollYProgress={progress} />
        )}
      </NationPinnedSection>

      {/* 1990 → today comparisons – header + 3 rows, ~50vh each = ~210vh */}
      <NationPinnedSection heightVh={210}>
        {(progress) => (
          <NationLayerComparisons
            layers={metrics.layerComparisons}
            latestYear={metrics.latestYear}
            maxMton={metrics.maxLayerMton}
            scrollYProgress={progress}
          />
        )}
      </NationPinnedSection>

      {/* E-commerce scale – 3 bars + footer text ~180vh */}
      <NationPinnedSection heightVh={200}>
        {(progress) => (
          <NationECommerceScale
            eCommerceTonnes={metrics.eCommerceLatestTonnes}
            eCommerceYear={metrics.eCommerceYear}
            smallMunicipalityName={smallMunicipalityName}
            smallMunicipalityTonnes={smallMunicipalityTonnes}
            gavleTonnes={gavleEmissionsTonnes}
            scrollYProgress={progress}
          />
        )}
      </NationPinnedSection>

      {/* Oil exports ~200vh */}
      <NationPinnedSection heightVh={200}>
        {(progress) => (
          <NationOilExportsSection metrics={metrics} scrollYProgress={progress} />
        )}
      </NationPinnedSection>

      {/* Footer */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 pt-16">
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
