export interface DistributionBinDefinition {
  id: string;
  min: number;
  max: number;
  isReduction: boolean;
}

export interface DistributionBin extends DistributionBinDefinition {
  count: number;
  midpoint: number;
}

export const EMISSIONS_CHANGE_BIN_DEFINITIONS: DistributionBinDefinition[] = [
  { id: "largeReduction", min: -Infinity, max: -30, isReduction: true },
  { id: "moderateReduction", min: -30, max: -10, isReduction: true },
  { id: "smallReduction", min: -10, max: 0, isReduction: true },
  { id: "smallIncrease", min: 0, max: 10, isReduction: false },
  { id: "moderateIncrease", min: 10, max: 30, isReduction: false },
  { id: "largeIncrease", min: 30, max: Infinity, isReduction: false },
];

export function assignValueToBin(
  value: number,
  definitions: DistributionBinDefinition[],
): DistributionBinDefinition {
  for (const definition of definitions) {
    const inMin = value >= definition.min;
    const inMax = definition.max === Infinity || value < definition.max;
    if (inMin && inMax) {
      return definition;
    }
  }

  return definitions[definitions.length - 1];
}

export function buildDistributionBins(
  values: number[],
  definitions: DistributionBinDefinition[] = EMISSIONS_CHANGE_BIN_DEFINITIONS,
): DistributionBin[] {
  const counts = new Map<string, number>(
    definitions.map((definition) => [definition.id, 0]),
  );

  values.forEach((value) => {
    const bin = assignValueToBin(value, definitions);
    counts.set(bin.id, (counts.get(bin.id) ?? 0) + 1);
  });

  return definitions.map((definition) => ({
    ...definition,
    count: counts.get(definition.id) ?? 0,
    midpoint:
      definition.min === -Infinity
        ? definition.max - 5
        : definition.max === Infinity
          ? definition.min + 5
          : (definition.min + definition.max) / 2,
  }));
}

export function calculateMedian(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

export interface EmissionsChangeSummary {
  totalWithData: number;
  reducedCount: number;
  increasedCount: number;
  unchangedCount: number;
  average: number | null;
  median: number | null;
}

export function summarizeEmissionsChange(
  values: number[],
): EmissionsChangeSummary {
  if (values.length === 0) {
    return {
      totalWithData: 0,
      reducedCount: 0,
      increasedCount: 0,
      unchangedCount: 0,
      average: null,
      median: null,
    };
  }

  const reducedCount = values.filter((value) => value < 0).length;
  const increasedCount = values.filter((value) => value > 0).length;
  const unchangedCount = values.filter((value) => value === 0).length;
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;

  return {
    totalWithData: values.length,
    reducedCount,
    increasedCount,
    unchangedCount,
    average,
    median: calculateMedian(values),
  };
}

export interface ParisAlignmentSummary {
  yesCount: number;
  noCount: number;
  unknownCount: number;
  total: number;
}

export function summarizeParisAlignment(
  values: Array<boolean | null | undefined>,
): ParisAlignmentSummary {
  const yesCount = values.filter((value) => value === true).length;
  const noCount = values.filter((value) => value === false).length;
  const unknownCount = values.filter(
    (value) => value === null || value === undefined,
  ).length;

  return {
    yesCount,
    noCount,
    unknownCount,
    total: values.length,
  };
}
