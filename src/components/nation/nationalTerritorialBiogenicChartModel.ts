import type { TFunction } from "i18next";
import type { LegendItem } from "@/types/charts";
import { CHART_COLORS } from "@/components/charts";
import type { NationDetails } from "@/hooks/nation/useNationDetails";

export const COMPARISON_YEARS = [1990, 2024] as const;

export const YEAR_TOTAL_TEXT_CLASS: Record<number, string> = {
  1990: "text-orange-2",
  2024: "text-green-3",
};

export type ChartRow = {
  year: string;
  territorial: number | null;
  biogenic: number | null;
  total: number | null;
};

export type NationTerritorialChartModel = {
  chartData: ChartRow[];
  showBiogenic: boolean;
  showTotal: boolean;
  comparisonTotals: { year: number; totalTons: number | null }[];
};

export function kgToTons(kg: number | undefined): number | null {
  if (kg === undefined || kg === null || Number.isNaN(kg)) return null;
  return kg / 1000;
}

export function pickYear(
  record: Record<string, number>,
  year: number,
): number | undefined {
  const v = record[String(year)];
  return v !== undefined ? v : undefined;
}

export function computeNationTerritorialChartModel(
  nation: NationDetails,
): NationTerritorialChartModel {
  const territorial = nation.territorialFossilEmissions;
  const biogenic = nation.biogenicEmissions;

  const hasBiogenicForAnyComparedYear =
    !!biogenic &&
    COMPARISON_YEARS.some((year) => pickYear(biogenic, year) !== undefined);

  const allRows = COMPARISON_YEARS.map((year) => {
    const terrKg = pickYear(territorial, year);
    const bioKg = biogenic ? pickYear(biogenic, year) : undefined;
    const terrTons = kgToTons(terrKg);
    const bioTons = bioKg !== undefined ? kgToTons(bioKg) : null;
    const hasPoint = terrTons !== null || bioTons !== null;
    const totalTons =
      hasBiogenicForAnyComparedYear && hasPoint
        ? (terrTons ?? 0) + (bioTons ?? 0)
        : null;

    return {
      year: String(year),
      yearNum: year,
      territorial: terrTons,
      biogenic: bioTons,
      total: totalTons,
    };
  });

  const chartData = allRows
    .filter((row) => row.territorial !== null || row.biogenic !== null)
    .map(({ yearNum, ...chartRow }) => chartRow);

  const hasBiogenic = chartData.some((row) => row.biogenic !== null);

  const comparisonTotals = allRows.map((row) => {
    const hasData = row.territorial !== null || row.biogenic !== null;
    const displayTotal =
      hasData && hasBiogenicForAnyComparedYear
        ? (row.territorial ?? 0) + (row.biogenic ?? 0)
        : hasData
          ? row.territorial
          : null;
    return {
      year: row.yearNum,
      totalTons: displayTotal ?? null,
    };
  });

  return {
    chartData,
    showBiogenic: hasBiogenic,
    showTotal: hasBiogenicForAnyComparedYear,
    comparisonTotals,
  };
}

export function buildLegendItems(
  t: TFunction,
  showBiogenic: boolean,
  showTotal: boolean,
): LegendItem[] {
  const items: LegendItem[] = [
    {
      name: t("nation.detailPage.territorialBiogenic.territorial"),
      color: CHART_COLORS.primary,
    },
  ];
  if (showBiogenic) {
    items.push({
      name: t("nation.detailPage.territorialBiogenic.biogenic"),
      color: "var(--orange-2)",
    });
  }
  if (showTotal) {
    items.push({
      name: t("nation.detailPage.territorialBiogenic.total"),
      color: CHART_COLORS.paris,
    });
  }
  return items;
}
