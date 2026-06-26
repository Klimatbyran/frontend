import type { BenchmarkDistributionItem } from "@/types/territoryBenchmarks";

export function computeAverage(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function computeRank(
  entityValue: number,
  peerValues: number[],
  higherIsBetter: boolean,
): number {
  const sorted = [...peerValues].sort((a, b) =>
    higherIsBetter ? b - a : a - b,
  );
  const index = sorted.findIndex((value) => value === entityValue);
  if (index >= 0) return index + 1;

  const betterCount = peerValues.filter((value) =>
    higherIsBetter ? value > entityValue : value < entityValue,
  ).length;
  return betterCount + 1;
}

export function computePercentile(rank: number, total: number): number {
  if (total <= 1) return 100;
  return Math.round(((total - rank) / (total - 1)) * 100);
}

export function extractNumericValues<T>(
  items: T[],
  getValue: (item: T) => number | null | undefined,
): number[] {
  return items
    .map(getValue)
    .filter(
      (value): value is number =>
        value !== null && value !== undefined && !Number.isNaN(value),
    );
}

export function buildDistributionItems<T>(
  items: T[],
  getId: (item: T) => string,
  getName: (item: T) => string,
  getValue: (item: T) => number | null | undefined,
  currentEntityId: string,
): BenchmarkDistributionItem[] {
  return items
    .map((item) => {
      const value = getValue(item);
      if (value === null || value === undefined || Number.isNaN(value)) {
        return null;
      }
      return {
        id: getId(item),
        name: getName(item),
        value,
        isCurrentEntity: getId(item) === currentEntityId,
      };
    })
    .filter((item): item is BenchmarkDistributionItem => item !== null);
}

export function getSymmetricBarRange(values: number[]): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 0 };
  const absMax = Math.max(...values.map((value) => Math.abs(value)), 1);
  return { min: -absMax, max: absMax };
}

export function getPositiveBarRange(values: number[]): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 1 };
  const max = Math.max(...values, 1);
  return { min: 0, max: max * 1.1 };
}
