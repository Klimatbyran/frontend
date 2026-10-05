import { useTranslation } from "react-i18next";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";
import { DetailStat } from "@/components/detail/DetailHeader";
import { createMeetsParisStat } from "@/components/detail/meetsParisStat";
import type { EmissionDataPoint } from "@/types/municipality";
import type { SupportedLanguage } from "@/lib/languageDetection";
import {
  BENCHMARK_VISUAL,
  buildBooleanBenchmark,
  buildNumericBenchmark,
} from "@/utils/detail/kpiBenchmark";

export type TerritoryDetailStatsSource = {
  meetsParis: boolean;
  historicalEmissionChangePercent: number;
  emissions: (EmissionDataPoint | null)[];
};

export type TerritoryBenchmarkPeer = {
  historicalEmissionChangePercent: number | null;
  meetsParis: boolean | null;
  totalEmissions: number | null;
};

function createChangeSince2015Stat(
  historicalEmissionChangePercent: number,
  currentLanguage: SupportedLanguage,
  t: ReturnType<typeof useTranslation>["t"],
): DetailStat {
  return {
    label: t("detailPage.changeSince2015"),
    value: formatPercentChange(
      historicalEmissionChangePercent,
      currentLanguage,
    ),
    valueClassName:
      historicalEmissionChangePercent > 0 ? "text-pink-3" : "text-orange-2",
  };
}

function createTotalEmissionsStat(
  emissions: number,
  lastYear: number,
  currentLanguage: SupportedLanguage,
  t: ReturnType<typeof useTranslation>["t"],
): DetailStat {
  return {
    label: t("detailPage.totalEmissions", { year: lastYear }),
    value: formatEmissionsAbsolute(emissions, currentLanguage),
    unit: t("emissionsUnit"),
    valueClassName: "text-orange-2",
    info: true,
    infoText: t("municipalityDetailPage.totalEmissionsTooltip"),
  };
}

function finiteNumbers(values: Array<number | null | undefined>): number[] {
  return values.filter(
    (value): value is number =>
      typeof value === "number" && Number.isFinite(value),
  );
}

export function useTerritoryDetailHeaderStats(
  territory: TerritoryDetailStatsSource | null,
  lastYear: number | undefined,
  options?: {
    peers?: TerritoryBenchmarkPeer[];
    /** Absolute totals are only compared when the peers are the same kind of place. */
    compareTotalEmissions?: boolean;
  },
) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  if (!territory || !lastYear) {
    return [];
  }

  const peers = options?.peers ?? [];
  const reportedEmissions = territory.emissions.find(
    (point) => point?.year === lastYear,
  )?.value;
  const lastYearEmissions = Number.isFinite(reportedEmissions)
    ? reportedEmissions
    : null;
  const compareTotalEmissions = options?.compareTotalEmissions !== false;

  const meetsParis = {
    ...createMeetsParisStat(territory.meetsParis, t),
    benchmark: buildBooleanBenchmark({
      value: territory.meetsParis,
      peers: peers.map((peer) => peer.meetsParis),
      higherIsBetter: true,
      peerGroup: "regions",
      peersIncludeSubject: false,
      visual: BENCHMARK_VISUAL.paris,
    }),
  };
  const change = {
    ...createChangeSince2015Stat(
      territory.historicalEmissionChangePercent,
      currentLanguage,
      t,
    ),
    benchmark: buildNumericBenchmark({
      value: territory.historicalEmissionChangePercent,
      peers: finiteNumbers(
        peers.map((peer) => peer.historicalEmissionChangePercent),
      ),
      higherIsBetter: false,
      peerGroup: "regions",
      peersIncludeSubject: false,
      visual: BENCHMARK_VISUAL.neutralBar,
    }),
  };
  const total = {
    ...createTotalEmissionsStat(
      lastYearEmissions ?? 0,
      lastYear,
      currentLanguage,
      t,
    ),
    benchmark:
      compareTotalEmissions && lastYearEmissions !== null
        ? buildNumericBenchmark({
            value: lastYearEmissions,
            peers: finiteNumbers(peers.map((peer) => peer.totalEmissions)),
            higherIsBetter: null,
            peerGroup: "regions",
            peersIncludeSubject: false,
          })
        : null,
  };

  return [meetsParis, change, total];
}
