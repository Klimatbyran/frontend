import type {
  BenchmarkTone,
  BenchmarkVisual,
  NumericBenchmarkView,
} from "@/utils/detail/kpiBenchmark";

export function numericBarUsesNeutralGradient(
  view: Pick<NumericBenchmarkView, "tone" | "visual">,
): boolean {
  return Boolean(view.visual?.neutralBar || view.tone === "neutral");
}

export function benchmarkToneTextClass(
  tone: BenchmarkTone,
  visual?: BenchmarkVisual,
  options?: { neutralGradientBar?: boolean },
): string {
  if (options?.neutralGradientBar || visual?.neutralBar) {
    return "text-orange-2";
  }
  if (tone === "good") {
    return visual?.goodAccent === "green" ? "text-green-3" : "text-blue-3";
  }
  if (tone === "bad") return "text-pink-3";
  if (tone === "neutral") return "text-orange-2";
  return "text-grey";
}

export function benchmarkToneFill(
  tone: BenchmarkTone,
  visual?: BenchmarkVisual,
  options?: { neutralGradientBar?: boolean },
): string {
  if (options?.neutralGradientBar || visual?.neutralBar) {
    return "var(--orange-2)";
  }
  if (tone === "good") {
    return visual?.goodAccent === "green" ? "var(--green-3)" : "var(--blue-3)";
  }
  if (tone === "bad") return "var(--pink-3)";
  if (tone === "neutral") return "var(--orange-2)";
  return "var(--grey)";
}

/** Text and marker colors aligned with the rendered numeric bar. */
export function numericBenchmarkAccent(view: NumericBenchmarkView): {
  textClass: string;
  fill: string;
} {
  const neutralGradientBar = numericBarUsesNeutralGradient(view);
  return {
    textClass: benchmarkToneTextClass(view.tone, view.visual, {
      neutralGradientBar,
    }),
    fill: benchmarkToneFill(view.tone, view.visual, { neutralGradientBar }),
  };
}

export function buildBooleanBarBackground(
  trueShare: number,
  higherIsBetter: boolean,
  visual?: BenchmarkVisual,
): string {
  const share = trueShare * 100;
  const favorableStart =
    higherIsBetter && visual?.goodAccent === "green"
      ? "var(--green-4)"
      : higherIsBetter
        ? "var(--blue-4)"
        : "var(--pink-4)";
  const favorableEnd =
    higherIsBetter && visual?.goodAccent === "green"
      ? "var(--green-3)"
      : higherIsBetter
        ? "var(--blue-3)"
        : "var(--pink-3)";
  const unfavorableStart = higherIsBetter ? "var(--pink-4)" : "var(--blue-4)";
  const unfavorableEnd = higherIsBetter ? "var(--pink-3)" : "var(--blue-3)";

  return `linear-gradient(to right, ${favorableStart} 0%, ${favorableEnd} ${share}%, ${unfavorableStart} ${share}%, ${unfavorableEnd} 100%)`;
}
