import type React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useChartMotion } from "@/hooks/useChartMotion";
import type {
  BenchmarkPhrase,
  BooleanBenchmarkView,
  KpiBenchmarkView,
  NumericBenchmarkView,
} from "@/utils/detail/kpiBenchmark";
import {
  buildComparativeBarGradient,
  buildNeutralBarGradient,
} from "@/utils/detail/kpiBenchmarkBarGradient";
import {
  benchmarkToneTextClass,
  booleanBarLegendColors,
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

/** Each dot pops in; the wave finishes under ~1.6s even for a full peer set. */
const DOT_ENTER_DURATION = 0.2;
const DOT_WAVE_SPAN = 1.35;
const UNKNOWN_DOT = "rgba(255,255,255,0.2)";

/**
 * A detail KPI column is about 14rem wide, so the cluster stays small and
 * wraps instead of using the large overview-card dots.
 */
function peerDotSize(total: number): number {
  if (total <= 16) return 12;
  if (total <= 48) return 10;
  return 8;
}

function dotStaggerStep(count: number): number {
  if (count <= 1) return 0;
  return DOT_WAVE_SPAN / (count - 1);
}

interface PeerDot {
  color: string;
  subject: boolean;
}

function peerDots(view: BooleanBenchmarkView): PeerDot[] {
  const colors = booleanBarLegendColors(view.higherIsBetter, view.visual);
  const groups = [
    {
      count: view.yesCount,
      color: colors.yes,
      subject: view.subjectValue === true,
    },
    {
      count: view.noCount,
      color: colors.no,
      subject: view.subjectValue === false,
    },
    { count: view.unknownCount, color: UNKNOWN_DOT, subject: false },
  ];
  const dots: PeerDot[] = [];
  for (const group of groups) {
    for (let index = 0; index < group.count; index += 1) {
      dots.push({
        color: group.color,
        subject: group.subject && index === 0,
      });
    }
  }
  return dots;
}

function BooleanPeerDots({ view }: { view: BooleanBenchmarkView }) {
  const { reduceMotion, ease } = useChartMotion();
  const dots = peerDots(view);
  const size = peerDotSize(dots.length);
  const staggerStep = dotStaggerStep(dots.length);

  return (
    <motion.div
      aria-hidden="true"
      className="flex flex-wrap"
      style={{ gap: 3 }}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduceMotion ? 0 : staggerStep,
          },
        },
      }}
    >
      {dots.map((dot, index) => (
        <motion.span
          key={index}
          className={cn("block shrink-0 rounded-full", dot.subject && "z-[1]")}
          style={{
            width: size,
            height: size,
            backgroundColor: dot.color,
            boxShadow: dot.subject
              ? "0 0 0 1.5px rgba(255,255,255,0.95)"
              : undefined,
          }}
          variants={{
            hidden: { opacity: 0, scale: 0.35 },
            visible: {
              opacity: 1,
              scale: 1,
              transition: {
                duration: reduceMotion ? 0 : DOT_ENTER_DURATION,
                ease,
              },
            },
          }}
        />
      ))}
    </motion.div>
  );
}

function BooleanDotLegend({ view }: { view: BooleanBenchmarkView }) {
  const { t } = useTranslation();
  const colors = booleanBarLegendColors(view.higherIsBetter, view.visual);
  const items = [
    { color: colors.yes, label: t("yes") },
    { color: colors.no, label: t("no") },
    ...(view.unknownCount > 0
      ? [{ color: UNKNOWN_DOT, label: t("unknown") }]
      : []),
  ];

  return (
    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs leading-none text-grey">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
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

  return (
    <BenchmarkShell
      primary={primary}
      textClassName={benchmarkToneTextClass(view.tone, view.visual)}
      className={className}
    >
      <div role="img" aria-label={primary}>
        <BooleanPeerDots view={view} />
      </div>
      <BooleanDotLegend view={view} />
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
