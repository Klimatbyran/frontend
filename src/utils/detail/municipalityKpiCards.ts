import type { TFunction } from "i18next";
import { getMeetsParisDisplay } from "@/components/detail/meetsParisStat";
import type { SupportedLanguage } from "@/lib/languageDetection";
import type { Municipality } from "@/types/municipality";
import { emissionValueInYear } from "@/utils/data/emissionArrayUtils";
import {
  formatEmissionsAbsolute,
  formatPercent,
  formatPercentChange,
  localizeUnit,
} from "@/utils/formatting/localization";
import {
  booleanDistributionSpecs,
  procurementDistributionSpecs,
  resolveDistribution,
  type DistributionBucketSpec,
} from "@/utils/insights/kpiDistribution";
import {
  resolvePlacement,
  valuesForPlacement,
  type PlacementStatus,
} from "@/utils/insights/kpiPlacement";
import { getProcurementRequirementsText } from "@/utils/municipality/procurement";
import type { KpiCardModel } from "./kpiCardModel";

function latestReportedEmission(municipality: Municipality) {
  const point = municipality.emissions.at(-1);
  if (!point || !Number.isFinite(point.value)) return null;
  const year = Number(point.year);
  if (!Number.isFinite(year)) return null;
  return { year, value: point.value };
}

function changeClass(value: number): string {
  return value > 0 ? "text-pink-3" : "text-orange-2";
}

function procurementClass(score: number): string {
  if (score === 2) return "text-blue-3";
  if (score === 1) return "text-orange-2";
  return "text-pink-3";
}

