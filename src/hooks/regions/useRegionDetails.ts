import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { formatPercentChange } from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";
import { DetailStat } from "@/components/detail/DetailHeader";
import { useQuery } from "@tanstack/react-query";
import { getRegions } from "@/lib/api";
import { RegionData } from "@/hooks/useRegions";

export type RegionDetails = {
  name: string;
  emissions: Record<string, number>;
};

type ApiRegionResponse = {
  region: string;
  emissions: ({ year: string; value: number } | null)[];
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

  // Transform API response to RegionData format
  const transformedRegions = useMemo(() => {
    return (regions as ApiRegionResponse[]).map((r) => {
      const emissionsRecord: Record<string, number> = {};
      if (r.emissions) {
        r.emissions.forEach((emission) => {
          if (emission && emission.year && emission.value !== null) {
            emissionsRecord[emission.year] = emission.value;
          }
        });
      }
      return {
        name: r.region,
        emissions: emissionsRecord,
      } as RegionData;
    });
  }, [regions]);

  const normalizedSearchName = normalizeRegionName(decodeURIComponent(name));

  // Find region using normalized comparison
  const region = transformedRegions.find((r) => {
    if (!r.name) return false;
    const normalizedRegionName = normalizeRegionName(r.name);
    return normalizedRegionName === normalizedSearchName;
  });

  return {
    region: region
      ? ({
          name: region.name,
          emissions: region.emissions,
        } as RegionDetails)
      : null,
    loading: isLoading,
    error,
  };
}

export function useRegionDetailHeaderStats(
  region: RegionDetails | null,
  lastYear: number | undefined,
  lastYearEmissionsTon: string,
) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  if (!region || !lastYear) {
    return [];
  }

  // Calculate year-over-year change
  const currentYearEmissions = region.emissions[lastYear.toString()];
  const previousYear = lastYear - 1;
  const previousYearEmissions = region.emissions[previousYear.toString()];

  let yearOverYearChange: number | null = null;
  if (
    currentYearEmissions !== undefined &&
    previousYearEmissions !== undefined &&
    previousYearEmissions !== 0
  ) {
    yearOverYearChange =
      ((currentYearEmissions - previousYearEmissions) / previousYearEmissions) *
      100;
  }

  // Calculate change since 2015 (baseline year)
  const baselineYear = 2015;
  const baselineEmissions = region.emissions[baselineYear.toString()];
  let changeSince2015: number | null = null;
  if (
    currentYearEmissions !== undefined &&
    baselineEmissions !== undefined &&
    baselineEmissions !== 0
  ) {
    changeSince2015 =
      ((currentYearEmissions - baselineEmissions) / baselineEmissions) * 100;
  }

  const stats: DetailStat[] = [
    {
      label: t("detailPage.totalEmissions", {
        year: lastYear,
      }),
      value: lastYearEmissionsTon,
      unit: t("emissionsUnit"),
      valueClassName: "text-orange-2",
      info: true,
      infoText: t("detailPage.totalEmissionsTooltip"),
    },
    ...(yearOverYearChange !== null
      ? [
          {
            label: t("detailPage.annualChange"),
            value: formatPercentChange(yearOverYearChange, currentLanguage),
            valueClassName:
              yearOverYearChange > 0 ? "text-pink-3" : "text-orange-2",
          } as DetailStat,
        ]
      : []),
    ...(changeSince2015 !== null
      ? [
          {
            label: t("detailPage.changeSince2015"),
            value: formatPercentChange(changeSince2015, currentLanguage),
            valueClassName:
              changeSince2015 > 0 ? "text-pink-3" : "text-orange-2",
          } as DetailStat,
        ]
      : []),
  ];

  return stats;
}
