import { useState, useEffect, useCallback, useMemo } from "react";
import { Leaf, ArrowDownCircle, BarChart2, List } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { useIsMobile } from "@/hooks/useIsMobile";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPIChipSelector } from "@/components/ranked/KPIChipSelector";
import { OverviewPageSkeleton } from "@/components/ranked/OverviewPageSkeleton";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import {
  OverviewSplitLayout,
  type OverviewViewMode,
} from "@/components/ranked/OverviewSplitLayout";
import RankedList from "@/components/ranked/RankedList";
import CompanyInsightsPanel from "@/components/companies/rankedList/CompanyInsightsPanel";
import { CompanyKPIVisualization } from "@/components/companies/rankedList/CompanyKPIVisualization";
import {
  ALL_SECTORS,
  IndustryFilter,
} from "@/components/companies/rankedList/IndustryFilter";
import {
  useCompanyKPIs,
  CompanyKPIValue,
  CompanyWithKPIs,
  enrichCompanyWithKPIs,
} from "@/hooks/companies/useCompanyKPIs";
import { DataPoint } from "@/types/rankings";
import { getCompanyDetailPath } from "@/utils/companyRouting";

const COMPANY_KPI_ICONS: Record<string, React.ReactNode> = {
  meetsParis: <Leaf className="w-4 h-4" />,
  emissionsChangeFromBaseYear: <ArrowDownCircle className="w-4 h-4" />,
};

export function CompaniesOverviewPage() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { companies, companiesLoading, companiesError } = useCompanies();
  const companyKPIs = useCompanyKPIs();

  const location = useLocation();
  const navigate = useNavigate();

  const getKPIFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const kpiKey = params.get("kpi");
    return (
      companyKPIs.find((kpi) => kpi.key === kpiKey) ||
      companyKPIs.find((kpi) => kpi.key === "emissionsChangeFromBaseYear") ||
      companyKPIs[0]
    );
  }, [location.search, companyKPIs]);

  const setKPIInURL = (kpiKey: string) => {
    const params = new URLSearchParams(location.search);
    params.set("kpi", kpiKey);
    navigate({ search: params.toString() }, { replace: true });
  };

  // Get available sectors from companies
  const availableSectors = useMemo(() => {
    if (!companies) return [];
    const sectors = new Set<string>();
    companies.forEach((company) => {
      const sectorCode = company.industry?.industryGics?.sectorCode;
      if (sectorCode) {
        sectors.add(sectorCode);
      }
    });
    return Array.from(sectors).sort();
  }, [companies]);

  const getSectorFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const sectorParam = params.get("sector");
    if (!sectorParam || sectorParam === ALL_SECTORS) {
      return ALL_SECTORS;
    }
    const sector = sectorParam.split(",")[0];
    if (availableSectors.includes(sector)) {
      return sector;
    }
    return ALL_SECTORS;
  }, [location.search, availableSectors]);

  const setSectorInURL = useCallback(
    (sector: string) => {
      const params = new URLSearchParams(location.search);
      if (sector === ALL_SECTORS) {
        params.delete("sector");
      } else {
        params.set("sector", sector);
      }
      navigate({ search: params.toString() }, { replace: true });
    },
    [location.search, navigate],
  );

  const getViewModeFromURL = useCallback((): OverviewViewMode => {
    const params = new URLSearchParams(location.search);
    return params.get("view") === "list" ? "list" : "graph";
  }, [location.search]);

  const setViewModeInURL = (mode: OverviewViewMode) => {
    const params = new URLSearchParams(location.search);
    params.set("view", mode);
    navigate({ search: params.toString() }, { replace: true });
  };

  const [selectedKPI, setSelectedKPI] = useState(getKPIFromURL());
  const [selectedSector, setSelectedSector] = useState(getSectorFromURL());
  const viewMode = getViewModeFromURL();

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
    if (!companies) return [];

    const filtered =
      selectedSector === ALL_SECTORS
        ? companies
        : companies.filter((company) => {
            const sectorCode = company.industry?.industryGics?.sectorCode;
            return sectorCode === selectedSector;
          });

    return filtered.map((company) => enrichCompanyWithKPIs(company));
  }, [companies, selectedSector]);

  const handleSectorChange = (sector: string) => {
    setSelectedSector(sector);
    setSectorInURL(sector);
  };

  const handleCompanyClick = (company: CompanyWithKPIs) => {
    navigate(getCompanyDetailPath(company));
  };

  if (companiesLoading) {
    return <OverviewPageSkeleton />;
  }

  if (companiesError) {
    return (
      <div className="text-center py-24">
        <h3 className="text-red-500 mb-4 text-xl">
          {t("companiesOverviewPage.errorTitle")}
        </h3>
        <p className="text-grey">
          {t("companiesOverviewPage.errorDescription")}
        </p>
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

  const viewToggle = (
    <ViewModeToggle
      viewMode={viewMode}
      modes={["graph", "list"]}
      onChange={setViewModeInURL}
      titles={{
        graph: t("companiesOverviewPage.viewToggle.showGraph", "Graf"),
        list: t("companiesOverviewPage.viewToggle.showList", "Lista"),
      }}
      showTitles
      icons={{
        graph: <BarChart2 className="w-4 h-4" />,
        list: <List className="w-4 h-4" />,
      }}
    />
  );

  const companyRankedList = (
    <RankedList
      data={companiesWithKPIs}
      selectedDataPoint={asDataPoint(selectedKPI)}
      onItemClick={handleCompanyClick}
      searchKey="name"
      searchPlaceholder={t("rankedList.search.placeholder")}
      itemsPerPage={isMobile ? 6 : 8}
      headerAction={viewToggle}
    />
  );

  const visualizationPanel = (
    <div className="h-full min-h-[500px] md:min-h-[570px]">
      <CompanyKPIVisualization
        companies={companiesWithKPIs}
        selectedKPI={selectedKPI}
        onCompanyClick={handleCompanyClick}
      />
    </div>
  );

  return (
    <>
      <PageHeader
        title={t("companiesOverviewPage.title")}
        description={t("companiesOverviewPage.description")}
        className="-ml-4"
      />

      <KPIChipSelector<CompanyWithKPIs>
        selectedKPI={selectedKPI}
        kpis={companyKPIs}
        onKPIChange={(kpi) => {
          setSelectedKPI(kpi);
          setKPIInURL(String(kpi.key));
        }}
        iconMap={COMPANY_KPI_ICONS}
        translationPrefix="companies.list"
        label={t("municipalities.list.dataSelector.label")}
      />

      <div className="mb-4">
        <IndustryFilter
          availableSectors={availableSectors}
          selectedSector={selectedSector}
          onSectorChange={handleSectorChange}
        />
      </div>

      <div className="space-y-6">
        {/* Row 1: graph/list toggle | stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <OverviewSplitLayout
            viewMode={viewMode}
            visualizationMode="graph"
            visualization={visualizationPanel}
            list={companyRankedList}
            toggle={viewToggle}
          />
          <CompanyInsightsPanel
            companyData={companiesWithKPIs}
            selectedKPI={selectedKPI}
            section="stats"
          />
        </div>

        {!selectedKPI.isBoolean && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            <CompanyInsightsPanel
              companyData={companiesWithKPIs}
              selectedKPI={selectedKPI}
              section="top"
            />
            <CompanyInsightsPanel
              companyData={companiesWithKPIs}
              selectedKPI={selectedKPI}
              section="bottom"
            />
            <CompanyInsightsPanel
              companyData={companiesWithKPIs}
              selectedKPI={selectedKPI}
              section="distribution"
            />
          </div>
        )}
      </div>
    </>
  );
}
