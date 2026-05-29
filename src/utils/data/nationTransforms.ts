import { NationDataPoint } from "@/types/emissions";
import {
  calculateParisValue,
  CARBON_LAW_REDUCTION_RATE,
} from "@/utils/calculations/emissionsCalculations";

const EMISSIONS_DATA_START_YEAR = 1990;
const EMISSIONS_DATA_END_YEAR = 2050;

const KG_TO_TONS = 1000;

function toTons(value: number | undefined): number | undefined {
  return value !== undefined ? value / KG_TO_TONS : undefined;
}

function collectYears(
  ...records: Array<Record<string, number> | undefined>
): Set<string> {
  const years = new Set<string>();
  records.forEach((record) => {
    if (record) {
      Object.keys(record).forEach((year) => years.add(year));
    }
  });
  return years;
}

export type NationEmissionsInput = {
  territorialFossil: Record<string, number>;
  biogenic: Record<string, number>;
  consumptionAbroad: Record<string, number>;
  approximatedTerritorialFossil?: Record<string, number>;
  approximatedBiogenic?: Record<string, number>;
  approximatedConsumptionAbroad?: Record<string, number>;
  approximatedHistoricalEmission?: Record<string, number>;
  trend?: Record<string, number>;
  carbonLaw?: Record<string, number>;
  territorialFossilCarbonLaw?: Record<string, number>;
  biogenicCarbonLaw?: Record<string, number>;
  consumptionAbroadCarbonLaw?: Record<string, number>;
};

export function calculateCarbonLawFromApproximatedRecord(
  approximated: Record<string, number>,
  currentYear: number,
): Record<string, number> {
  const carbonLawRecord: Record<string, number> = {};

  const baseEntry = Object.entries(approximated)
    .filter(([year]) => !isNaN(Number(year)) && Number(year) <= currentYear)
    .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))[0];

  if (!baseEntry) return carbonLawRecord;

  const [baseYearStr, carbonLawBaseValue] = baseEntry;
  const carbonLawBaseYear = Number(baseYearStr);

  for (let year = currentYear; year <= EMISSIONS_DATA_END_YEAR; year++) {
    const carbonLawValue = calculateParisValue(
      year,
      carbonLawBaseYear,
      carbonLawBaseValue,
      CARBON_LAW_REDUCTION_RATE,
    );
    if (carbonLawValue !== null) {
      carbonLawRecord[year.toString()] = carbonLawValue;
    }
  }

  return carbonLawRecord;
}

function getLayerParisValueKg(
  reported: Record<string, number>,
  approximated: Record<string, number> | undefined,
  stackAnchorYear: number,
  year: number,
  currentYear: number,
): number | undefined {
  if (year < currentYear || year > EMISSIONS_DATA_END_YEAR) {
    return undefined;
  }

  const baseValueKg = getLayerTrendValueKg(
    reported,
    approximated,
    currentYear,
    stackAnchorYear,
    currentYear,
  );
  if (baseValueKg === undefined) return undefined;

  if (year === currentYear) {
    return baseValueKg;
  }

  return (
    calculateParisValue(
      year,
      currentYear,
      baseValueKg,
      CARBON_LAW_REDUCTION_RATE,
    ) ?? undefined
  );
}

function getLatestCompleteStackYear(
  nation: NationEmissionsInput,
): number | null {
  const years = collectYears(
    nation.territorialFossil,
    nation.biogenic,
    nation.consumptionAbroad,
  );

  const completeYears = [...years]
    .map(Number)
    .filter(
      (year) =>
        !isNaN(year) &&
        nation.territorialFossil[year.toString()] !== undefined &&
        nation.biogenic[year.toString()] !== undefined &&
        nation.consumptionAbroad[year.toString()] !== undefined,
    )
    .sort((a, b) => b - a);

  return completeYears[0] ?? null;
}

function getLayerTrendValueKg(
  reported: Record<string, number>,
  approximated: Record<string, number> | undefined,
  year: number,
  anchorYear: number,
  currentYear: number,
): number | undefined {
  if (year < anchorYear || year > currentYear) {
    return undefined;
  }

  if (year === anchorYear) {
    return reported[anchorYear.toString()];
  }

  return approximated?.[year.toString()];
}