export function buildMunicipalityKpiCards(
  municipality: Municipality,
  peers: readonly Municipality[],
  status: PlacementStatus,
  t: TFunction,
  language: SupportedLanguage,
): KpiCardModel[] {
  const nationalLabel = t("detailPage.kpiPlacement.nationally");
  const regionalLabel = municipality.region
    ? t("detailPage.kpiPlacement.inRegion", { region: municipality.region })
    : t("detailPage.kpiPlacement.inThisRegion");
  const isSubject = (peer: Municipality) => peer.name === municipality.name;
  const regionalPeers = municipality.region
    ? peers.filter((peer) => peer.region === municipality.region)
    : [];

  const scopesFor = (
    subjectValue: number | boolean | null | undefined,
    readPeer: (peer: Municipality) => number | boolean | null | undefined,
    higherIsBetter: boolean,
  ) => {
    const national = resolvePlacement(
      status,
      peers,
      valuesForPlacement(peers, isSubject, subjectValue, readPeer),
      subjectValue,
      higherIsBetter,
    );
    const regional = resolvePlacement(
      status,
      regionalPeers,
      valuesForPlacement(regionalPeers, isSubject, subjectValue, readPeer),
      subjectValue,
      higherIsBetter,
    );
    return [
      { id: "national", label: nationalLabel, ...national },
      { id: "regional", label: regionalLabel, ...regional },
    ];
  };

  const distributionFor = (
    subjectValue: number | boolean | null | undefined,
    readPeer: (peer: Municipality) => number | boolean | null | undefined,
    specs: readonly DistributionBucketSpec[],
  ) => {
    const national = resolveDistribution(
      status,
      peers,
      valuesForPlacement(peers, isSubject, subjectValue, readPeer),
      subjectValue,
      specs,
    );
    const regional = resolveDistribution(
      status,
      regionalPeers,
      valuesForPlacement(regionalPeers, isSubject, subjectValue, readPeer),
      subjectValue,
      specs,
    );
    return [
      {
        id: "national",
        label: nationalLabel,
        placement: null,
        ...national,
      },
      {
        id: "regional",
        label: regionalLabel,
        placement: null,
        ...regional,
      },
    ];
  };

  const yesNo = booleanDistributionSpecs({
    yes: t("yes"),
    no: t("no"),
    unknown: t("unknown"),
  });
  const procurementSteps = procurementDistributionSpecs({
    high: t("municipalityDetailPage.procurementScore.high"),
    medium: t("municipalityDetailPage.procurementScore.medium"),
    low: t("municipalityDetailPage.procurementScore.low"),
  });

  const paris = getMeetsParisDisplay(municipality.meetsParisGoal, t);
  const latest = latestReportedEmission(municipality);
  const evPerCharger = municipality.electricVehiclePerChargePoints;

  return [
    {
      id: "meetsParis",
      label: t("detailPage.meetsParisGoal"),
      value: paris.value,
      valueClassName: paris.valueClassName,
      comparison: "distribution",
      scopes: distributionFor(
        municipality.meetsParisGoal,
        (peer) => peer.meetsParisGoal,
        yesNo,
      ),
    },
    {
      id: "changeSince2015",
      label: t("municipalityDetailPage.annualChangeSince2015"),
      value: formatPercentChange(
        municipality.historicalEmissionChangePercent,
        language,
      ),
      valueClassName: changeClass(municipality.historicalEmissionChangePercent),
      scopes: scopesFor(
        municipality.historicalEmissionChangePercent,
        (peer) => peer.historicalEmissionChangePercent,
        false,
      ),
    },
    {
      id: "totalEmissions",
      label: t("detailPage.totalEmissions", { year: latest?.year }),
      value:
        latest == null
          ? t("noData")
          : formatEmissionsAbsolute(latest.value, language),
      valueClassName: latest == null ? "text-grey" : "text-orange-2",
      unit: latest == null ? undefined : t("emissionsUnit"),
      infoText: t("municipalityDetailPage.totalEmissionsTooltip"),
      scopes: scopesFor(
        latest?.value ?? null,
        (peer) => emissionValueInYear(peer.emissions, latest?.year),
        false,
      ),
    },
    {
      id: "consumption",
      label: t("municipalityDetailPage.consumptionEmissionsPerCapita"),
      value: localizeUnit(municipality.totalConsumptionEmission, language),
      valueClassName: "text-orange-2",
      unit: t("emissionsUnit"),
      scopes: scopesFor(
        municipality.totalConsumptionEmission,
        (peer) => peer.totalConsumptionEmission,
        false,
      ),
    },
    {
      id: "climatePlan",
      label: t("municipalityDetailPage.climatePlan"),
      value: municipality.climatePlanYear
        ? t("municipalityDetailPage.adopted", {
            year: municipality.climatePlanYear,
          })
        : t("municipalityDetailPage.noClimatePlan"),
      valueClassName: municipality.climatePlanYear
        ? "text-blue-3"
        : "text-pink-3",
      href: municipality.climatePlanLink ?? undefined,
      comparison: "distribution",
      scopes: distributionFor(
        municipality.climatePlanYear !== null,
        (peer) => peer.climatePlanYear !== null,
        yesNo,
      ),
    },
    {
      id: "procurement",
      label: t("municipalityDetailPage.procurementRequirements"),
      value: getProcurementRequirementsText(municipality.procurementScore, t),
      valueClassName: procurementClass(municipality.procurementScore),
      href: municipality.procurementLink ?? undefined,
      comparison: "distribution",
      scopes: distributionFor(
        municipality.procurementScore,
        (peer) => peer.procurementScore,
        procurementSteps,
      ),
    },
    {
      id: "electricCarChange",
      label: t("municipalityDetailPage.electricCarChange"),
      value: formatPercent(
        municipality.electricCarChangePercent,
        language,
        true,
      ),
      valueClassName: "text-orange-2",
      scopes: scopesFor(
        municipality.electricCarChangePercent,
        (peer) => peer.electricCarChangePercent,
        true,
      ),
    },
    {
      id: "evPerCharger",
      label: t("municipalityDetailPage.electricCarsPerChargePoint"),
      value:
        evPerCharger == null
          ? t("municipalityDetailPage.noChargePoints")
          : localizeUnit(evPerCharger, language),
      valueClassName:
        evPerCharger == null
          ? "text-grey"
          : evPerCharger > 10
            ? "text-pink-3"
            : "text-blue-3",
      scopes: scopesFor(
        evPerCharger,
        (peer) => peer.electricVehiclePerChargePoints,
        false,
      ),
    },
    {
      id: "bicycle",
      label: t("municipalityDetailPage.bicycleMetrePerCapita"),
      value: localizeUnit(municipality.bicycleMetrePerCapita, language),
      valueClassName: "text-orange-2",
      scopes: scopesFor(
        municipality.bicycleMetrePerCapita,
        (peer) => peer.bicycleMetrePerCapita,
        true,
      ),
    },
  ];
}
