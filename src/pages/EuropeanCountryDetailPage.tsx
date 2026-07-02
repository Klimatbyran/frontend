import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TerritoryEmissions } from "@/components/territories/TerritoryEmissions";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { DetailWrapper } from "@/components/detail/DetailWrapper";
import { useEuropeanCountryPageData } from "@/hooks/europe/useEuropeanCountryPageData";
import { SWEDEN_ISO3 } from "@/hooks/europe/useEuropeanCountryDetails";
import { useLanguage } from "@/components/LanguageProvider";
import { localizedPath } from "@/utils/routing";

export function EuropeanCountryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();
  const pageData = useEuropeanCountryPageData(id);
  const { country, loading, error, emissionsData, headerStats } = pageData;

  useEffect(() => {
    if (id?.toUpperCase() === SWEDEN_ISO3) {
      navigate(localizedPath(currentLanguage, "/nation"), { replace: true });
    }
  }, [id, navigate, currentLanguage]);

  if (id?.toUpperCase() === SWEDEN_ISO3) {
    return <PageLoading />;
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
      />
      <TerritoryEmissions
        emissionsData={emissionsData}
        sectorEmissions={null}
      />
    </DetailWrapper>
  );
}
