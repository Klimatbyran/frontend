import { useTranslation } from "react-i18next";
import InsightsList from "@/components/ranked/InsightsList";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatAnnualChange,
  type PaceSummary,
  type StoryLens,
  type TerritoryExtremes,
  type TerritoryStoryRow,
} from "@/utils/territories/territoryOverviewStory";

const LEADING_COLOR = "var(--blue-3)";
const TRAILING_COLOR = "var(--pink-3)";

export function TerritoryPaceStory({
  storyKey,
  entityType,
  lens,
  pace,
  extremes,
}: {
  storyKey: string;
  entityType: "municipalities" | "regions";
  lens: StoryLens;
  pace: PaceSummary;
  extremes: TerritoryExtremes;
}) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  if (pace.total === 0) return null;

  const median =
    pace.median == null
      ? null
      : formatAnnualChange(pace.median, currentLanguage);
  const leader = extremes.leading[0];
  const trailer = extremes.trailing[0];

  const intro =
    lens === "pace"
      ? t(`${storyKey}.paceIntroOnPaceLens`)
      : median
        ? t(`${storyKey}.paceIntro`, {
            median,
            falling: pace.falling,
            rising: pace.rising,
          })
        : t(`${storyKey}.paceIntroNoMedian`);

  return (
    <section className="space-y-5">
      <div className="max-w-[640px]">
        <h2 className="text-xl font-light md:text-[21px]">
          {t(
            lens === "pace"
              ? `${storyKey}.paceTitleOnPaceLens`
              : `${storyKey}.paceTitle`,
          )}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-white/60">{intro}</p>
        {leader && (
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            {t(
              (leader.historicalEmissionChangePercent ?? 0) < 0
                ? `${storyKey}.paceLeader`
                : `${storyKey}.paceLeaderNotCutting`,
              {
                name: leader.name,
                change: formatAnnualChange(
                  leader.historicalEmissionChangePercent as number,
                  currentLanguage,
                ),
              },
            )}
            {trailer
              ? ` ${t(`${storyKey}.paceTrailer`, {
                  name: trailer.name,
                  change: formatAnnualChange(
                    trailer.historicalEmissionChangePercent as number,
                    currentLanguage,
                  ),
                })}`
              : ""}
          </p>
        )}
      </div>

      {(extremes.leading.length > 0 || extremes.trailing.length > 0) && (
        <div className="grid items-start gap-6 md:grid-cols-2">
          {extremes.leading.length > 0 && (
            <InsightsList<TerritoryStoryRow>
              title={t(`${storyKey}.fallingFastest`)}
              entities={extremes.leading}
              dataPointKey="historicalEmissionChangePercent"
              unit="%"
              totalCount={extremes.leading.length}
              entityType={entityType}
              nameKey="name"
              showBars
              colorItem={() => LEADING_COLOR}
            />
          )}
          {extremes.trailing.length > 0 && (
            <InsightsList<TerritoryStoryRow>
              title={t(`${storyKey}.furthestBehind`)}
              entities={extremes.trailing}
              dataPointKey="historicalEmissionChangePercent"
              unit="%"
              totalCount={extremes.trailing.length}
              entityType={entityType}
              nameKey="name"
              showBars
              colorItem={() => TRAILING_COLOR}
            />
          )}
        </div>
      )}
    </section>
  );
}
