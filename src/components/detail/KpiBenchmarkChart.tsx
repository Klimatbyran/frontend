import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type {
  BenchmarkPhrase,
  BenchmarkReference,
  BenchmarkTone,
  BooleanBenchmarkView,
  KpiBenchmarkView,
  NumericBenchmarkView,
} from "@/utils/detail/kpiBenchmark";

const TONE_TEXT: Record<BenchmarkTone, string> = {
  good: "text-green-3",
  bad: "text-pink-3",
  neutral: "text-orange-2",
  unknown: "text-grey",
};

const TONE_FILL: Record<BenchmarkTone, string> = {
  good: "var(--green-3)",
  bad: "var(--pink-3)",
  neutral: "var(--orange-2)",
  unknown: "var(--grey)",
};

function phraseText(
  t: (key: string, options?: Record<string, unknown>) => string,
  phrase: BenchmarkPhrase,
) {
  return t(phrase.key, {
    percent: phrase.percent,
    peers: phrase.peerGroup
      ? t(`kpiBenchmark.peers.${phrase.peerGroup}`)
      : undefined,
    reference: phrase.reference
      ? t(`kpiBenchmark.reference.${phrase.reference}`)
      : undefined,
  });
}

function averageLegendKey(reference: BenchmarkReference) {
  if (reference === "all") return "kpiBenchmark.legendAverage";
  return `kpiBenchmark.referenceShort.${reference}`;
}

function numericGradient(view: NumericBenchmarkView) {
  if (view.higherIsBetter === null) return "var(--black-1)";
  const split = Math.min(100, Math.max(0, view.averagePosition * 100));
  const good = "var(--green-3)";
  const bad = "var(--pink-3)";
  const left = view.higherIsBetter ? bad : good;
  const right = view.higherIsBetter ? good : bad;
  return `linear-gradient(to right, ${left} 0%, ${left} ${split}%, ${right} ${split}%, ${right} 100%)`;
}

function NumericBenchmark({ view }: { view: NumericBenchmarkView }) {
  const { t } = useTranslation();
  const primary = phraseText(t, view.primary);
  const secondary = view.secondary ? phraseText(t, view.secondary) : null;
  const averageName = t(averageLegendKey(view.primaryReference));
  const rangeLabel = [
    `${t("kpiBenchmark.smallest")} ${view.minLabel}`,
    `${t("kpiBenchmark.largest")} ${view.maxLabel}`,
    `${averageName} ${view.averageLabel}`,
    view.overallAverageLabel
      ? `${t("kpiBenchmark.legendAll")} ${view.overallAverageLabel}`
      : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mt-3 min-w-0 space-y-2">
      <Text className={cn("text-sm md:text-base", TONE_TEXT[view.tone])}>
        {primary}
      </Text>
      {secondary && (
        <Text className="text-xs text-grey md:text-sm">{secondary}</Text>
      )}
      <div role="img" aria-label={rangeLabel} className="px-1.5">
        <div className="relative h-4">
          <div
            className="absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full"
            style={{ background: numericGradient(view) }}
          />
          {view.overallAveragePosition !== null && (
            <span
              className="absolute top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-3"
              style={{ left: `${view.overallAveragePosition * 100}%` }}
              title={`${t("kpiBenchmark.legendAll")} ${view.overallAverageLabel ?? ""}`}
            />
          )}
          <span
            className="absolute top-1/2 z-[1] h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-2"
            style={{ left: `${view.averagePosition * 100}%` }}
            title={`${averageName} ${view.averageLabel}`}
          />
          <span
            className="absolute top-1/2 z-[2] h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${view.position * 100}%`,
              background: TONE_FILL[view.tone],
              boxShadow: "0 0 0 2px rgba(255,255,255,0.9)",
            }}
            title={primary}
          />
        </div>
        <div className="mt-1 flex justify-between gap-3 text-[11px] text-grey">
          <span title={t("kpiBenchmark.smallest")}>{view.minLabel}</span>
          <span title={t("kpiBenchmark.largest")}>{view.maxLabel}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-grey">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: TONE_FILL[view.tone] }}
          />
          {t("kpiBenchmark.legendYou")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-0.5 rounded-full bg-orange-2" />
          {averageName} {view.averageLabel}
        </span>
        {view.overallAverageLabel && (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-0.5 rounded-full bg-blue-3" />
            {t("kpiBenchmark.legendAll")} {view.overallAverageLabel}
          </span>
        )}
      </div>
    </div>
  );
}

function BooleanBenchmark({ view }: { view: BooleanBenchmarkView }) {
  const { t } = useTranslation();
  const primary = phraseText(t, view.primary);
  const secondary = view.secondary ? phraseText(t, view.secondary) : null;
  const yesIsGood = view.higherIsBetter;
  const yesColor = yesIsGood ? "var(--green-3)" : "var(--pink-3)";
  const noColor = yesIsGood ? "var(--pink-3)" : "var(--green-3)";
  const share =
    view.primary.key === "kpiBenchmark.booleanUnknown"
      ? null
      : phraseText(t, {
          key: "kpiBenchmark.shareOfPeers",
          percent: Math.round(view.trueShare * 100),
          peerGroup: view.peerGroup,
        });

  return (
    <div className="mt-3 min-w-0 space-y-2">
      <Text className={cn("text-sm md:text-base", TONE_TEXT[view.tone])}>
        {primary}
      </Text>
      <div
        role="img"
        aria-label={share ?? primary}
        className="flex h-2.5 overflow-hidden rounded-full"
      >
        <div
          style={{
            width: `${view.trueShare * 100}%`,
            background: yesColor,
          }}
        />
        <div
          style={{
            width: `${(1 - view.trueShare) * 100}%`,
            background: noColor,
            opacity: 0.45,
          }}
        />
      </div>
      {share && <Text className="text-xs text-grey md:text-sm">{share}</Text>}
      {secondary && (
        <Text className="text-xs text-grey md:text-sm">{secondary}</Text>
      )}
    </div>
  );
}

export function KpiBenchmarkChart({
  benchmark,
}: {
  benchmark: KpiBenchmarkView;
}) {
  if (benchmark.kind === "boolean") {
    return <BooleanBenchmark view={benchmark} />;
  }
  return <NumericBenchmark view={benchmark} />;
}
