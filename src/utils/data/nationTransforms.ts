import { NationDataPoint } from "@/types/emissions";
import {
  calculateParisValue,
  CARBON_LAW_REDUCTION_RATE,
} from "@/utils/calculations/emissionsCalculations";

const EMISSIONS_DATA_START_YEAR = 1990;
const EMISSIONS_DATA_END_YEAR = 2050;
/** Years used to fit per-layer linear trend slopes. */
const NATION_TREND_FIT_START_YEAR = 2015;

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

function getLatestLayerYear(reported: Record<string, number>): number | null {
  const years = Object.keys(reported)
    .map(Number)
    .filter((year) => !isNaN(year) && reported[year.toString()] !== undefined);

  return years.length > 0 ? Math.max(...years) : null;
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

function getApproximatedStackEndYear(
  nation: NationEmissionsInput,
): number | null {
  const years = collectYears(
    nation.approximatedTerritorialFossil,
    nation.approximatedBiogenic,
    nation.approximatedConsumptionAbroad,
  );
  const numericYears = [...years].map(Number).filter((year) => !isNaN(year));
  return numericYears.length > 0 ? Math.max(...numericYears) : null;
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

function computeLayerTrendSlopeKgPerYear(
  reported: Record<string, number>,
  startYear: number,
  endYear: number,
): number | null {
  const points = Object.entries(reported)
    .map(([year, value]) => ({ year: Number(year), value }))
    .filter(
      ({ year, value }) =>
        !isNaN(year) &&
        year >= startYear &&
        year <= endYear &&
        value !== undefined,
    )
    .sort((a, b) => a.year - b.year);

  if (points.length < 2) {
    return null;
  }

  const n = points.length;
  const meanX = points.reduce((sum, point) => sum + point.year, 0) / n;
  const meanY = points.reduce((sum, point) => sum + point.value, 0) / n;
  const numerator = points.reduce(
    (sum, point) => sum + (point.year - meanX) * (point.value - meanY),
    0,
  );
  const denominator = points.reduce(
    (sum, point) => sum + (point.year - meanX) ** 2,
    0,
  );

  if (denominator === 0) {
    return null;
  }

  return numerator / denominator;
}

/** Per-layer trend: slope from fit window, displayed from each layer's last reported year. */
function getLayerStackTrendValueKg(
  reported: Record<string, number>,
  approximated: Record<string, number> | undefined,
  slopeKgPerYear: number | null,
  layerAnchorYear: number,
  year: number,
  approximatedFillEndYear: number | null,
  trendDisplayStartYear: number,
): number | undefined {
  if (
    slopeKgPerYear === null ||
    year < trendDisplayStartYear ||
    year > EMISSIONS_DATA_END_YEAR
  ) {
    return undefined;
  }

  const anchorValue = reported[layerAnchorYear.toString()];
  if (anchorValue === undefined) {
    return undefined;
  }

  if (
    approximatedFillEndYear !== null &&
    year > layerAnchorYear &&
    year <= approximatedFillEndYear
  ) {
    const approximatedValue = approximated?.[year.toString()];
    if (approximatedValue !== undefined) {
      return approximatedValue;
    }
  }

  const projectionBaseYear =
    approximatedFillEndYear !== null && year > approximatedFillEndYear
      ? approximatedFillEndYear
      : layerAnchorYear;
  const projectionBaseValue =
    projectionBaseYear === layerAnchorYear
      ? anchorValue
      : (approximated?.[projectionBaseYear.toString()] ??
        anchorValue + slopeKgPerYear * (projectionBaseYear - layerAnchorYear));

  return projectionBaseValue + slopeKgPerYear * (year - projectionBaseYear);
}

/** Continuous stack fill: reported through anchor year, then approximated through API end year. */
function getLayerStackFillValueKg(
  reported: Record<string, number>,
  approximated: Record<string, number> | undefined,
  year: number,
  stackAnchorYear: number | null,
  approximatedFillEndYear: number | null,
): number | undefined {
  if (stackAnchorYear === null) {
    return reported[year.toString()];
  }

  if (year < stackAnchorYear) {
    return reported[year.toString()];
  }

  if (approximatedFillEndYear === null || year > approximatedFillEndYear) {
    return undefined;
  }

  return getLayerTrendValueKg(
    reported,
    approximated,
    year,
    stackAnchorYear,
    approximatedFillEndYear,
  );
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
  const bottomValue = bottom ?? 0;
  const middleValue = middle ?? 0;

  return {
    bottomTop: bottom,
    middleTop: middle !== undefined ? bottomValue + middleValue : undefined,
    topTop: top !== undefined ? bottomValue + middleValue + top : undefined,
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
  const approximatedFillEndYear = getApproximatedStackEndYear(nation);
  const territorialFossilAnchorYear = getLatestLayerYear(
    nation.territorialFossil,
  );
  const biogenicAnchorYear = getLatestLayerYear(nation.biogenic);
  const consumptionAbroadAnchorYear = getLatestLayerYear(
    nation.consumptionAbroad,
  );
  const territorialFossilTrendSlope =
    territorialFossilAnchorYear !== null
      ? computeLayerTrendSlopeKgPerYear(
          nation.territorialFossil,
          NATION_TREND_FIT_START_YEAR,
          territorialFossilAnchorYear,
        )
      : null;
  const biogenicTrendSlope =
    biogenicAnchorYear !== null
      ? computeLayerTrendSlopeKgPerYear(
          nation.biogenic,
          NATION_TREND_FIT_START_YEAR,
          biogenicAnchorYear,
        )
      : null;
  const consumptionAbroadTrendSlope =
    consumptionAbroadAnchorYear !== null
      ? computeLayerTrendSlopeKgPerYear(
          nation.consumptionAbroad,
          NATION_TREND_FIT_START_YEAR,
          consumptionAbroadAnchorYear,
        )
      : null;

  return Array.from(years)
    .filter((year) => !isNaN(Number(year)))
    .map((year) => {
      const yearNum = Number(year);
      const reported = resolveReportedStackValues(nation, year);

      let territorialFossil = toTons(
        getLayerStackFillValueKg(
          nation.territorialFossil,
          nation.approximatedTerritorialFossil,
          yearNum,
          stackAnchorYear,
          approximatedFillEndYear,
        ),
      );
      let biogenic = toTons(
        getLayerStackFillValueKg(
          nation.biogenic,
          nation.approximatedBiogenic,
          yearNum,
          stackAnchorYear,
          approximatedFillEndYear,
        ),
      );
      let consumptionAbroad = toTons(
        getLayerStackFillValueKg(
          nation.consumptionAbroad,
          nation.approximatedConsumptionAbroad,
          yearNum,
          stackAnchorYear,
          approximatedFillEndYear,
        ),
      );

      let territorialFossilHistoricalTop: number | undefined;
      let biogenicHistoricalTop: number | undefined;
      let consumptionAbroadHistoricalTop: number | undefined;

      let territorialFossilTrend: number | undefined;
      let biogenicTrend: number | undefined;
      let consumptionAbroadTrend: number | undefined;
      let territorialFossilTrendTop: number | undefined;
      let biogenicTrendTop: number | undefined;
      let consumptionAbroadTrendTop: number | undefined;

      if (territorialFossilAnchorYear !== null) {
        territorialFossilTrend = toTons(
          getLayerStackTrendValueKg(
            nation.territorialFossil,
            nation.approximatedTerritorialFossil,
            territorialFossilTrendSlope,
            territorialFossilAnchorYear,
            yearNum,
            approximatedFillEndYear,
            territorialFossilAnchorYear,
          ),
        );
      }
      if (biogenicAnchorYear !== null) {
        biogenicTrend = toTons(
          getLayerStackTrendValueKg(
            nation.biogenic,
            nation.approximatedBiogenic,
            biogenicTrendSlope,
            biogenicAnchorYear,
            yearNum,
            approximatedFillEndYear,
            biogenicAnchorYear,
          ),
        );
      }
      if (consumptionAbroadAnchorYear !== null) {
        consumptionAbroadTrend = toTons(
          getLayerStackTrendValueKg(
            nation.consumptionAbroad,
            nation.approximatedConsumptionAbroad,
            consumptionAbroadTrendSlope,
            consumptionAbroadAnchorYear,
            yearNum,
            approximatedFillEndYear,
            consumptionAbroadAnchorYear,
          ),
        );
      }

      if (
        territorialFossilTrend !== undefined ||
        biogenicTrend !== undefined ||
        consumptionAbroadTrend !== undefined
      ) {
        const trendTops = getCumulativeLayerTops(
          territorialFossilTrend,
          biogenicTrend,
          consumptionAbroadTrend,
        );
        territorialFossilTrendTop = trendTops.bottomTop;
        biogenicTrendTop = trendTops.middleTop;
        consumptionAbroadTrendTop = trendTops.topTop;
      }

      // Continue one stack with trend after approximated end (2026 stays on reported/approximated fill).
      if (
        approximatedFillEndYear !== null &&
        yearNum > approximatedFillEndYear
      ) {
        if (territorialFossilTrend !== undefined) {
          territorialFossil = territorialFossilTrend;
        }
        if (biogenicTrend !== undefined) {
          biogenic = biogenicTrend;
        }
        if (consumptionAbroadTrend !== undefined) {
          consumptionAbroad = consumptionAbroadTrend;
        }
      }

      const stackOutlineEndYear = approximatedFillEndYear ?? stackAnchorYear;
      if (
        (stackOutlineEndYear === null || yearNum <= stackOutlineEndYear) &&
        (territorialFossil !== undefined ||
          biogenic !== undefined ||
          consumptionAbroad !== undefined)
      ) {
        const historicalTops = getCumulativeLayerTops(
          territorialFossil,
          biogenic,
          consumptionAbroad,
        );
        territorialFossilHistoricalTop = historicalTops.bottomTop;
        biogenicHistoricalTop = historicalTops.middleTop;
        consumptionAbroadHistoricalTop = historicalTops.topTop;
      }

      // Trend fill uses the main stack; keep trend fields for dashed outlines only.
      territorialFossilTrend = undefined;
      biogenicTrend = undefined;
      consumptionAbroadTrend = undefined;

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

      const hasProjectedTrend =
        approximatedFillEndYear !== null &&
        yearNum >= approximatedFillEndYear &&
        stackedReported !== undefined;

      return {
        year: yearNum,
        territorialFossil,
        biogenic,
        consumptionAbroad,
        territorialFossilTrend,
        biogenicTrend,
        consumptionAbroadTrend,
        territorialFossilHistoricalTop,
        biogenicHistoricalTop,
        consumptionAbroadHistoricalTop,
        territorialFossilTrendTop,
        biogenicTrendTop,
        consumptionAbroadTrendTop,
        total: stackedReported ?? stackedTrend ?? stackedParisTotal,
        approximated: hasProjectedTrend ? stackedReported : undefined,
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
