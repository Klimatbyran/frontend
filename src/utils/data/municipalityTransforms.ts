import type { Municipality } from "@/types/municipality";
import type { DataPoint } from "@/types/emissions";
import { mapEmissionArray } from "@/utils/data/emissionArrayUtils";
import { transformTerritoryEmissionsData } from "@/utils/data/territoryEmissionsTransforms";

export function transformEmissionsData(
  municipality: Municipality,
  now: Date = new Date(),
): DataPoint[] {
  return transformTerritoryEmissionsData(
    {
      emissions: mapEmissionArray(municipality.emissions),
      approximatedHistoricalEmission: mapEmissionArray(
        municipality.approximatedHistoricalEmission,
      ),
      trend: mapEmissionArray(municipality.trend),
    },
    now,
    { valuesInKg: false },
  );
}
