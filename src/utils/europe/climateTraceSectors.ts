import type { SectorEmissions } from "@/types/emissions";

/** Climate TRACE sectors included in country totals (excludes forestry-and-land-use). */
export const CLIMATE_TRACE_EMISSIONS_SECTORS = [
  "transportation",
  "manufacturing",
  "agriculture",
  "power",
  "fossil-fuel-operations",
  "buildings",
  "waste",
  "fluorinated-gases",
  "mineral-extraction",
] as const;

export type ClimateTraceEmissionsSector =
  (typeof CLIMATE_TRACE_EMISSIONS_SECTORS)[number];

export type ClimateTraceSectorEmissionsByYear = Record<
  number,
  Partial<Record<ClimateTraceEmissionsSector, number>>
>;

export function buildClimateTraceSectorEmissionsResponse(
  sectorEmissionsByYear: ClimateTraceSectorEmissionsByYear | undefined,
): SectorEmissions | null {
  if (!sectorEmissionsByYear) {
    return null;
  }

  const sectors = Object.fromEntries(
    Object.entries(sectorEmissionsByYear)
      .map(([year, values]) => {
        const filteredEntries = Object.entries(values ?? {}).filter(
          ([, value]) => typeof value === "number" && value > 0,
        );

        if (filteredEntries.length === 0) {
          return null;
        }

        return [year, Object.fromEntries(filteredEntries)];
      })
      .filter((entry): entry is [string, Record<string, number>] =>
        Boolean(entry),
      ),
  );

  if (Object.keys(sectors).length === 0) {
    return null;
  }

  return { sectors };
}
