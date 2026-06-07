import type { Municipality } from "@/types/municipality";

export type ClosestMunicipalityEmission = {
  name: string;
  year: number;
  value: number;
};

export function getEmissionForYear(
  municipality: Municipality,
  year: number,
): number | null {
  const point = municipality.approximatedHistoricalEmission.find(
    (entry) => entry?.year === year,
  );
  return point?.value ?? null;
}

export function getMunicipalityEmissionByName(
  municipalities: Municipality[],
  name: string,
  year: number,
): ClosestMunicipalityEmission | null {
  const municipality = municipalities.find((entry) => entry.name === name);
  if (!municipality) return null;

  const value = getEmissionForYear(municipality, year);
  if (value === null) return null;

  return { name: municipality.name, year, value };
}

export function findClosestMunicipalityEmission(
  municipalities: Municipality[],
  targetValue: number,
  year: number,
): ClosestMunicipalityEmission | null {
  let closest: ClosestMunicipalityEmission | null = null;
  let smallestDiff = Infinity;

  for (const municipality of municipalities) {
    const value = getEmissionForYear(municipality, year);
    if (value === null) continue;

    const diff = Math.abs(value - targetValue);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closest = {
        name: municipality.name,
        year,
        value,
      };
    }
  }

  return closest;
}
