import type { LegendItem } from "@/types/charts";

export type TwoFuturesLegendMarkers = {
  estimated?: boolean;
};

function estimatedLabelKey(translationPrefix: string) {
  return translationPrefix.startsWith("detailPage")
    ? `${translationPrefix}.estimated`
    : `${translationPrefix}.approximated`;
}

export function createTwoFuturesLegendItems(
  t: (key: string) => string,
  translationPrefix: string,
  includeFuturePaths = true,
  markers: TwoFuturesLegendMarkers = {},
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

  if (markers.estimated) {
    items.push({
      name: t(estimatedLabelKey(translationPrefix)),
      color: "#ffffff",
      isClickable: false,
      isHidden: false,
      isDashed: true,
    });
  }

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
