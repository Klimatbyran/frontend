import type { CompanyWithKPIs } from "@/types/company";
import { getLatestComparableEmissions } from "@/utils/calculations/emissionsCalculations";

export interface EmissionsChangeCompanyEntry {
  id: string;
  name: string;
  changePercent: number;
  emissions: number;
  colorIndex: number;
}

export interface EmissionsChangeHistogramBin {
  id: string;
  min: number;
  max: number;
  label: string;
  totalEmissions: number;
  companies: EmissionsChangeCompanyEntry[];
}

const BIN_WIDTH_CANDIDATES = [0.5, 1, 2, 5, 10, 20, 50];

export function chooseEmissionsChangeBinWidth(absMax: number): number {
  if (absMax === 0) {
    return 1;
  }

  for (const width of BIN_WIDTH_CANDIDATES) {
    const binCount = Math.ceil((2 * absMax) / width);
    if (binCount >= 6 && binCount <= 20) {
      return width;
    }
  }

  for (let index = BIN_WIDTH_CANDIDATES.length - 1; index >= 0; index -= 1) {
    const width = BIN_WIDTH_CANDIDATES[index];
    if (Math.ceil((2 * absMax) / width) <= 20) {
      return width;
    }
  }

  return BIN_WIDTH_CANDIDATES[BIN_WIDTH_CANDIDATES.length - 1];
}

export function formatBinLabel(min: number, max: number): string {
  const format = (value: number) => {
    const rounded = Number(value.toFixed(1));
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  };

  return `${format(min)}–${format(max)}%`;
}

export function buildSymmetricBins(
  absMax: number,
  binWidth: number,
): EmissionsChangeHistogramBin[] {
  const halfSpan = Math.ceil(absMax / binWidth) * binWidth;
  const binCount = Math.ceil((2 * halfSpan) / binWidth);
  const binStart = -halfSpan;

  return Array.from({ length: binCount }, (_, index) => {
    const min = binStart + index * binWidth;
    const max = min + binWidth;

    return {
      id: `${min}-${max}`,
      min,
      max,
      label: formatBinLabel(min, max),
      totalEmissions: 0,
      companies: [],
    };
  });
}

export function assignValueToBin(
  value: number,
  bins: EmissionsChangeHistogramBin[],
): EmissionsChangeHistogramBin {
  for (let index = 0; index < bins.length; index += 1) {
    const bin = bins[index];
    const isLast = index === bins.length - 1;

    if (value >= bin.min && (isLast ? value <= bin.max : value < bin.max)) {
      return bin;
    }
  }

  return bins[bins.length - 1];
}

export function buildEmissionsChangeHistogram(companies: CompanyWithKPIs[]): {
  bins: EmissionsChangeHistogramBin[];
  binWidth: number;
  maxTotalEmissions: number;
} | null {
  const entries: EmissionsChangeCompanyEntry[] = [];

  companies.forEach((company, index) => {
    const changePercent = company.emissionsChangeFromBaseYear;
    if (
      changePercent === null ||
      changePercent === undefined ||
      Number.isNaN(changePercent)
    ) {
      return;
    }

    const emissions = getLatestComparableEmissions(company);
    if (emissions === null || emissions <= 0) {
      return;
    }

    entries.push({
      id: company.id,
      name: company.name,
      changePercent,
      emissions,
      colorIndex: index,
    });
  });

  if (entries.length === 0) {
    return null;
  }

  const absMax = Math.max(
    ...entries.map((entry) => Math.abs(entry.changePercent)),
    0,
  );
  const binWidth = chooseEmissionsChangeBinWidth(absMax);
  const bins = buildSymmetricBins(absMax, binWidth);

  entries.forEach((entry) => {
    const bin = assignValueToBin(entry.changePercent, bins);
    bin.companies.push(entry);
    bin.totalEmissions += entry.emissions;
  });

  bins.forEach((bin) => {
    bin.companies.sort((a, b) => b.emissions - a.emissions);
  });

  const populatedBins = bins.filter((bin) => bin.companies.length > 0);
  const maxTotalEmissions = Math.max(
    ...populatedBins.map((bin) => bin.totalEmissions),
    0,
  );

  return {
    bins: populatedBins,
    binWidth,
    maxTotalEmissions,
  };
}
