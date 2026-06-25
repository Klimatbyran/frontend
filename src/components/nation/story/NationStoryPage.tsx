import { useTranslation } from "react-i18next";
import { EntityListBox } from "@/components/detail/EntityListBox";
import { NationCombinedStackChart } from "@/components/nation/story/NationCombinedStackChart";
import { NationComparisonBars } from "@/components/nation/story/NationComparisonBars";
import { NationStatCallout } from "@/components/nation/story/NationStatCallout";
import { NationStoryHeadline } from "@/components/nation/story/NationStoryHeadline";
import { NationStoryHero } from "@/components/nation/story/NationStoryHero";
import { NationStorySection } from "@/components/nation/story/NationStorySection";
import { useLanguage } from "@/components/LanguageProvider";
import type { NationDetails } from "@/hooks/nation/useNationDetails";
import type { NationStoryMetrics } from "@/utils/data/nationStoryMetrics";
import { formatMton, formatTonnes } from "@/utils/data/nationStoryMetrics";
import { formatPercentChange } from "@/utils/formatting/localization";
import { LocalizedLink } from "@/components/LocalizedLink";

interface NationStoryPageProps {
  nation: NationDetails;
  metrics: NationStoryMetrics;
  sortedRegions: string[];
  gavleEmissionsTonnes: number | null;
}

export function NationStoryPage({
  nation,
  metrics,
  sortedRegions,
  gavleEmissionsTonnes,
}: NationStoryPageProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const countryName = nation.country[currentLanguage];

  return (
    <div className="bg-black text-white pb-20">
      <NationStoryHero nation={nation} countryName={countryName} />
      <NationStoryHeadline metrics={metrics} />

      <NationStorySection
        id="helheten"
        title={t("nation.story.combined.title")}
      >
        <p>{t("nation.story.combined.paragraph1")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose">
          <NationStatCallout
            label={`${metrics.latestYear}`}
            value={formatMton(metrics.combinedLatestMton, currentLanguage, 0)}
            unit={t("nation.story.unit.mton")}
          />
          <NationStatCallout
            label={`${1990}`}
            value={formatMton(metrics.combined1990Mton, currentLanguage, 0)}
            unit={t("nation.story.unit.mton")}
          />
          <NationStatCallout
            label={t("nation.story.combined.changeLabel")}
            value={formatPercentChange(
              metrics.combinedChangePercent,
              currentLanguage,
              true,
            )}
            deltaClassName={
              metrics.combinedChangePercent <= 0
                ? "text-green-3"
                : "text-pink-3"
            }
          />
        </div>
        <div className="not-prose pt-4">
          <NationCombinedStackChart data={metrics.stackData} />
        </div>
        <p>{t("nation.story.combined.paragraph2")}</p>
      </NationStorySection>

      <NationStorySection id="biogent" title={t("nation.story.biogenic.title")}>
        <p>{t("nation.story.biogenic.paragraph1")}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
          <NationStatCallout
            label={t("nation.story.biogenic.biogenicChangeLabel")}
            value={formatPercentChange(
              metrics.biogenicChangePercent,
              currentLanguage,
              true,
            )}
            delta={t("nation.story.biogenic.biogenicValues", {
              from: formatMton(metrics.biogenic1990Mton, currentLanguage, 0),
              to: formatMton(metrics.biogenicLatestMton, currentLanguage, 0),
            })}
          />
          <NationStatCallout
            label={t("nation.story.biogenic.prodBiogenicLabel")}
            value={formatPercentChange(
              metrics.prodBiogenicChangePercent,
              currentLanguage,
              true,
            )}
            delta={t("nation.story.biogenic.prodBiogenicValues", {
              from: formatMton(
                metrics.prodBiogenic1990Mton,
                currentLanguage,
                0,
              ),
              to: formatMton(
                metrics.prodBiogenicLatestMton,
                currentLanguage,
                0,
              ),
            })}
          />
        </div>
        <p>{t("nation.story.biogenic.paragraph2")}</p>
      </NationStorySection>

      <NationStorySection
        id="konsumtion"
        title={t("nation.story.consumption.title")}
      >
        <p>{t("nation.story.consumption.paragraph1")}</p>
        <div className="not-prose">
          <NationComparisonBars
            territorialMton={metrics.territorialLatestMton}
            consumptionMton={metrics.consumptionLatestMton}
            year={metrics.latestYear}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
          <NationStatCallout
            label={t("nation.story.consumption.consumptionChangeLabel")}
            value={formatPercentChange(
              metrics.consumptionChangePercent,
              currentLanguage,
              true,
            )}
            delta={t("nation.story.consumption.since1990")}
          />
          <NationStatCallout
            label={t("nation.story.consumption.eCommerceLabel", {
              year: metrics.latestYear,
            })}
            value={formatTonnes(
              metrics.eCommerceLatestTonnes,
              currentLanguage,
              0,
            )}
            unit={t("emissionsUnit")}
            delta={
              gavleEmissionsTonnes != null
                ? t("nation.story.consumption.gavleComparison", {
                    municipality: "Gävle",
                    year: metrics.latestYear,
                    gavleTonnes: formatTonnes(
                      gavleEmissionsTonnes,
                      currentLanguage,
                      0,
                    ),
                  })
                : t("nation.story.consumption.eCommerceDescription")
            }
          />
        </div>
        <p>{t("nation.story.consumption.paragraph2")}</p>
      </NationStorySection>

      <div className="w-full max-w-5xl mx-auto px-4 md:px-8 pt-8">
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
      </div>
    </div>
  );
}
