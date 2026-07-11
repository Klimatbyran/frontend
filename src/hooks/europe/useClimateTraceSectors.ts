import { useTranslation } from "react-i18next";
import type { SectorInfo } from "@/types/charts";
import type { ClimateTraceEmissionsSector } from "@/utils/europe/climateTraceSectors";

const CLIMATE_TRACE_SECTOR_TRANSLATION_KEYS: Record<
  ClimateTraceEmissionsSector,
  string
> = {
  transportation: "transportation",
  manufacturing: "manufacturing",
  agriculture: "agriculture",
  power: "power",
  "fossil-fuel-operations": "fossilFuelOperations",
  buildings: "buildings",
  waste: "waste",
  "fluorinated-gases": "fluorinatedGases",
  "mineral-extraction": "mineralExtraction",
};

const CLIMATE_TRACE_SECTOR_COLORS: Record<
  (typeof CLIMATE_TRACE_SECTOR_TRANSLATION_KEYS)[ClimateTraceEmissionsSector],
  string
> = {
  transportation: "var(--orange-3)",
  manufacturing: "var(--orange-2)",
  agriculture: "var(--green-4)",
  power: "var(--blue-2)",
  fossilFuelOperations: "var(--orange-4)",
  buildings: "var(--pink-4)",
  waste: "var(--pink-2)",
  fluorinatedGases: "var(--green-2)",
  mineralExtraction: "var(--blue-4)",
};

export function useClimateTraceSectors() {
  const { t } = useTranslation();

  const getSectorInfo = (sectorName: string): SectorInfo => {
    const key =
      CLIMATE_TRACE_SECTOR_TRANSLATION_KEYS[
        sectorName as ClimateTraceEmissionsSector
      ];

    if (key) {
      return {
        translatedName: t(`europe.detailPage.sectors.${key}`),
        color: CLIMATE_TRACE_SECTOR_COLORS[key],
      };
    }

    return {
      translatedName: sectorName,
      color: "var(--grey)",
    };
  };

  return { getSectorInfo };
}
