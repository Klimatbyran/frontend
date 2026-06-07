import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";
import { DetailStat } from "@/components/detail/DetailHeader";
import { getNationDetails } from "@/lib/api";
import {
  calculateCarbonLawFromApproximatedRecord,
  sumNationEmissionRecords,
} from "@/utils/data/nationTransforms";
import type { SupportedLanguage } from "@/lib/languageDetection";

export type NationDetails = {
  country: { sv: string; en: string };
  logoUrl: string | null;
  emissions: Record<string, number>;
  territorialFossil: Record<string, number>;
  biogenic: Record<string, number>;
  consumptionAbroad: Record<string, number>;
  approximatedTerritorialFossil: Record<string, number>;
  approximatedBiogenic: Record<string, number>;
  approximatedConsumptionAbroad: Record<string, number>;
  approximatedHistoricalEmission: Record<string, number>;
  trend: Record<string, number>;
  carbonLaw: Record<string, number>;
  territorialFossilCarbonLaw: Record<string, number>;
  biogenicCarbonLaw: Record<string, number>;
  consumptionAbroadCarbonLaw: Record<string, number>;
  meetsParis: boolean;
  historicalEmissionChangePercent: number;
};

type EmissionSeries = ({ year: string; value: number } | null)[] | undefined;

type ApiNationResponse = {
  country: { sv: string; en: string } | string;
  logoUrl?: string | null;
  territorialFossilEmissions?: EmissionSeries;
  biogenicEmissions?: EmissionSeries;
  consumptionAbroadEmissions?: EmissionSeries;
  approximatedTerritorialFossilEmissions?: EmissionSeries;
  approximatedBiogenicEmissions?: EmissionSeries;
  approximatedConsumptionAbroadEmissions?: EmissionSeries;
  emissions?: EmissionSeries;
  totalTrend: number;
  totalCarbonLaw: number;
  approximatedHistoricalEmission: EmissionSeries;
  trend: EmissionSeries;
  historicalEmissionChangePercent: number;
  meetsParis: boolean;
};

function extractEmissionsRecord(
  emissions: EmissionSeries,
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

function normalizeCountry(country: ApiNationResponse["country"]): {
  sv: string;
  en: string;
} {
  if (typeof country === "string") {
    return { sv: country, en: country };
  }
  return { sv: country.sv, en: country.en };
}

function warnIfNationLayerFieldsMissing(r: ApiNationResponse): void {
  if (!import.meta.env.DEV) return;

  const missing: string[] = [];
  if (!r.territorialFossilEmissions?.length) {
    missing.push("territorialFossilEmissions");
  }
  if (!r.biogenicEmissions?.length) {
    missing.push("biogenicEmissions");
  }
  if (!r.consumptionAbroadEmissions?.length) {
    missing.push("consumptionAbroadEmissions");
  }

  if (missing.length === 0) return;

  console.warn(
    `[nation] Stacked chart needs per-layer API fields (${missing.join(", ")}). ` +
      `Received only: ${Object.keys(r).join(", ")}. ` +
      `Use VITE_API_PROXY=http://localhost:3000/ with GARBO_PROXY_CLIENT_API_KEY, ` +
      `and ensure Garbo NationDataSchema + nation-data.json expose the layer fields.`,
  );
}

function transformApiNationToNationDetails(
  r: ApiNationResponse,
  currentYear: number,
): NationDetails {
  warnIfNationLayerFieldsMissing(r);

  const territorialFossil = extractEmissionsRecord(
    r.territorialFossilEmissions ?? r.emissions,
  );
  const biogenic = extractEmissionsRecord(r.biogenicEmissions);
  const consumptionAbroad = extractEmissionsRecord(
    r.consumptionAbroadEmissions,
  );
  const approximatedTerritorialFossil = extractEmissionsRecord(
    r.approximatedTerritorialFossilEmissions,
  );
  const approximatedBiogenic = extractEmissionsRecord(
    r.approximatedBiogenicEmissions,
  );
  const approximatedConsumptionAbroad = extractEmissionsRecord(
    r.approximatedConsumptionAbroadEmissions,
  );

  return {
    country: normalizeCountry(r.country),
    logoUrl: r.logoUrl ?? null,
    territorialFossil,
    biogenic,
    consumptionAbroad,
    approximatedTerritorialFossil,
    approximatedBiogenic,
    approximatedConsumptionAbroad,
    emissions: sumNationEmissionRecords(
      territorialFossil,
      biogenic,
      consumptionAbroad,
    ),
    approximatedHistoricalEmission: extractEmissionsRecord(
      r.approximatedHistoricalEmission,
    ),
    trend: extractEmissionsRecord(r.trend),
    carbonLaw: calculateCarbonLawFromApproximatedRecord(
      extractEmissionsRecord(r.approximatedHistoricalEmission),
      currentYear,
    ),
    territorialFossilCarbonLaw: calculateCarbonLawFromApproximatedRecord(
      approximatedTerritorialFossil,
      currentYear,
    ),
    biogenicCarbonLaw: calculateCarbonLawFromApproximatedRecord(
      approximatedBiogenic,
      currentYear,
    ),
    consumptionAbroadCarbonLaw: calculateCarbonLawFromApproximatedRecord(
      approximatedConsumptionAbroad,
      currentYear,
    ),
    meetsParis: r.meetsParis ?? false,
    historicalEmissionChangePercent: r.historicalEmissionChangePercent ?? 0,
  };
}

export function useNationDetails() {
  const {
    data: nation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["nation"],
    queryFn: () => getNationDetails(),
  });

  const transformedNationDetails = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return nation
      ? transformApiNationToNationDetails(nation, currentYear)
      : null;
  }, [nation]);

  return {
    nation: transformedNationDetails ?? null,
    loading: isLoading,
    error: error as Error | null,
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

export function useNationDetailHeaderStats(
  nation: NationDetails | null,
  lastYear: number | undefined,
) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  if (!nation || !lastYear) {
    return [];
  }

  const lastYearEmissions = nation.emissions[lastYear];
  if (lastYearEmissions === undefined) {
    return [];
  }

  return [
    createMeetsParisStat(nation.meetsParis, t),
    createChangeSince2015Stat(
      nation.historicalEmissionChangePercent,
      currentLanguage,
      t,
    ),
    createTotalEmissionsStat(lastYearEmissions, lastYear, currentLanguage, t),
  ];
}
