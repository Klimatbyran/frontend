import { Trans, useTranslation } from "react-i18next";
import { NationStatCallout } from "@/components/nation/story/NationStatCallout";
import type { NationStoryMetrics } from "@/utils/data/nationStoryMetrics";
import { formatMton } from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";
import { formatPercentChange } from "@/utils/formatting/localization";

interface NationStoryHeadlineProps {
  metrics: NationStoryMetrics;
}

export function NationStoryHeadline({ metrics }: NationStoryHeadlineProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const ratioDisplay = metrics.ratioReportedToFull.toLocaleString(
    currentLanguage === "sv" ? "sv-SE" : "en-GB",
    { maximumFractionDigits: 1, minimumFractionDigits: 1 },
  );

  return (
    <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-16">
      <div className="rounded-level-3 border border-orange-2/30 bg-gradient-to-br from-orange-2/10 to-transparent p-8 md:p-12">
        <p className="text-sm uppercase tracking-widest text-orange-2 mb-4">
          {t("nation.story.headline.eyebrow")}
        </p>
        <h2 className="text-3xl md:text-5xl font-light text-white leading-tight mb-8">
          <Trans
            i18nKey="nation.story.headline.title"
            values={{ ratio: ratioDisplay }}
            components={[
              <span key="ratio" className="text-orange-2 font-normal" />,
            ]}
          />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NationStatCallout
            label={t("nation.story.headline.reportedLabel", {
              year: metrics.reportedYear,
            })}
            value={formatMton(metrics.territorialLatestMton, currentLanguage)}
            unit={t("nation.story.unit.mton")}
          />
          <NationStatCallout
            label={t("nation.story.headline.fullLabel", {
              year: metrics.latestYear,
            })}
            value={formatMton(metrics.combinedLatestMton, currentLanguage, 0)}
            unit={t("nation.story.unit.mton")}
            delta={t("nation.story.headline.ratioCaption", {
              ratio: ratioDisplay,
            })}
          />
        </div>
        <p className="mt-8 text-grey text-lg leading-relaxed">
          {t("nation.story.headline.description")}
        </p>
        <p className="mt-4 text-sm text-grey">
          {t("nation.story.headline.combinedChange", {
            from: formatMton(metrics.combined1990Mton, currentLanguage, 0),
            to: formatMton(metrics.combinedLatestMton, currentLanguage, 0),
            change: formatPercentChange(
              metrics.combinedChangePercent,
              currentLanguage,
              true,
            ),
          })}
        </p>
      </div>
    </section>
  );
}
