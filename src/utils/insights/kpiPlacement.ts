export type ComparableKpi = number | boolean;

export type KpiPlacement = {
  /** 1 is the best place. Ties share that rank. */
  rank: number;
  /** How many values in the set equal the subject, including the subject. */
  tiedWith: number;
  /** Comparable values in the set, including the subject. */
  total: number;
};

export type PlacementStatus = "loading" | "ready" | "error";

export type ResolvedPlacement = {
  placement: KpiPlacement | null;
  pending: boolean;
};

function asComparable(
  value: number | boolean | null | undefined,
): ComparableKpi | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

function toScore(value: ComparableKpi): number {
  return typeof value === "boolean" ? (value ? 1 : 0) : value;
}

function isStrictlyBetter(
  candidate: ComparableKpi,
  subject: ComparableKpi,
  higherIsBetter: boolean,
): boolean {
  const difference = toScore(candidate) - toScore(subject);
  return higherIsBetter ? difference > 0 : difference < 0;
}

/**
 * Rank `subject` inside `values`. `values` must include the subject once.
 * Missing values are left out of the set. Rank 1 is best.
 */
export function placeInSet(
  values: Array<number | boolean | null | undefined>,
  subject: number | boolean | null | undefined,
  higherIsBetter: boolean,
): KpiPlacement | null {
  const subjectValue = asComparable(subject);
  if (subjectValue === null) return null;

  const comparable = values
    .map(asComparable)
    .filter((value): value is ComparableKpi => value !== null);

  if (comparable.length === 0) return null;

  const strictlyBetter = comparable.filter((value) =>
    isStrictlyBetter(value, subjectValue, higherIsBetter),
  ).length;
  const tiedWith = comparable.filter(
    (value) => toScore(value) === toScore(subjectValue),
  ).length;

  return {
    rank: strictlyBetter + 1,
    tiedWith,
    total: comparable.length,
  };
}

/** Drop the subject's own row, then append the value shown on the page. */
export function valuesForPlacement<T>(
  entities: readonly T[],
  isSubject: (entity: T) => boolean,
  subjectValue: number | boolean | null | undefined,
  read: (entity: T) => number | boolean | null | undefined,
): Array<number | boolean | null | undefined> {
  return [
    ...entities.filter((entity) => !isSubject(entity)).map(read),
    subjectValue,
  ];
}

export function resolvePlacement(
  status: PlacementStatus,
  entities: readonly unknown[],
  values: Array<number | boolean | null | undefined>,
  subject: number | boolean | null | undefined,
  higherIsBetter: boolean,
): ResolvedPlacement {
  if (status === "loading") return { placement: null, pending: true };
  if (status === "error" || entities.length === 0) {
    return { placement: null, pending: false };
  }
  return {
    placement: placeInSet(values, subject, higherIsBetter),
    pending: false,
  };
}

/** 0 sits with the best results, 1 with the worst. Ties use the middle of the tie. */
export function placementMarker(placement: KpiPlacement): number {
  if (placement.total <= 1) return 0;
  const midpoint = placement.rank - 1 + Math.max(placement.tiedWith - 1, 0) / 2;
  return Math.min(1, Math.max(0, midpoint / (placement.total - 1)));
}

export type PlacementTone = "good" | "mid" | "poor";

export function placementTone(placement: KpiPlacement): PlacementTone {
  if (placement.rank === 1) return "good";
  const marker = placementMarker(placement);
  if (marker <= 1 / 3) return "good";
  if (marker <= 2 / 3) return "mid";
  return "poor";
}
