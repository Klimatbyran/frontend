import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getRegionsKPIs } from "@/lib/api";
import { KPIValue } from "@/types/entity-rankings";
import { Region } from "@/types/region";

type ApiRegionKPI = {
  region: string;
  meetsParis: boolean;
  historicalEmissionChangePercent: number;
};

export type RegionData = {
  name: string;
  historicalEmissionChangePercent: number | null;
  meetsParis: boolean | null;
};

const normalizeRegion = (region: ApiRegionKPI): RegionData => {
  return {
    name: region.region,
    historicalEmissionChangePercent: region.historicalEmissionChangePercent,
    meetsParis: region.meetsParis,
  };
};

export function useRegions() {
  const {
    data: regionsKPI = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["regions-kpis"],
    queryFn: getRegionsKPIs,
  });

  const normalizedRegions = (regionsKPI as ApiRegionKPI[]).map((region) =>
    normalizeRegion(region),
  );

  return {
    regions: normalizedRegions.map((region) => region.name),
    regionsData: normalizedRegions,
    loading: isLoading,
    error,
  };
}

export const useRegionalKPIs = (): KPIValue<Region>[] => {
  const { t } = useTranslation();

  return [
    {
      label: t("regions.list.kpis.historicalEmissionChangePercent.label"),
      key: "historicalEmissionChangePercent",
      unit: "%",
      description: t(
        "regions.list.kpis.historicalEmissionChangePercent.description",
      ),
      detailedDescription: t(
        "regions.list.kpis.historicalEmissionChangePercent.detailedDescription",
      ),
      higherIsBetter: false,
      source: "regions.list.kpis.historicalEmissionChangePercent.source",
      sourceUrls: ["https://nationellaemissionsdatabasen.smhi.se/"],
    },
    {
      label: t("regions.list.kpis.meetsParis.label"),
      key: "meetsParis",
      unit: "",
      description: t("regions.list.kpis.meetsParis.description"),
      detailedDescription: t(
        "regions.list.kpis.meetsParis.detailedDescription",
      ),
      higherIsBetter: true,
      isBoolean: true,
      booleanLabels: {
        true: t("regions.list.kpis.meetsParis.booleanLabels.true"),
        false: t("regions.list.kpis.meetsParis.booleanLabels.false"),
      },
      source: "regions.list.kpis.meetsParis.source",
      sourceUrls: ["https://nationellaemissionsdatabasen.smhi.se/"],
    },
  ];
};
