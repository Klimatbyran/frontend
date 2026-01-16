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

export type RegionDetails = {
  name: string;
  logoUrl: string | null;
  emissions: Record<string, number>;
  approximatedHistoricalEmission: Record<string, number>;
  trend: Record<string, number>;
  carbonLaw: Record<string, number>;
  meetsParis: boolean;
  historicalEmissionChangePercent: number;
};

type ApiRegionResponse = {
  region: string;
  logoUrl?: string | null;
  emissions: ({ year: string; value: number } | null)[];
  trend: ({ year: string; value: number } | null)[];
  approximatedHistoricalEmission: ({ year: string; value: number } | null)[];
  meetsParis: boolean;
  historicalEmissionChangePercent: number;
  [key: string]: unknown;
};

function normalizeRegionName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s*s?\s*län$/i, "")
    .replace(/[^a-z0-9]/g, "");
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

  // Transform API response to RegionDetails format with trend and carbonLaw
  const transformedRegionDetails = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return (regions as ApiRegionResponse[]).map((r) => {
      const emissionsRecord: Record<string, number> = {};
      const approximatedRecord: Record<string, number> = {};
      const trendRecord: Record<string, number> = {};
      const carbonLawRecord: Record<string, number> = {};

      // Extract emissions
      if (r.emissions) {
        r.emissions.forEach((emission) => {
          if (emission && emission.year && emission.value !== null) {
            emissionsRecord[emission.year] = emission.value;
          }
        });
      }

      // Extract approximated historical emissions
      if (r.approximatedHistoricalEmission) {
        r.approximatedHistoricalEmission.forEach((approximated) => {
          if (
            approximated &&
            approximated.year &&
            approximated.value !== null
          ) {
            approximatedRecord[approximated.year] = approximated.value;
          }
        });
      }

      // Extract trend
      if (r.trend) {
        r.trend.forEach((trend) => {
          if (trend && trend.year && trend.value !== null) {
            trendRecord[trend.year] = trend.value;
          }
        });
      }

      // Calculate carbonLaw (Paris path) from approximatedHistoricalEmission
      if (r.approximatedHistoricalEmission) {
        // Find the latest approximated value at or before current year
        const approximatedDataAtCurrentYear = r.approximatedHistoricalEmission
          .filter((d) => d && parseInt(d.year) <= currentYear)
          .sort((a, b) => parseInt(b!.year) - parseInt(a!.year))[0];

        if (approximatedDataAtCurrentYear) {
          const carbonLawBaseValue = approximatedDataAtCurrentYear.value;
          const carbonLawBaseYear = parseInt(
            approximatedDataAtCurrentYear.year,
          );

          // Generate carbonLaw values for future years
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
      }

      return {
        name: r.region,
        logoUrl: r.logoUrl ?? null,
        emissions: emissionsRecord,
        approximatedHistoricalEmission: approximatedRecord,
        trend: trendRecord,
        carbonLaw: carbonLawRecord,
        meetsParis: r.meetsParis ?? false,
        historicalEmissionChangePercent: r.historicalEmissionChangePercent ?? 0,
      } as RegionDetails;
    });
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

export function useRegionDetailHeaderStats(
  region: RegionDetails | null,
  lastYear: number | undefined,
) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  if (!region || !lastYear) {
    return [];
  }

  const stats: DetailStat[] = [
    {
      label: t("detailPage.meetsParisGoal"),
      value:
        region.meetsParis === true
          ? t("yes")
          : region.meetsParis === false
            ? t("no")
            : t("unknown"),
      valueClassName:
        region.meetsParis === true
          ? "text-green-3"
          : region.meetsParis === false
            ? "text-pink-3"
            : "text-grey",
    },
    {
      label: t("detailPage.changeSince2015"),
      value: formatPercentChange(
        region.historicalEmissionChangePercent,
        currentLanguage,
      ),
      valueClassName:
        region.historicalEmissionChangePercent > 0
          ? "text-pink-3"
          : "text-orange-2",
    },
    {
      label: t("detailPage.totalEmissions", {
        year: lastYear,
      }),
      value: formatEmissionsAbsolute(
        region.emissions[lastYear],
        currentLanguage,
      ),
      unit: t("emissionsUnit"),
      valueClassName: "text-orange-2",
      info: true,
      infoText: t("municipalityDetailPage.totalEmissionsTooltip"),
    },
  ];

  return stats;
}
