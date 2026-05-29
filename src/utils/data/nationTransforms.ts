import { NationDataPoint } from "@/types/emissions";

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
};

function resolveStackValues(
  nation: NationEmissionsInput,
  year: string,
): {
  territorialFossil?: number;
  biogenic?: number;
  consumptionAbroad?: number;
  isApproximated: boolean;
} {
  const territorialFossil = nation.territorialFossil[year];
  const biogenic = nation.biogenic[year];
  const consumptionAbroad = nation.consumptionAbroad[year];

  const hasHistorical =
    territorialFossil !== undefined ||
    biogenic !== undefined ||
    consumptionAbroad !== undefined;

  if (hasHistorical) {
    return {
      territorialFossil,
      biogenic,
      consumptionAbroad,
      isApproximated: false,
    };
  }

  return {
    territorialFossil: nation.approximatedTerritorialFossil?.[year],
    biogenic: nation.approximatedBiogenic?.[year],
    consumptionAbroad: nation.approximatedConsumptionAbroad?.[year],
    isApproximated: true,
  };
}

function sumDefined(...values: Array<number | undefined>): number | undefined {
  const defined = values.filter((v): v is number => v !== undefined);
  if (defined.length === 0) return undefined;
  return defined.reduce((sum, value) => sum + value, 0);
}

export function transformNationEmissionsData(
  nation: NationEmissionsInput,
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
  );

  return Array.from(years)
    .filter((year) => !isNaN(Number(year)))
    .map((year) => {
      const yearNum = Number(year);
      const stack = resolveStackValues(nation, year);
      const territorialFossil = toTons(stack.territorialFossil);
      const biogenic = toTons(stack.biogenic);
      const consumptionAbroad = toTons(stack.consumptionAbroad);
      const stackedTotal = sumDefined(
        territorialFossil,
        biogenic,
        consumptionAbroad,
      );

      return {
        year: yearNum,
        territorialFossil,
        biogenic,
        consumptionAbroad,
        total: stackedTotal,
        approximated: stack.isApproximated ? stackedTotal : undefined,
        trend: toTons(nation.trend?.[year]),
        carbonLaw: toTons(nation.carbonLaw?.[year]),
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
  const years = collectYears(
    territorialFossil,
    biogenic,
    consumptionAbroad,
  );
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
