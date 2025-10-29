import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
import CompanyDataSelector from "@/components/companies/rankedList/CompanyDataSelector";
import RankedList from "@/components/ranked/RankedList";
import CompanyInsightsPanel from "@/components/companies/rankedList/CompanyInsightsPanel";
import {
  useCompanyKPIs,
  CompanyKPIValue,
  CompanyWithKPIs,
  enrichCompanyWithKPIs,
} from "@/hooks/companies/useCompanyKPIs";
import { DataPoint } from "@/types/entity-rankings";

export function CompaniesRankedPage() {
  const { t } = useTranslation();
  const { companies, loading, error } = useCompanies();
  const companyKPIs = useCompanyKPIs();

  const location = useLocation();
  const navigate = useNavigate();

  const getKPIFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const kpiKey = params.get("kpi");
    return companyKPIs.find((kpi) => kpi.key === kpiKey) || companyKPIs[0];
  }, [location.search, companyKPIs]);

  const setKPIInURL = (kpiKey: string) => {
    const params = new URLSearchParams(location.search);
    params.set("kpi", kpiKey);
    navigate({ search: params.toString() }, { replace: true });
  };

  const [selectedKPI, setSelectedKPI] = useState(getKPIFromURL());

  useEffect(() => {
    const kpiFromUrl = getKPIFromURL();
    if (kpiFromUrl.key !== selectedKPI.key) {
      setSelectedKPI(kpiFromUrl);
    }
  }, [getKPIFromURL, selectedKPI.key]);

  // Enrich companies with KPI values
  const companiesWithKPIs: CompanyWithKPIs[] = useMemo(() => {
    if (!companies) return [];
    return companies.map((company) => enrichCompanyWithKPIs(company));
  }, [companies]);

  const handleCompanyClick = (company: CompanyWithKPIs) => {
    navigate(`/companies/${company.wikidataId}`);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-16">
        <div className="h-12 w-1/3 bg-black-1 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 bg-black-1 rounded-level-2" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <h3 className="text-red-500 mb-4 text-xl">
          {t("companiesRankedPage.errorTitle")}
        </h3>
        <p className="text-grey">{t("companiesRankedPage.errorDescription")}</p>
      </div>
    );
  }

  const asDataPoint = (kpi: CompanyKPIValue): DataPoint<CompanyWithKPIs> => ({
    label: kpi.label,
    key: kpi.key as keyof CompanyWithKPIs,
    unit: kpi.unit,
    description: kpi.description,
    higherIsBetter: kpi.higherIsBetter,
    nullValues: kpi.nullValues,
    isBoolean: kpi.isBoolean,
    booleanLabels: kpi.booleanLabels,
    formatter: (value: unknown) => {
      if (value === null) {
        return kpi.nullValues || t("noData");
      }

      if (typeof value === "boolean") {
        return value
          ? t(`companies.list.kpis.${kpi.key}.booleanLabels.true`)
          : t(`companies.list.kpis.${kpi.key}.booleanLabels.false`);
      }

      if (typeof value === "number") {
        return `${value.toFixed(1)}${kpi.unit}`;
      }

      return String(value);
    },
  });

  const renderMapOrList = (isMobile: boolean) => (
    // Empty container for map - same size as municipality map
    <div className={isMobile ? "relative h-[65vh]" : "relative h-full"}>
      <div className="w-full h-full bg-black-2 rounded-level-2 flex items-center justify-center">
        <p className="text-grey text-lg">
          {t("companiesRankedPage.mapPlaceholder")}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        title={t("companiesRankedPage.title")}
        description={t("companiesRankedPage.description")}
        className="-ml-4"
      />

      <CompanyDataSelector
        selectedKPI={selectedKPI}
        onDataPointChange={(kpi) => {
          setSelectedKPI(kpi);
          setKPIInURL(String(kpi.key));
        }}
      />

      {/* Mobile View */}
      <div className="lg:hidden space-y-6">
        <RankedList
          data={companiesWithKPIs}
          selectedDataPoint={asDataPoint(selectedKPI)}
          onItemClick={handleCompanyClick}
          searchKey="name"
          searchPlaceholder={t("rankedList.search.placeholder")}
        />
        <CompanyInsightsPanel
          companyData={companiesWithKPIs}
          selectedKPI={selectedKPI}
        />
      </div>

      {/* Desktop View */}
      <div className="hidden lg:grid grid-cols-1 gap-6">
        <div className="grid grid-cols-2 gap-6">
          {renderMapOrList(false)}
          <RankedList
            data={companiesWithKPIs}
            selectedDataPoint={asDataPoint(selectedKPI)}
            onItemClick={handleCompanyClick}
            searchKey="name"
            searchPlaceholder={t("rankedList.search.placeholder")}
          />
        </div>
        <CompanyInsightsPanel
          companyData={companiesWithKPIs}
          selectedKPI={selectedKPI}
        />
      </div>
    </>
  );
}
