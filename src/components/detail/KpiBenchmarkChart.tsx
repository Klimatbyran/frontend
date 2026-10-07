import type React from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { formatPercent } from "@/utils/formatting/localization";
import type {
  BenchmarkPhrase,
  BooleanBenchmarkView,
  KpiBenchmarkView,
  NumericBenchmarkView,
} from "@/utils/detail/kpiBenchmark";
import { booleanBenchmarkMarkerPosition } from "@/utils/detail/kpiBenchmark";
import {
  buildComparativeBarGradient,
  buildNeutralBarGradient,
} from "@/utils/detail/kpiBenchmarkBarGradient";
import {
  benchmarkToneFill,
  benchmarkToneTextClass,
  booleanBarLegendColors,
  buildBooleanBarBackground,
  numericBarUsesNeutralGradient,
  numericBenchmarkAccent,
} from "@/components/detail/kpiBenchmarkColors";

function phraseText(
  t: (key: string, options?: Record<string, unknown>) => string,
  phrase: BenchmarkPhrase,
) {
  return t(phrase.key, {
    place: phrase.peerGroup
      ? t(`kpiBenchmark.place.${phrase.peerGroup}`)
      : undefined,
    reference: phrase.reference
      ? t(`kpiBenchmark.reference.${phrase.reference}`)
      : undefined,
  });
}

function numericGradient(view: NumericBenchmarkView) {
  if (numericBarUsesNeutralGradient(view)) {
    return buildNeutralBarGradient(view.averagePosition);
  }
  return buildComparativeBarGradient(
    view.averagePosition,
    view.higherIsBetter ?? false,
  );
}

function BenchmarkShell({
  primary,
  textClassName,
  className,
  children,
}: {
  primary: string;
  textClassName: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className ?? "mt-2")}>
      {children}
      <Text
        className={cn(
          "mt-1.5 line-clamp-1 min-h-[1.25rem] text-sm",
          textClassName,
        )}
      >
        {primary}
      </Text>
    </div>
  );
}

function NumericBenchmark({
  view,
  className,
}: {
  view: NumericBenchmarkView;
  className?: string;
}) {
  const { t } = useTranslation();
  const primary = phraseText(t, view.primary);
  const accent = numericBenchmarkAccent(view);

  return (
    <BenchmarkShell
      primary={primary}
      textClassName={accent.textClass}
      className={className}
    >
      <div role="img" aria-label={primary} className="px-1">
        <div className="relative h-3">
          <div
            className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full"
            style={{ background: numericGradient(view) }}
          />
          <span
            className="absolute top-1/2 z-[2] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${view.position * 100}%`,
              background: accent.fill,
              boxShadow: "0 0 0 2px rgba(255,255,255,0.9)",
            }}
          />
        </div>
      </div>
    </BenchmarkShell>
  );
}

function BooleanBenchmark({
  view,
  className,
}: {
  view: BooleanBenchmarkView;
  className?: string;
}) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const primary = phraseText(t, view.primary);
  const barBackground = buildBooleanBarBackground(
    view.trueShare,
    view.higherIsBetter,
    view.visual,
  );
  const markerPosition = booleanBenchmarkMarkerPosition(
    view.trueShare,
    view.subjectValue,
  );
  const markerFill = benchmarkToneFill(view.tone, view.visual);
  const legendColors = booleanBarLegendColors(view.higherIsBetter, view.visual);
  const yesShareLabel = formatPercent(view.trueShare, currentLanguage);
  const noShareLabel = formatPercent(1 - view.trueShare, currentLanguage);

  return (
    <BenchmarkShell
      primary={primary}
      textClassName={benchmarkToneTextClass(view.tone, view.visual)}
      className={className}
    >
      <div role="img" aria-label={primary} className="px-1">
        <div className="relative flex h-4 items-center">
          <div
            className="h-2 w-full rounded-full"
            style={{ background: barBackground }}
          />
          {markerPosition != null && (
            <span
              className="absolute top-1/2 z-[2] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${markerPosition * 100}%`,
                background: markerFill,
                boxShadow: "0 0 0 2px rgba(255,255,255,0.9)",
              }}
            />
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-xs text-grey">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: legendColors.yes }}
            />
            {t("kpiBenchmark.booleanYes", { share: yesShareLabel })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: legendColors.no }}
            />
            {t("kpiBenchmark.booleanNo", { share: noShareLabel })}
          </span>
        </div>
      </div>
    </BenchmarkShell>
  );
}

export function KpiBenchmarkChart({
  benchmark,
  className,
}: {
  benchmark: KpiBenchmarkView;
  className?: string;
}) {
  if (benchmark.kind === "boolean") {
    return <BooleanBenchmark view={benchmark} className={className} />;
  }
  return <NumericBenchmark view={benchmark} className={className} />;
}
