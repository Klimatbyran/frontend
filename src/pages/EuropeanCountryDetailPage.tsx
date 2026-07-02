import { Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TerritoryEmissions } from "@/components/territories/TerritoryEmissions";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { DetailWrapper } from "@/components/detail/DetailWrapper";
import { useEuropeanCountryPageData } from "@/hooks/europe/useEuropeanCountryPageData";
import { useLanguage } from "@/components/LanguageProvider";
import { localizedPath, SWEDEN_ISO3 } from "@/utils/routing";
import { EuropeanCountryKpiComparisonsPanel } from "@/components/europe/EuropeanCountryKpiComparisonsPanel";

export function EuropeanCountryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();
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
      <DetailHeader
        name={country.name}
        subtitle={t("europe.detailPage.dataSource")}
        helpItems={["regionTotalEmissions", "detailWhyDataDelay"]}
        stats={headerStats}
        translateNamespace="europe.detailPage"
        supplementalData={
          kpiComparisons ? (
            <EuropeanCountryKpiComparisonsPanel
              comparisons={kpiComparisons}
              countryName={country.name}
            />
          ) : null
        }
      />
      <TerritoryEmissions
        emissionsData={emissionsData}
        sectorEmissions={null}
      />
    </DetailWrapper>
  );
}
