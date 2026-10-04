import type { Municipality, EmissionDataPoint } from "@/types/municipality";
import {
  buildBooleanBenchmark,
  buildNumericBenchmark,
  type BooleanBenchmarkView,
  type NumericBenchmarkView,
} from "./kpiBenchmark";

export interface MunicipalityBenchmarkSet {
  meetsParis: BooleanBenchmarkView | null;
  totalEmissions: NumericBenchmarkView | null;
  changeSince2015: NumericBenchmarkView | null;
  consumption: NumericBenchmarkView | null;
  climatePlan: BooleanBenchmarkView | null;
  procurement: NumericBenchmarkView | null;
  electricCarChange: NumericBenchmarkView | null;
  chargePoints: NumericBenchmarkView | null;
  bicycle: NumericBenchmarkView | null;
}

export interface MunicipalityBenchmarkFormatters {
  emissions: (value: number) => string;
  changePercent: (value: number) => string;
  sharePercent: (value: number) => string;
  plain: (value: number) => string;
}

const REGION_COMPARISON = {
  peerGroup: "municipalities" as const,
  groupPeerGroup: "municipalitiesInRegion" as const,
  reference: "region" as const,
};

export function latestEmissionValue(
  emissions: Array<EmissionDataPoint | null> | undefined,
): number | null {
  if (!emissions?.length) return null;
  for (let index = emissions.length - 1; index >= 0; index -= 1) {
    const point = emissions[index];
    if (point && Number.isFinite(point.value)) return point.value;
  }
  return null;
}

function numericValues(
  municipalities: Municipality[],
  read: (municipality: Municipality) => number | null | undefined,
): number[] {
  return municipalities
    .map(read)
    .filter(
      (value): value is number =>
        typeof value === "number" && Number.isFinite(value),
    );
}

export function buildMunicipalityBenchmarks(
  municipality: Municipality,
  peers: Municipality[],
  formatters: MunicipalityBenchmarkFormatters,
): MunicipalityBenchmarkSet {
  const inRegion = peers.filter((peer) => peer.region === municipality.region);
  const emissions = latestEmissionValue(municipality.emissions);
  const chargePoints = municipality.electricVehiclePerChargePoints;

  return {
    meetsParis: buildBooleanBenchmark({
      value: municipality.meetsParisGoal,
      peers: peers.map((peer) => peer.meetsParisGoal),
      higherIsBetter: true,
      peerGroup: "municipalities",
    }),
    totalEmissions:
      emissions === null
        ? null
        : buildNumericBenchmark({
            value: emissions,
            peers: numericValues(peers, (peer) =>
              latestEmissionValue(peer.emissions),
            ),
            groupPeers: numericValues(inRegion, (peer) =>
              latestEmissionValue(peer.emissions),
            ),
            higherIsBetter: null,
            format: formatters.emissions,
            ...REGION_COMPARISON,
          }),
    changeSince2015: buildNumericBenchmark({
      value: municipality.historicalEmissionChangePercent,
      peers: numericValues(
        peers,
        (peer) => peer.historicalEmissionChangePercent,
      ),
      groupPeers: numericValues(
        inRegion,
        (peer) => peer.historicalEmissionChangePercent,
      ),
      higherIsBetter: false,
      format: formatters.changePercent,
      ...REGION_COMPARISON,
    }),
    consumption: buildNumericBenchmark({
      value: municipality.totalConsumptionEmission,
      peers: numericValues(peers, (peer) => peer.totalConsumptionEmission),
      groupPeers: numericValues(
        inRegion,
        (peer) => peer.totalConsumptionEmission,
      ),
      higherIsBetter: false,
      format: formatters.plain,
      ...REGION_COMPARISON,
    }),
    climatePlan: buildBooleanBenchmark({
      value: municipality.climatePlan,
      peers: peers.map((peer) => peer.climatePlan),
      higherIsBetter: true,
      peerGroup: "municipalities",
    }),
    procurement: buildNumericBenchmark({
      value: municipality.procurementScore,
      peers: numericValues(peers, (peer) => peer.procurementScore),
      groupPeers: numericValues(inRegion, (peer) => peer.procurementScore),
      higherIsBetter: true,
      format: formatters.plain,
      ...REGION_COMPARISON,
    }),
    electricCarChange: buildNumericBenchmark({
      value: municipality.electricCarChangePercent,
      peers: numericValues(peers, (peer) => peer.electricCarChangePercent),
      groupPeers: numericValues(
        inRegion,
        (peer) => peer.electricCarChangePercent,
      ),
      higherIsBetter: true,
      format: formatters.sharePercent,
      ...REGION_COMPARISON,
    }),
    chargePoints:
      chargePoints === null || !Number.isFinite(chargePoints)
        ? null
        : buildNumericBenchmark({
            value: chargePoints,
            peers: numericValues(
              peers,
              (peer) => peer.electricVehiclePerChargePoints,
            ),
            groupPeers: numericValues(
              inRegion,
              (peer) => peer.electricVehiclePerChargePoints,
            ),
            higherIsBetter: false,
            format: formatters.plain,
            ...REGION_COMPARISON,
          }),
    bicycle: buildNumericBenchmark({
      value: municipality.bicycleMetrePerCapita,
      peers: numericValues(peers, (peer) => peer.bicycleMetrePerCapita),
      groupPeers: numericValues(inRegion, (peer) => peer.bicycleMetrePerCapita),
      higherIsBetter: true,
      format: formatters.plain,
      ...REGION_COMPARISON,
    }),
  };
}
