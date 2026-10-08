import type { TFunction } from "i18next";
import { getMeetsParisDisplay } from "@/components/detail/meetsParisStat";
import type { SupportedLanguage } from "@/lib/languageDetection";
import type { EmissionDataPoint } from "@/types/municipality";
import { emissionValueInYear } from "@/utils/data/emissionArrayUtils";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import {
  resolvePlacement,
  valuesForPlacement,
  type PlacementStatus,
} from "@/utils/insights/kpiPlacement";
import type { KpiCardModel } from "./kpiCardModel";

export type RegionKpiPeer = {
  name: string;
  meetsParis: boolean | null;
  historicalEmissionChangePercent: number | null;
  emissionsByYear: Record<string, number>;
};

export type RegionKpiSubject = {
  name: string;
  meetsParis: boolean;
  historicalEmissionChangePercent: number;
  emissions: (EmissionDataPoint | null)[];
};

function changeClass(value: number): string {
  return value > 0 ? "text-pink-3" : "text-orange-2";
}

function peerEmission(
  peer: RegionKpiPeer,
  year: number | undefined,
): number | null {
  if (year == null) return null;
  const value = peer.emissionsByYear[String(year)];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function buildRegionKpiCards(
  region: RegionKpiSubject,
  peers: readonly RegionKpiPeer[],
  lastYear: number | undefined,
  status: PlacementStatus,
  t: TFunction,
  language: SupportedLanguage,
): KpiCardModel[] {
  const nationalLabel = t("detailPage.kpiPlacement.nationally");
  const isSubject = (peer: RegionKpiPeer) => peer.name === region.name;
  const total = emissionValueInYear(region.emissions, lastYear);
  const paris = getMeetsParisDisplay(region.meetsParis, t);

  const nationalScope = (
    id: string,
    read: (peer: RegionKpiPeer) => number | boolean | null | undefined,
    subjectValue: number | boolean | null | undefined,
    higherIsBetter: boolean,
  ) => {
    const resolved = resolvePlacement(
      status,
      peers,
      valuesForPlacement(peers, isSubject, subjectValue, read),
      subjectValue,
      higherIsBetter,
    );
    return [{ id, label: nationalLabel, ...resolved }];
  };

  return [
    {
      id: "meetsParis",
      label: t("detailPage.meetsParisGoal"),
      value: paris.value,
      valueClassName: paris.valueClassName,
      scopes: nationalScope(
        "national",
        (peer) => peer.meetsParis,
        region.meetsParis,
        true,
      ),
    },
    {
      id: "changeSince2015",
      label: t("detailPage.changeSince2015"),
      value: formatPercentChange(
        region.historicalEmissionChangePercent,
        language,
      ),
      valueClassName: changeClass(region.historicalEmissionChangePercent),
      scopes: nationalScope(
        "national",
        (peer) => peer.historicalEmissionChangePercent,
        region.historicalEmissionChangePercent,
        false,
      ),
    },
    {
      id: "totalEmissions",
      label: t("detailPage.totalEmissions", { year: lastYear }),
      value:
        total == null ? t("noData") : formatEmissionsAbsolute(total, language),
      valueClassName: total == null ? "text-grey" : "text-orange-2",
      unit: total == null ? undefined : t("emissionsUnit"),
      infoText: t("municipalityDetailPage.totalEmissionsTooltip"),
      scopes: nationalScope(
        "national",
        (peer) => peerEmission(peer, lastYear),
        total,
        false,
      ),
    },
  ];
}
