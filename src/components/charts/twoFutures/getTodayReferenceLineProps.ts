export function getTodayReferenceLineProps(
  currentYear: number,
  todayLabel: string,
) {
  return {
    x: currentYear,
    stroke: "var(--orange-3)",
    strokeWidth: 1,
    strokeDasharray: "4 4",
    label: {
      value: todayLabel,
      position: "insideTopLeft" as const,
      fill: "var(--orange-3)",
      fontSize: 12,
    },
  };
}
