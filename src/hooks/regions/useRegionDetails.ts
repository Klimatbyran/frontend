import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";
import { DetailStat } from "@/components/detail/DetailHeader";
import { getRegions } from "@/lib/api";
import {
  calculateParisValue,
  CARBON_LAW_REDUCTION_RATE,
} from "@/utils/calculations/emissionsCalculations";
import type { SupportedLanguage } from "@/lib/languageDetection";

export type RegionDetails = {
  name: string;
  emissions: Record<string, number>;
  approximatedHistoricalEmission: Record<string, number>;
  trend: Record<string, number>;
  carbonLaw: Record<string, number>;
  meetsParis: boolean;
  historicalEmissionChangePercent: number;
  municipalities: string[];
  politicalRule: string[];
  politicalKSO: string;
};

type ApiRegionResponse = {
  region: string;
  emissions: ({ year: string; value: number } | null)[];
  totalTrend: number;
  totalCarbonLaw: number;
  approximatedHistoricalEmission: ({ year: string; value: number } | null)[];
  trend: ({ year: string; value: number } | null)[];
  historicalEmissionChangePercent: number;
  meetsParis: boolean;
  municipalities: string[];
  politicalRule: string[];
  politicalRSO: string;
};

function normalizeRegionName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s*s?\s*län$/i, "")
    .replace(/[^a-z0-9]/g, "");
}

function extractEmissionsRecord(
  emissions: ({ year: string; value: number } | null)[] | undefined,
): Record<string, number> {
  const record: Record<string, number> = {};
  if (emissions) {
    emissions.forEach((emission) => {
      if (
        emission &&
        emission.year &&
        emission.value !== null &&
        !isNaN(Number(emission.year))
      ) {
        record[emission.year] = emission.value;
      }
    });
  }
  return record;
}

function calculateCarbonLawRecord(
  approximatedHistoricalEmission:
    | ({ year: string; value: number } | null)[]
    | undefined,
  currentYear: number,
): Record<string, number> {
  const carbonLawRecord: Record<string, number> = {};
  if (!approximatedHistoricalEmission) return carbonLawRecord;

  const approximatedDataAtCurrentYear = approximatedHistoricalEmission
    .filter((d) => d && parseInt(d.year) <= currentYear)
    .sort((a, b) => parseInt(b!.year) - parseInt(a!.year))[0];

  if (approximatedDataAtCurrentYear) {
    const carbonLawBaseValue = approximatedDataAtCurrentYear.value;
    const carbonLawBaseYear = parseInt(approximatedDataAtCurrentYear.year);

    for (let year = currentYear; year <= 2050; year++) {
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
  }
  return carbonLawRecord;
}

function transformApiRegionToRegionDetails(
  r: ApiRegionResponse,
  currentYear: number,
): RegionDetails {
  return {
    name: r.region,
    politicalRule: r.politicalRule,
    politicalKSO: r.politicalRSO,
    municipalities: r.municipalities,
    emissions: extractEmissionsRecord(r.emissions),
    approximatedHistoricalEmission: extractEmissionsRecord(
      r.approximatedHistoricalEmission,
    ),
    trend: extractEmissionsRecord(r.trend),
    carbonLaw: calculateCarbonLawRecord(
      r.approximatedHistoricalEmission,
      currentYear,
    ),
    meetsParis: r.meetsParis ?? false,
    historicalEmissionChangePercent: r.historicalEmissionChangePercent ?? 0,
  };
}

export function useRegionDetails(name: string) {
  const {
    data: regions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["regions"],
    queryFn: getRegions,
  });

  const transformedRegionDetails = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return (regions as ApiRegionResponse[]).map((r) =>
      transformApiRegionToRegionDetails(r, currentYear),
    );
  }, [regions]);

  const normalizedSearchName = normalizeRegionName(decodeURIComponent(name));

  // Find region using normalized comparison
  const region = transformedRegionDetails.find((r) => {
    if (!r.name) return false;
    const normalizedRegionName = normalizeRegionName(r.name);
    return normalizedRegionName === normalizedSearchName;
  });

  return {
    region: region || null,
    loading: isLoading,
    error,
  };
}

function createMeetsParisStat(
  meetsParis: boolean,
  t: ReturnType<typeof useTranslation>["t"],
): DetailStat {
  return {
    label: t("detailPage.meetsParisGoal"),
    value:
      meetsParis === true
        ? t("yes")
        : meetsParis === false
          ? t("no")
          : t("unknown"),
    valueClassName:
      meetsParis === true
        ? "text-green-3"
        : meetsParis === false
          ? "text-pink-3"
          : "text-grey",
  };
}

function createChangeSince2015Stat(
  historicalEmissionChangePercent: number,
  currentLanguage: SupportedLanguage,
  t: ReturnType<typeof useTranslation>["t"],
): DetailStat {
  return {
    label: t("detailPage.changeSince2015"),
    value: formatPercentChange(
      historicalEmissionChangePercent,
      currentLanguage,
    ),
    valueClassName:
      historicalEmissionChangePercent > 0 ? "text-pink-3" : "text-orange-2",
  };
}

function createTotalEmissionsStat(
  emissions: number,
  lastYear: number,
  currentLanguage: SupportedLanguage,
  t: ReturnType<typeof useTranslation>["t"],
): DetailStat {
  return {
    label: t("detailPage.totalEmissions", { year: lastYear }),
    value: formatEmissionsAbsolute(emissions, currentLanguage),
    unit: t("emissionsUnit"),
    valueClassName: "text-orange-2",
    info: true,
    infoText: t("municipalityDetailPage.totalEmissionsTooltip"),
  };
}

export function useRegionDetailHeaderStats(
  region: RegionDetails | null,
  lastYear: number | undefined,
) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  if (!region || !lastYear) {
    return [];
  }

  return [
    createMeetsParisStat(region.meetsParis, t),
    createChangeSince2015Stat(
      region.historicalEmissionChangePercent,
      currentLanguage,
      t,
    ),
    createTotalEmissionsStat(
      region.emissions[lastYear],
      lastYear,
      currentLanguage,
      t,
    ),
  ];
}
