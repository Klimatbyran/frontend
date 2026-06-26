import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { useLanguage } from "@/components/LanguageProvider";
import { formatPercentChange } from "@/utils/formatting/localization";
import type { TerritoryBenchmarkData } from "@/types/territoryBenchmarks";

interface BenchmarkSummaryCardsProps {
  benchmarkData: TerritoryBenchmarkData;
  entityName: string;
}

function formatDiffValue(
  value: number,
  unit: string,
  currentLanguage: ReturnType<typeof useLanguage>["currentLanguage"],
): string {
  const prefix = value > 0 ? "+" : "";
  if (unit === "%") {
    return `${prefix}${formatPercentChange(value, currentLanguage, true)}`;
  }
  return `${prefix}${value.toFixed(1)}${unit ? ` ${unit}` : ""}`;
}

export function BenchmarkSummaryCards({
  benchmarkData,
  entityName,
}: BenchmarkSummaryCardsProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { metric, rank, totalPeers, percentile, diffFromPeerAverage } =
    benchmarkData;

  const cards = [
    {
      label: t("territoryBenchmarks.rankLabel"),
      value:
        rank !== null
          ? t("territoryBenchmarks.rankValue", {
              rank,
              total: totalPeers,
            })
          : t("noData"),
      description: t("territoryBenchmarks.rankDescription", {
        name: entityName,
      }),
      valueClassName: "text-blue-3",
    },
    {
      label: t("territoryBenchmarks.percentileLabel"),
      value:
        percentile !== null
          ? t("territoryBenchmarks.percentileValue", { percentile })
          : t("noData"),
      description: t("territoryBenchmarks.percentileDescription"),
      valueClassName: "text-green-3",
    },
    {
      label: t("territoryBenchmarks.diffFromAverageLabel"),
      value:
        diffFromPeerAverage !== null
          ? formatDiffValue(
              diffFromPeerAverage,
              metric.unit,
              currentLanguage,
            )
          : t("noData"),
      description: t("territoryBenchmarks.diffFromAverageDescription"),
      valueClassName:
        diffFromPeerAverage === null
          ? "text-grey"
          : metric.higherIsBetter
            ? diffFromPeerAverage >= 0
              ? "text-green-3"
              : "text-pink-3"
            : diffFromPeerAverage <= 0
              ? "text-green-3"
              : "text-pink-3",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-level-2 bg-black-1/60 p-5 md:p-6 space-y-2"
        >
          <Text className="text-sm md:text-base text-grey">{card.label}</Text>
          <Text className={`text-3xl md:text-5xl ${card.valueClassName}`}>
            {card.value}
          </Text>
          <Text className="text-xs md:text-sm text-grey">{card.description}</Text>
        </div>
      ))}
    </div>
  );
}
