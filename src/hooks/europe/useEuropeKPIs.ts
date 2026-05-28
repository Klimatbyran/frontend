import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getEuropeKPIs } from "@/lib/api";
import { KPIValue } from "@/types/rankings";
import { EuropeanCountry } from "@/types/europe";

type ApiEuropeKPI = {
  country: string;
  meetsParis: boolean;
  historicalEmissionChangePercent: number;
};

export type EuropeData = {
  name: string;
  historicalEmissionChangePercent: number | null;
  meetsParis: boolean | null;
};

const normalizeCountry = (country: ApiEuropeKPI): EuropeData => {
  return {
    name: country.country,
    historicalEmissionChangePercent: country.historicalEmissionChangePercent,
    meetsParis: country.meetsParis,
  };
};

export function useEurope() {
  const {
    data: europeKPI = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["europe-kpis"],
    queryFn: getEuropeKPIs,
  });

  const normalizedCountries = (europeKPI as ApiEuropeKPI[]).map((country) =>
    normalizeCountry(country),
  );

  return {
    countries: normalizedCountries.map((country) => country.name),
    countriesData: normalizedCountries,
    loading: isLoading,
    error,
  };
}

export const useEuropeanKPIs = (): KPIValue<EuropeanCountry>[] => {
  const { t } = useTranslation();

  return [
    {
      label: t("europe.list.kpis.emissionsPerCapita.label"),
      key: "emissionsPerCapita",
      unit: t("europe.list.kpis.emissionsPerCapita.unit"),
      description: t("europe.list.kpis.emissionsPerCapita.description"),
      detailedDescription: t(
        "europe.list.kpis.emissionsPerCapita.detailedDescription",
      ),
      higherIsBetter: false,
      source: "europe.list.kpis.emissionsPerCapita.source",
      sourceUrls: ["https://climatetrace.org/"],
    },
    {
      label: t("europe.list.kpis.emissionsPercentChange.label"),
      key: "emissionsPercentChange",
      unit: "%",
      description: t("europe.list.kpis.emissionsPercentChange.description"),
      detailedDescription: t(
        "europe.list.kpis.emissionsPercentChange.detailedDescription",
      ),
      higherIsBetter: false,
      source: "europe.list.kpis.emissionsPercentChange.source",
      sourceUrls: ["https://climatetrace.org/"],
    },
  ];
};
