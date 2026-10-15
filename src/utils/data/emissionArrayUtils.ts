import type { EmissionDataPoint } from "@/types/municipality";

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
