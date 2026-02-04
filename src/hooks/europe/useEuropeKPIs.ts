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
      label: t("europe.list.kpis.historicalEmissionChangePercent.label"),
      key: "historicalEmissionChangePercent",
      unit: "%",
      description: t(
        "europe.list.kpis.historicalEmissionChangePercent.description",
      ),
      detailedDescription: t(
        "europe.list.kpis.historicalEmissionChangePercent.detailedDescription",
      ),
      higherIsBetter: false,
      source: "europe.list.kpis.historicalEmissionChangePercent.source",
      sourceUrls: ["https://nationellaemissionsdatabasen.smhi.se/"],
    },
    {
      label: t("europe.list.kpis.meetsParis.label"),
      key: "meetsParis",
      unit: "",
      description: t("europe.list.kpis.meetsParis.description"),
      detailedDescription: t("europe.list.kpis.meetsParis.detailedDescription"),
      higherIsBetter: true,
      isBoolean: true,
      booleanLabels: {
        true: t("europe.list.kpis.meetsParis.booleanLabels.true"),
        false: t("europe.list.kpis.meetsParis.booleanLabels.false"),
      },
      source: "europe.list.kpis.meetsParis.source",
      sourceUrls: ["https://nationellaemissionsdatabasen.smhi.se/"],
    },
  ];
};
