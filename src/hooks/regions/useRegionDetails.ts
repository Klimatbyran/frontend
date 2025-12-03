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

export function useRegionDetails(name: string) {
  const {
    data: regions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["regions"],
    queryFn: getRegions,
  });

  // Case-insensitive lookup - decode URL-encoded names and compare case-insensitively
  const normalizedName = decodeURIComponent(name);
  const region = (regions as RegionData[]).find(
    (r) => r.name.toLowerCase() === normalizedName.toLowerCase(),
  );

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
