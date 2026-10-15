import type { EmissionDataPoint } from "@/types/municipality";

export function mapEmissionArray(
  points:
    | ({
        year: string | number;
        value: number;
        isAIGenerated?: boolean;
      } | null)[]
    | null
    | undefined,
): (EmissionDataPoint | null)[] {
  return (points ?? []).map((p) =>
    p
      ? {
          year: Number(p.year),
          value: p.value,
          ...(p.isAIGenerated ? { isAIGenerated: true } : {}),
        }
      : null,
  );
}
