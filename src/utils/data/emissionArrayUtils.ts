import type { EmissionDataPoint } from "@/types/municipality";

export function emissionValueInYear(
  emissions: (EmissionDataPoint | null)[] | null | undefined,
  year: number | string | undefined,
): number | null {
  if (year == null || year === "" || !emissions) return null;
  const target = Number(year);
  if (!Number.isFinite(target)) return null;
  const point = emissions.find(
    (entry) => entry != null && Number(entry.year) === target,
  );
  if (!point || !Number.isFinite(point.value)) return null;
  return point.value;
}

export function mapEmissionArray(
  points:
    | ({ year: string | number; value: number } | null)[]
    | null
    | undefined,
): (EmissionDataPoint | null)[] {
  return (points ?? []).map((p) =>
    p ? { year: Number(p.year), value: p.value } : null,
  );
}
