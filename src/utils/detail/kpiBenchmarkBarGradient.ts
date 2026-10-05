const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

/** Smooth comparative bar: transition around the peer median (rank space). */
export function buildComparativeBarGradient(
  averagePosition: number,
  higherIsBetter: boolean,
): string {
  const split = clampPercent(averagePosition * 100);
  const blend = 10;
  const leftStart = higherIsBetter ? "var(--pink-4)" : "var(--blue-4)";
  const leftMid = higherIsBetter ? "var(--pink-3)" : "var(--blue-3)";
  const rightMid = higherIsBetter ? "var(--blue-3)" : "var(--pink-3)";
  const rightEnd = higherIsBetter ? "var(--blue-4)" : "var(--pink-4)";

  return `linear-gradient(to right, ${leftStart} 0%, ${leftMid} ${clampPercent(split - blend)}%, ${rightMid} ${clampPercent(split + blend)}%, ${rightEnd} 100%)`;
}

/** Neutral absolute-size KPIs: warm scale without a good/bad direction. */
export function buildNeutralBarGradient(averagePosition: number): string {
  const split = clampPercent(averagePosition * 100);
  const blend = 12;

  return `linear-gradient(to right, var(--orange-1) 0%, var(--orange-2) ${clampPercent(split - blend)}%, var(--orange-3) ${clampPercent(split + blend)}%, var(--orange-4) 100%)`;
}
