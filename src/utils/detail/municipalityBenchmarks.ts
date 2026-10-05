import type { Municipality, EmissionDataPoint } from "@/types/municipality";
import {
  BENCHMARK_VISUAL,
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
): MunicipalityBenchmarkSet {
  const others = peers.filter((peer) => peer.name !== municipality.name);
  const inRegion = others.filter((peer) => peer.region === municipality.region);
  const emissions = latestEmissionValue(municipality.emissions);
  const chargePoints = municipality.electricVehiclePerChargePoints;

  return {
    meetsParis: buildBooleanBenchmark({
      value: municipality.meetsParisGoal,
      peers: others.map((peer) => peer.meetsParisGoal),
      higherIsBetter: true,
      peerGroup: "municipalities",
      peersIncludeSubject: false,
      visual: BENCHMARK_VISUAL.paris,
    }),
    totalEmissions:
      emissions === null
        ? null
        : buildNumericBenchmark({
            value: emissions,
            peers: numericValues(others, (peer) =>
              latestEmissionValue(peer.emissions),
            ),
            groupPeers: numericValues(inRegion, (peer) =>
              latestEmissionValue(peer.emissions),
            ),
            higherIsBetter: null,
            peersIncludeSubject: false,
            ...REGION_COMPARISON,
          }),
    changeSince2015: buildNumericBenchmark({
      value: municipality.historicalEmissionChangePercent,
      peers: numericValues(
        others,
        (peer) => peer.historicalEmissionChangePercent,
      ),
      groupPeers: numericValues(
        inRegion,
        (peer) => peer.historicalEmissionChangePercent,
      ),
      higherIsBetter: false,
      peersIncludeSubject: false,
      visual: BENCHMARK_VISUAL.neutralBar,
      ...REGION_COMPARISON,
    }),
    consumption: buildNumericBenchmark({
      value: municipality.totalConsumptionEmission,
      peers: numericValues(others, (peer) => peer.totalConsumptionEmission),
      groupPeers: numericValues(
        inRegion,
        (peer) => peer.totalConsumptionEmission,
      ),
      higherIsBetter: false,
      peersIncludeSubject: false,
      ...REGION_COMPARISON,
    }),
    climatePlan: buildBooleanBenchmark({
      value: municipality.climatePlan,
      peers: others.map((peer) => peer.climatePlan),
      higherIsBetter: true,
      peerGroup: "municipalities",
      peersIncludeSubject: false,
    }),
    procurement: buildNumericBenchmark({
      value: municipality.procurementScore,
      peers: numericValues(others, (peer) => peer.procurementScore),
      groupPeers: numericValues(inRegion, (peer) => peer.procurementScore),
      higherIsBetter: true,
      peersIncludeSubject: false,
      ...REGION_COMPARISON,
    }),
    electricCarChange: buildNumericBenchmark({
      value: municipality.electricCarChangePercent,
      peers: numericValues(others, (peer) => peer.electricCarChangePercent),
      groupPeers: numericValues(
        inRegion,
        (peer) => peer.electricCarChangePercent,
      ),
      higherIsBetter: true,
      peersIncludeSubject: false,
      visual: BENCHMARK_VISUAL.neutralBar,
      ...REGION_COMPARISON,
    }),
    chargePoints:
      chargePoints === null || !Number.isFinite(chargePoints)
        ? null
        : buildNumericBenchmark({
            value: chargePoints,
            peers: numericValues(
              others,
              (peer) => peer.electricVehiclePerChargePoints,
            ),
            groupPeers: numericValues(
              inRegion,
              (peer) => peer.electricVehiclePerChargePoints,
            ),
            higherIsBetter: false,
            peersIncludeSubject: false,
            ...REGION_COMPARISON,
          }),
    bicycle: buildNumericBenchmark({
      value: municipality.bicycleMetrePerCapita,
      peers: numericValues(others, (peer) => peer.bicycleMetrePerCapita),
      groupPeers: numericValues(inRegion, (peer) => peer.bicycleMetrePerCapita),
      higherIsBetter: true,
      peersIncludeSubject: false,
      visual: BENCHMARK_VISUAL.neutralBar,
      ...REGION_COMPARISON,
    }),
  };
}
