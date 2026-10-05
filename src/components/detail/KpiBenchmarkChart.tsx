import type React from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type {
  BenchmarkPhrase,
  BenchmarkTone,
  BooleanBenchmarkView,
  KpiBenchmarkView,
  NumericBenchmarkView,
} from "@/utils/detail/kpiBenchmark";
import {
  buildComparativeBarGradient,
  buildNeutralBarGradient,
} from "@/utils/detail/kpiBenchmarkBarGradient";
import {
  benchmarkToneFill,
  benchmarkToneTextClass,
  buildBooleanBarBackground,
} from "@/components/detail/kpiBenchmarkColors";

function phraseText(
  t: (key: string, options?: Record<string, unknown>) => string,
  phrase: BenchmarkPhrase,
) {
  return t(phrase.key, {
    percent: phrase.percent,
    peers: phrase.peerGroup
      ? t(`kpiBenchmark.peers.${phrase.peerGroup}`)
      : undefined,
    place: phrase.peerGroup
      ? t(`kpiBenchmark.place.${phrase.peerGroup}`)
      : undefined,
    reference: phrase.reference
      ? t(`kpiBenchmark.reference.${phrase.reference}`)
      : undefined,
  });
}

function numericGradient(view: NumericBenchmarkView) {
  if (view.visual?.neutralBar || view.tone === "neutral") {
    return buildNeutralBarGradient(view.averagePosition);
  }
  return buildComparativeBarGradient(
    view.averagePosition,
    view.higherIsBetter ?? false,
  );
}

function BenchmarkShell({
  primary,
  tone,
  visual,
  className,
  children,
}: {
  primary: string;
  tone: BenchmarkTone;
  visual?: NumericBenchmarkView["visual"];
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className ?? "mt-2")}>
      {children}
      <Text
        className={cn(
          "mt-1.5 line-clamp-1 min-h-[1.25rem] text-sm",
          benchmarkToneTextClass(tone, visual),
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
  const showMedian = view.higherIsBetter === null;

  return (
    <BenchmarkShell
      primary={primary}
      tone={view.tone}
      visual={view.visual}
      className={className}
    >
      <div role="img" aria-label={primary} className="px-1">
        <div className="relative h-3">
          <div
            className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full"
            style={{ background: numericGradient(view) }}
          />
          {showMedian && (
            <span
              className="absolute top-1/2 z-[1] h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-orange-3"
              style={{ left: `${view.averagePosition * 100}%` }}
              title={`${t(`kpiBenchmark.reference.${view.primaryReference}`)} ${view.averageLabel}`}
            />
          )}
          <span
            className="absolute top-1/2 z-[2] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${view.position * 100}%`,
              background: benchmarkToneFill(view.tone, view.visual),
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
  const primary = phraseText(t, view.primary);
  const barBackground = buildBooleanBarBackground(
    view.trueShare,
    view.higherIsBetter,
    view.visual,
  );

  return (
    <BenchmarkShell
      primary={primary}
      tone={view.tone}
      visual={view.visual}
      className={className}
    >
      <div role="img" aria-label={primary} className="px-1">
        <div className="relative flex h-3 items-center">
          <div
            className="h-1.5 w-full rounded-full"
            style={{ background: barBackground }}
          />
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
