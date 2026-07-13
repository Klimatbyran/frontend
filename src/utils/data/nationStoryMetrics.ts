import type { SupportedLanguage } from "@/lib/languageDetection";

export const NATION_BASELINE_YEAR = 1990;

export type NationEmissionSeries = {
  territorialFossil: Record<number, number>;
  productionBased: Record<number, number>;
  biogenic: Record<number, number>;
  consumptionAbroad: Record<number, number>;
};

export type NationStackDataPoint = {
  year: number;
  territorialFossil: number;
  productionBeyondTerritorial: number;
  biogenic: number;
  consumptionAbroad: number;
  combined: number;
};

export type NationStoryMetrics = {
  latestYear: number;
  ratioReportedToFull: number;
  combined1990Mton: number;
  combinedLatestMton: number;
  combinedChangePercent: number;
  territorialLatestMton: number;
  territorial1990Mton: number;
  territorialChangePercent: number;
  productionLatestMton: number;
  production1990Mton: number;
  productionChangePercent: number;
  biogenic1990Mton: number;
  biogenicLatestMton: number;
  biogenicChangePercent: number;
  consumptionLatestMton: number;
  consumption1990Mton: number;
  consumptionChangePercent: number;
  stackData: NationStackDataPoint[];
};

const TONNES_PER_MTON = 1_000_000;

export function toMton(tonnes: number): number {
  return tonnes / TONNES_PER_MTON;
}

export function formatMton(
  mton: number,
  language: SupportedLanguage,
  maximumFractionDigits = 0,
): string {
  return new Intl.NumberFormat(language === "sv" ? "sv-SE" : "en-GB", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(mton);
}

export function percentChange(from: number, to: number): number {
  if (from === 0) return 0;
  return ((to - from) / from) * 100;
}

export function sumSeriesAtYear(
  series: NationEmissionSeries,
  year: number,
  layers: Array<keyof NationEmissionSeries> = [
    "productionBased",
    "biogenic",
    "consumptionAbroad",
  ],
): number {
  return layers.reduce((total, layer) => total + (series[layer][year] ?? 0), 0);
}

function collectYears(series: NationEmissionSeries): number[] {
  const years = new Set<number>();
  (
    [
      "territorialFossil",
      "productionBased",
      "biogenic",
      "consumptionAbroad",
    ] as const
  ).forEach((layer) => {
    Object.keys(series[layer]).forEach((year) => {
      const parsed = Number(year);
      if (!Number.isNaN(parsed)) years.add(parsed);
    });
  });
  return [...years].sort((a, b) => a - b);
}

function isCompleteYear(series: NationEmissionSeries, year: number): boolean {
  return (
    series.territorialFossil[year] !== undefined &&
    series.productionBased[year] !== undefined &&
    series.biogenic[year] !== undefined &&
    series.consumptionAbroad[year] !== undefined
  );
}

function getCompleteYears(series: NationEmissionSeries): number[] {
  return collectYears(series).filter((year) => isCompleteYear(series, year));
}

function getLatestCompleteYear(series: NationEmissionSeries): number {
  const completeYears = getCompleteYears(series);
  return completeYears.at(-1) ?? collectYears(series).at(-1) ?? NATION_BASELINE_YEAR;
}

export function buildStackChartData(
  series: NationEmissionSeries,
): NationStackDataPoint[] {
  return getCompleteYears(series).map((year) => {
    const territorialFossil = toMton(series.territorialFossil[year]);
    const productionBased = toMton(series.productionBased[year]);
    const productionBeyondTerritorial = Math.max(
      0,
      productionBased - territorialFossil,
    );
    const biogenic = toMton(series.biogenic[year]);
    const consumptionAbroad = toMton(series.consumptionAbroad[year]);

    return {
      year,
      territorialFossil,
      productionBeyondTerritorial,
      biogenic,
      consumptionAbroad,
      combined: productionBased + biogenic + consumptionAbroad,
    };
  });
}

export function computeNationStoryMetrics(
  series: NationEmissionSeries,
): NationStoryMetrics {
  const latestYear = getLatestCompleteYear(series);

  const combined1990Tonnes = sumSeriesAtYear(series, NATION_BASELINE_YEAR);
  const combinedLatestTonnes = sumSeriesAtYear(series, latestYear);
  const territorial1990Tonnes =
    series.territorialFossil[NATION_BASELINE_YEAR] ?? 0;
  const territorialLatestTonnes = series.territorialFossil[latestYear] ?? 0;
  const production1990Tonnes =
    series.productionBased[NATION_BASELINE_YEAR] ?? 0;
  const productionLatestTonnes = series.productionBased[latestYear] ?? 0;
  const biogenic1990Tonnes = series.biogenic[NATION_BASELINE_YEAR] ?? 0;
  const biogenicLatestTonnes = series.biogenic[latestYear] ?? 0;
  const consumption1990Tonnes =
    series.consumptionAbroad[NATION_BASELINE_YEAR] ?? 0;
  const consumptionLatestTonnes = series.consumptionAbroad[latestYear] ?? 0;

  const ratioReportedToFull =
    territorialLatestTonnes > 0
      ? combinedLatestTonnes / territorialLatestTonnes
      : 0;

  return {
    latestYear,
    ratioReportedToFull,
    combined1990Mton: toMton(combined1990Tonnes),
    combinedLatestMton: toMton(combinedLatestTonnes),
    combinedChangePercent: percentChange(
      combined1990Tonnes,
      combinedLatestTonnes,
    ),
    territorialLatestMton: toMton(territorialLatestTonnes),
    territorial1990Mton: toMton(territorial1990Tonnes),
    territorialChangePercent: percentChange(
      territorial1990Tonnes,
      territorialLatestTonnes,
    ),
    productionLatestMton: toMton(productionLatestTonnes),
    production1990Mton: toMton(production1990Tonnes),
    productionChangePercent: percentChange(
      production1990Tonnes,
      productionLatestTonnes,
    ),
    biogenic1990Mton: toMton(biogenic1990Tonnes),
    biogenicLatestMton: toMton(biogenicLatestTonnes),
    biogenicChangePercent: percentChange(
      biogenic1990Tonnes,
      biogenicLatestTonnes,
    ),
    consumptionLatestMton: toMton(consumptionLatestTonnes),
    consumption1990Mton: toMton(consumption1990Tonnes),
    consumptionChangePercent: percentChange(
      consumption1990Tonnes,
      consumptionLatestTonnes,
    ),
    stackData: buildStackChartData(series),
  };
}
