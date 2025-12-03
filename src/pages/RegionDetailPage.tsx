import { useParams } from "react-router-dom";
import {
  useRegionDetails,
  useRegionDetailHeaderStats,
} from "@/hooks/regions/useRegionDetails";
import { useTranslation } from "react-i18next";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";
import { RegionEmissions } from "@/components/regions/RegionEmissions";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { DetailWrapper } from "@/components/detail/DetailWrapper";
import { useMemo } from "react";

export function RegionDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { region, loading, error } = useRegionDetails(id || "");
  const { currentLanguage } = useLanguage();

  // Transform emissions data for chart
  const emissionsData = useMemo(() => {
    if (!region || !region.emissions) return [];

    return Object.entries(region.emissions)
      .filter(([year]) => !isNaN(Number(year)))
      .map(([year, value]) => ({
        year: Number(year),
        total: value / 1000, // Convert to tons
      }))
      .sort((a, b) => a.year - b.year)
      .filter((d) => d.year >= 1990 && d.year <= 2050);
  }, [region]);

  // Get latest year and emissions
  const lastYearEmissions = emissionsData[emissionsData.length - 1];
  const lastYear = lastYearEmissions?.year;
  const lastYearEmissionsTon = lastYearEmissions
    ? formatEmissionsAbsolute(lastYearEmissions.total * 1000, currentLanguage)
    : t("noData");

  const headerStats = useRegionDetailHeaderStats(
    region,
    lastYear,
    lastYearEmissionsTon,
  );

  if (loading) return <PageLoading />;
  if (error) return <PageError />;
  if (!region) return <PageNoData />;

  return (
    <>
      <DetailWrapper>
        <DetailHeader
          name={region.name}
          helpItems={["regionTotalEmissions", "detailWhyDataDelay"]}
          stats={headerStats}
          translateNamespace="detailPage"
        />

        <RegionEmissions emissionsData={emissionsData} />
      </DetailWrapper>
    </>
  );
}
