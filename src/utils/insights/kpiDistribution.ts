import type { PlacementStatus } from "./kpiPlacement";

export type DistributionTone = "good" | "mid" | "poor" | "muted";

export type DistributionBucketSpec = {
  id: string;
  label: string;
  tone: DistributionTone;
  matches: (value: number | boolean | null | undefined) => boolean;
};

export type DistributionBucket = {
  id: string;
  label: string;
  count: number;
  tone: DistributionTone;
  /** The value shown on the card falls in this bucket. */
  active: boolean;
};

export type KpiDistribution = {
  total: number;
  buckets: DistributionBucket[];
};

export type ResolvedDistribution = {
  distribution: KpiDistribution | null;
  pending: boolean;
};

/**
 * Count `values` into discrete buckets. Specs must not overlap.
 * Empty buckets are left out. A subject that matches nothing is not highlighted.
 */
export function distributeValues(
  values: Array<number | boolean | null | undefined>,
  subject: number | boolean | null | undefined,
  specs: readonly DistributionBucketSpec[],
): KpiDistribution | null {
  const buckets = specs
    .map((spec) => ({
      id: spec.id,
      label: spec.label,
      tone: spec.tone,
      count: values.filter((value) => spec.matches(value)).length,
      active: spec.matches(subject),
    }))
    .filter((bucket) => bucket.count > 0);

  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  if (total === 0) return null;

  return { total, buckets };
}

export function resolveDistribution(
  status: PlacementStatus,
  entities: readonly unknown[],
  values: Array<number | boolean | null | undefined>,
  subject: number | boolean | null | undefined,
  specs: readonly DistributionBucketSpec[],
): ResolvedDistribution {
  if (status === "loading") return { distribution: null, pending: true };
  if (status === "error" || entities.length === 0) {
    return { distribution: null, pending: false };
  }
  return {
    distribution: distributeValues(values, subject, specs),
    pending: false,
  };
}

export function booleanDistributionSpecs(labels: {
  yes: string;
  no: string;
  unknown?: string;
}): DistributionBucketSpec[] {
  const specs: DistributionBucketSpec[] = [
    {
      id: "yes",
      label: labels.yes,
      tone: "good",
      matches: (value) => value === true,
    },
    {
      id: "no",
      label: labels.no,
      tone: "poor",
      matches: (value) => value === false,
    },
  ];

  if (labels.unknown) {
    specs.push({
      id: "unknown",
      label: labels.unknown,
      tone: "muted",
      matches: (value) => value == null,
    });
  }

  return specs;
}

/** Procurement is a three-step score: 2, 1, and everything else reported. */
export function procurementDistributionSpecs(labels: {
  high: string;
  medium: string;
  low: string;
}): DistributionBucketSpec[] {
  return [
    {
      id: "high",
      label: labels.high,
      tone: "good",
      matches: (value) => value === 2,
    },
    {
      id: "medium",
      label: labels.medium,
      tone: "mid",
      matches: (value) => value === 1,
    },
    {
      id: "low",
      label: labels.low,
      tone: "poor",
      matches: (value) =>
        typeof value === "number" && value !== 1 && value !== 2,
    },
  ];
}
