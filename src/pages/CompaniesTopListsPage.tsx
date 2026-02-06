import { useState, useEffect, useCallback, useMemo } from "react";
import { Map, List } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPIDataSelector } from "@/components/ranked/KPIDataSelector";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import RankedList from "@/components/ranked/RankedList";
import CompanyInsightsPanel from "@/components/companies/rankedList/CompanyInsightsPanel";
import { CompanyKPIVisualization } from "@/components/companies/rankedList/CompanyKPIVisualization";
import { IndustryFilter } from "@/components/companies/rankedList/IndustryFilter";
import {
  useCompanyKPIs,
  CompanyKPIValue,
  CompanyWithKPIs,
  enrichCompanyWithKPIs,
} from "@/hooks/companies/useCompanyKPIs";
import { DataPoint } from "@/types/rankings";

export function CompaniesTopListPage() {
  const { t } = useTranslation();
  const { companies, companiesLoading, companiesError } = useCompanies();
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

  const getViewModeFromURL = () => {
    const params = new URLSearchParams(location.search);
    return params.get("view") === "list" ? "list" : "graph";
  };

  const setViewModeInURL = (mode: "graph" | "list") => {
    const params = new URLSearchParams(location.search);
    params.set("view", mode);
    navigate({ search: params.toString() }, { replace: true });
  };

  // Get available sectors from companies
  const availableSectors = useMemo(() => {
    if (!companies) return [];
    const sectors = new Set<string>();
    companies.forEach((company) => {
      const sectorCode = (company as any).industry?.industryGics?.sectorCode;
      if (sectorCode) {
        sectors.add(sectorCode);
      }
    });
    return Array.from(sectors).sort();
  }, [companies]);

  const getSectorFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const sectorParam = params.get("sector");
    if (sectorParam && availableSectors.includes(sectorParam)) {
      return sectorParam;
    }
    // Default to first available sector if none selected
    return availableSectors.length > 0 ? availableSectors[0] : null;
  }, [location.search, availableSectors]);

  const setSectorInURL = useCallback(
    (sector: string | null) => {
      const params = new URLSearchParams(location.search);
      if (sector) {
        params.set("sector", sector);
      } else {
        params.delete("sector");
      }
      navigate({ search: params.toString() }, { replace: true });
    },
    [location.search, navigate],
  );

  const [selectedKPI, setSelectedKPI] = useState(getKPIFromURL());
  const [selectedSector, setSelectedSector] = useState<string | null>(
    getSectorFromURL(),
  );
  const viewMode = getViewModeFromURL();

  // Ensure a sector is selected on initial load
  useEffect(() => {
    if (!selectedSector && availableSectors.length > 0) {
      const firstSector = availableSectors[0];
      setSelectedSector(firstSector);
      setSectorInURL(firstSector);
    }
  }, [availableSectors, selectedSector, setSectorInURL]);

  useEffect(() => {
    const kpiFromUrl = getKPIFromURL();
    if (kpiFromUrl.key !== selectedKPI.key) {
      setSelectedKPI(kpiFromUrl);
    }
  }, [getKPIFromURL, selectedKPI.key]);

  useEffect(() => {
    const sectorFromUrl = getSectorFromURL();
    if (sectorFromUrl !== selectedSector) {
      setSelectedSector(sectorFromUrl);
    }
  }, [getSectorFromURL, selectedSector]);

  // Filter and enrich companies with KPI values
  const companiesWithKPIs: CompanyWithKPIs[] = useMemo(() => {
    if (!companies || !selectedSector) return [];

    const filtered = companies.filter((company) => {
      const sectorCode = (company as any).industry?.industryGics?.sectorCode;
      return sectorCode === selectedSector;
    });

    return filtered.map((company) => enrichCompanyWithKPIs(company));
  }, [companies, selectedSector]);

  const handleSectorChange = (sector: string) => {
    setSelectedSector(sector);
    setSectorInURL(sector);
  };

  const handleCompanyClick = (company: CompanyWithKPIs) => {
    navigate(`/companies/${company.wikidataId}`);
  };

  if (companiesLoading) {
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

  if (companiesError) {
    return (
      <div className="text-center py-24">
        <h3 className="text-red-500 mb-4 text-xl">
          {t("companiesTopListsPage.errorTitle")}
        </h3>
        <p className="text-grey">{t("companiesTopListsPage.errorDescription")}</p>
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

  const renderVisualizationOrList = (isMobile: boolean) =>
    viewMode === "graph" ? (
      <div className={isMobile ? "relative h-[65vh]" : "relative h-full"}>
        <CompanyKPIVisualization
          companies={companiesWithKPIs}
          selectedKPI={selectedKPI}
          onCompanyClick={handleCompanyClick}
        />
      </div>
    ) : (
      <RankedList
        data={companiesWithKPIs}
        selectedDataPoint={asDataPoint(selectedKPI)}
        onItemClick={handleCompanyClick}
        searchKey="name"
        searchPlaceholder={t("rankedList.search.placeholder")}
      />
    );

  return (
    <>
      <PageHeader
        title={t("companiesTopListsPage.title")}
        description={t("companiesTopListsPage.description")}
        className="-ml-4"
      />

      <div className="flex mb-4 lg:hidden">
        <ViewModeToggle
          viewMode={viewMode}
          modes={["graph", "list"]}
          onChange={(mode) => setViewModeInURL(mode)}
          titles={{
            graph: t("companiesTopListsPage.viewToggle.showGraph", "Graph"),
            list: t("companiesTopListsPage.viewToggle.showList", "List"),
          }}
          showTitles
          icons={{
            graph: <Map className="w-4 h-4" />,
            list: <List className="w-4 h-4" />,
          }}
        />
      </div>

      <KPIDataSelector
        selectedKPI={selectedKPI}
        onKPIChange={(kpi) => {
          setSelectedKPI(kpi);
          setKPIInURL(String(kpi.key));
        }}
        kpis={companyKPIs}
        translationPrefix="companies.list"
      />

      <div className="mb-4">
        <IndustryFilter
          availableSectors={availableSectors}
          selectedSector={selectedSector}
          onSectorChange={handleSectorChange}
        />
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-6">
        {renderVisualizationOrList(true)}
        <CompanyInsightsPanel
          companyData={companiesWithKPIs}
          selectedKPI={selectedKPI}
        />
      </div>

      {/* Desktop View */}
      <div className="hidden lg:grid grid-cols-1 gap-6">
        <div className="grid grid-cols-2 gap-6">
          {renderVisualizationOrList(false)}
          {viewMode === "graph" ? (
            <RankedList
              data={companiesWithKPIs}
              selectedDataPoint={asDataPoint(selectedKPI)}
              onItemClick={handleCompanyClick}
              searchKey="name"
              searchPlaceholder={t("rankedList.search.placeholder")}
            />
          ) : null}
        </div>
        <CompanyInsightsPanel
          companyData={companiesWithKPIs}
          selectedKPI={selectedKPI}
        />
      </div>
    </>
  );
}
