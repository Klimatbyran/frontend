import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FeatureCollection } from "geojson";
import { useLanguage } from "@/components/LanguageProvider";
import { DetailStat } from "@/components/detail/DetailHeader";
import { ClimateTraceCountryData } from "@/lib/climateTrace";
import {
  buildCountryGeoIndex,
  getLocalizedCountryName,
} from "@/utils/europe/countryNames";
import { useClimateTraceEmissions } from "@/hooks/europe/useClimateTraceEmissions";
import europeGeoJson from "@/data/europeGeo.json";
export type EuropeanCountryDetails = {
  iso3: string;
  iso2: string;
  name: string;
  englishName: string;
  emissionsByYear: ClimateTraceCountryData["emissionsByYear"];
  emissionsPerCapita: number;
  historicalEmissionChangePercent: number | null;
  meetsParis: boolean | null;
};

const countryGeoIndex = buildCountryGeoIndex(
  europeGeoJson as FeatureCollection,
);

export const SWEDEN_ISO3 = "SWE";

function createMeetsParisStat(
  meetsParis: boolean | null,
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

export function useEuropeanCountryDetails(countryId: string | undefined) {
  const { emissionsByIso, isLoading, error } = useClimateTraceEmissions();
  const { currentLanguage } = useLanguage();

  const country = useMemo((): EuropeanCountryDetails | null => {
    if (!countryId) {
      return null;
    }

    const iso3 = countryId.toUpperCase();
    const ranking = emissionsByIso[iso3];
    if (!ranking) {
      return null;
    }

    const iso2 = countryGeoIndex.iso3ToIso2.get(iso3);
    const englishName =
      countryGeoIndex.iso3ToEnglishName.get(iso3) ?? ranking.name;

    return {
      iso3,
      iso2: iso2 ?? iso3.slice(0, 2),
      name: getLocalizedCountryName(
        iso2 ?? iso3.slice(0, 2),
        currentLanguage,
        englishName,
      ),
      englishName,
      emissionsByYear: ranking.emissionsByYear,
      emissionsPerCapita: ranking.emissionsPerCapita,
      historicalEmissionChangePercent: ranking.historicalEmissionChangePercent,
      meetsParis: ranking.meetsParis,
    };
  }, [countryId, emissionsByIso, currentLanguage]);

  return {
    country,
    loading: isLoading,
    error: error as Error | null,
  };
}

export function useEuropeanCountryDetailHeaderStats(
  country: EuropeanCountryDetails | null,
  lastYear: number | undefined,
) {
  const { t } = useTranslation();

  if (!country || !lastYear) {
    return [];
  }

  const lastYearEmissions = country.emissionsByYear[lastYear];
  if (!lastYearEmissions) {
    return [];
  }

  return [createMeetsParisStat(country.meetsParis, t)];
}
