import type { LegendItem } from "@/types/charts";

export function createTwoFuturesLegendItems(
  t: (key: string) => string,
  translationPrefix: string,
  includeFuturePaths = true,
): LegendItem[] {
  const items: LegendItem[] = [
    {
      name: t(`${translationPrefix}.pastPath`),
      color: "#ffffff",
      isClickable: false,
      isHidden: false,
      isDashed: false,
    },
  ];

  if (!includeFuturePaths) return items;

  items.push(
    {
      name: t(`${translationPrefix}.trendPath`),
      color: "var(--pink-3)",
      isClickable: false,
      isHidden: false,
      isDashed: true,
    },
    {
      name: t(`${translationPrefix}.parisPath`),
      color: "var(--green-2)",
      isClickable: false,
      isHidden: false,
      isDashed: true,
    },
  );

  return items;
}
