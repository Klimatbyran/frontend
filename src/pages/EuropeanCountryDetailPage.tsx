import { Navigate, useParams } from "react-router-dom";
import { TerritoryEmissions } from "@/components/territories/TerritoryEmissions";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { DetailWrapper } from "@/components/detail/DetailWrapper";
import { EuropeanCountryDetailHeader } from "@/components/europe/EuropeanCountryDetailHeader";
import { useEuropeanCountryPageData } from "@/hooks/europe/useEuropeanCountryPageData";
import { useLanguage } from "@/components/LanguageProvider";
import { localizedPath, SWEDEN_ISO3 } from "@/utils/routing";

export function EuropeanCountryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentLanguage } = useLanguage();
  const pageData = useEuropeanCountryPageData(id);
  const {
    country,
    loading,
    error,
    emissionsData,
    headerStats,
    kpiComparisons,
  } = pageData;

  if (id?.toUpperCase() === SWEDEN_ISO3) {
    return <Navigate to={localizedPath(currentLanguage, "/nation")} replace />;
  }

  if (loading) return <PageLoading />;
  if (error) return <PageError />;
  if (!country) return <PageNoData />;

  return (
    <DetailWrapper>
      <EuropeanCountryDetailHeader
        name={country.name}
        iso3={country.iso3}
        helpItems={["regionTotalEmissions", "detailWhyDataDelay"]}
        stats={headerStats}
        kpiComparisons={kpiComparisons}
      />
      <TerritoryEmissions
        emissionsData={emissionsData}
        sectorEmissions={null}
      />
    </DetailWrapper>
  );
}
