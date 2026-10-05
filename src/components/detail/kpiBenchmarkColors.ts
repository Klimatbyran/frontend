import type {
  BenchmarkTone,
  BenchmarkVisual,
} from "@/utils/detail/kpiBenchmark";

export function benchmarkToneTextClass(
  tone: BenchmarkTone,
  visual?: BenchmarkVisual,
): string {
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
): string {
  if (tone === "good") {
    return visual?.goodAccent === "green" ? "var(--green-3)" : "var(--blue-3)";
  }
  if (tone === "bad") return "var(--pink-3)";
  if (tone === "neutral") return "var(--orange-2)";
  return "var(--grey)";
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