function getCumulativeLayerTops(
  bottom?: number,
  middle?: number,
  top?: number,
): {
  bottomTop?: number;
  middleTop?: number;
  topTop?: number;
} {
  if (bottom === undefined) {
    return {};
  }

  return {
    bottomTop: bottom,
    middleTop: sumDefined(bottom, middle),
    topTop: sumDefined(bottom, middle, top),
  };
}

function resolveReportedStackValues(
  nation: NationEmissionsInput,
  year: string,
): {
  territorialFossil?: number;
  biogenic?: number;
  consumptionAbroad?: number;
} {
  const territorialFossil = nation.territorialFossil[year];
  const biogenic = nation.biogenic[year];
  const consumptionAbroad = nation.consumptionAbroad[year];

  if (
    territorialFossil === undefined &&
    biogenic === undefined &&
    consumptionAbroad === undefined
  ) {
    return {};
  }

  return { territorialFossil, biogenic, consumptionAbroad };
}

function sumDefined(...values: Array<number | undefined>): number | undefined {
  const defined = values.filter((v): v is number => v !== undefined);
  if (defined.length === 0) return undefined;
  return defined.reduce((sum, value) => sum + value, 0);
}

export function transformNationEmissionsData(
  nation: NationEmissionsInput,
  currentYear: number = new Date().getFullYear(),
): NationDataPoint[] {
  const years = collectYears(
    nation.territorialFossil,
    nation.biogenic,
    nation.consumptionAbroad,
    nation.approximatedTerritorialFossil,
    nation.approximatedBiogenic,
    nation.approximatedConsumptionAbroad,
    nation.approximatedHistoricalEmission,
    nation.trend,
    nation.carbonLaw,
    nation.territorialFossilCarbonLaw,
    nation.biogenicCarbonLaw,
    nation.consumptionAbroadCarbonLaw,
  );

  const stackAnchorYear = getLatestCompleteStackYear(nation);

  return Array.from(years)
    .filter((year) => !isNaN(Number(year)))
    .map((year) => {
      const yearNum = Number(year);
      const reported = resolveReportedStackValues(nation, year);

      const territorialFossil =
        stackAnchorYear !== null && yearNum >= stackAnchorYear
          ? undefined
          : toTons(reported.territorialFossil);
      const biogenic =
        stackAnchorYear !== null && yearNum >= stackAnchorYear
          ? undefined
          : toTons(reported.biogenic);
      const consumptionAbroad =
        stackAnchorYear !== null && yearNum >= stackAnchorYear
          ? undefined
          : toTons(reported.consumptionAbroad);

      let territorialFossilTrend: number | undefined;
      let biogenicTrend: number | undefined;
      let consumptionAbroadTrend: number | undefined;
      let territorialFossilTrendTop: number | undefined;
      let biogenicTrendTop: number | undefined;
      let consumptionAbroadTrendTop: number | undefined;

      if (stackAnchorYear !== null) {
        if (yearNum === stackAnchorYear - 1) {
          const bridgeTops = getCumulativeLayerTops(
            territorialFossil,
            biogenic,
            consumptionAbroad,
          );
          territorialFossilTrendTop = bridgeTops.bottomTop;
          biogenicTrendTop = bridgeTops.middleTop;
          consumptionAbroadTrendTop = bridgeTops.topTop;
        } else if (yearNum >= stackAnchorYear && yearNum <= currentYear) {
          territorialFossilTrend = toTons(
            getLayerTrendValueKg(
              nation.territorialFossil,
              nation.approximatedTerritorialFossil,
              yearNum,
              stackAnchorYear,
              currentYear,
            ),
          );
          biogenicTrend = toTons(
            getLayerTrendValueKg(
              nation.biogenic,
              nation.approximatedBiogenic,
              yearNum,
              stackAnchorYear,
              currentYear,
            ),
          );
          consumptionAbroadTrend = toTons(
            getLayerTrendValueKg(
              nation.consumptionAbroad,
              nation.approximatedConsumptionAbroad,
              yearNum,
              stackAnchorYear,
              currentYear,
            ),
          );

          const trendTops = getCumulativeLayerTops(
            territorialFossilTrend,
            biogenicTrend,
            consumptionAbroadTrend,
          );
          territorialFossilTrendTop = trendTops.bottomTop;
          biogenicTrendTop = trendTops.middleTop;
          consumptionAbroadTrendTop = trendTops.topTop;
        }
      }

      let territorialFossilCarbonLaw: number | undefined;
      let biogenicCarbonLaw: number | undefined;
      let consumptionAbroadCarbonLaw: number | undefined;
      let territorialFossilCarbonLawTop: number | undefined;
      let biogenicCarbonLawTop: number | undefined;
      let consumptionAbroadCarbonLawTop: number | undefined;

      if (stackAnchorYear !== null) {
        territorialFossilCarbonLaw = toTons(
          getLayerParisValueKg(
            nation.territorialFossil,
            nation.approximatedTerritorialFossil,
            stackAnchorYear,
            yearNum,
            currentYear,
          ),
        );
        biogenicCarbonLaw = toTons(
          getLayerParisValueKg(
            nation.biogenic,
            nation.approximatedBiogenic,
            stackAnchorYear,
            yearNum,
            currentYear,
          ),
        );
        consumptionAbroadCarbonLaw = toTons(
          getLayerParisValueKg(
            nation.consumptionAbroad,
            nation.approximatedConsumptionAbroad,
            stackAnchorYear,
            yearNum,
            currentYear,
          ),
        );

        const parisTops = getCumulativeLayerTops(
          territorialFossilCarbonLaw,
          biogenicCarbonLaw,
          consumptionAbroadCarbonLaw,
        );
        territorialFossilCarbonLawTop = parisTops.bottomTop;
        biogenicCarbonLawTop = parisTops.middleTop;
        consumptionAbroadCarbonLawTop = parisTops.topTop;
      }

      const stackedReported = sumDefined(
        territorialFossil,
        biogenic,
        consumptionAbroad,
      );
      const stackedTrend = sumDefined(
        territorialFossilTrend,
        biogenicTrend,
        consumptionAbroadTrend,
      );
      const stackedParisTotal = sumDefined(
        territorialFossilCarbonLaw,
        biogenicCarbonLaw,
        consumptionAbroadCarbonLaw,
      );

      const hasApproximatedTrend =
        stackAnchorYear !== null &&
        yearNum > stackAnchorYear &&
        yearNum <= currentYear &&
        (territorialFossilTrend !== undefined ||
          biogenicTrend !== undefined ||
          consumptionAbroadTrend !== undefined);

      return {
        year: yearNum,
        territorialFossil,
        biogenic,
        consumptionAbroad,
        territorialFossilTrend,
        biogenicTrend,
        consumptionAbroadTrend,
        territorialFossilTrendTop,
        biogenicTrendTop,
        consumptionAbroadTrendTop,
        total: stackedReported ?? stackedTrend ?? stackedParisTotal,
        approximated: hasApproximatedTrend
          ? stackedTrend
          : undefined,
        trend: toTons(nation.trend?.[year]),
        carbonLaw: toTons(nation.carbonLaw?.[year]),
        territorialFossilCarbonLaw,
        biogenicCarbonLaw,
        consumptionAbroadCarbonLaw,
        territorialFossilCarbonLawTop,
        biogenicCarbonLawTop,
        consumptionAbroadCarbonLawTop,
      } as NationDataPoint;
    })
    .sort((a, b) => a.year - b.year)
    .filter(
      (d) =>
        d.year >= EMISSIONS_DATA_START_YEAR &&
        d.year <= EMISSIONS_DATA_END_YEAR,
    );
}

export function sumNationEmissionRecords(
  territorialFossil: Record<string, number>,
  biogenic: Record<string, number>,
  consumptionAbroad: Record<string, number>,
): Record<string, number> {
  const years = collectYears(territorialFossil, biogenic, consumptionAbroad);
  const emissions: Record<string, number> = {};
  years.forEach((year) => {
    const total = sumDefined(
      territorialFossil[year],
      biogenic[year],
      consumptionAbroad[year],
    );
    if (total !== undefined) {
      emissions[year] = total;
    }
  });
  return emissions;
}
