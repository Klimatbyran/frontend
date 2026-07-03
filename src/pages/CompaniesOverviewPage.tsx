import { useState, useEffect, useCallback, useMemo } from "react";
import { Leaf, ArrowDownCircle, BarChart2, List } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { useScreenSize } from "@/hooks/useScreenSize";
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
import { IndustryFilter } from "@/components/companies/rankedList/IndustryFilter";
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

function useOverviewUrlState(
  companyKPIs: CompanyKPIValue[],
  availableSectors: string[],
) {
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

  const getSectorFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const sectorParam = params.get("sector");
    if (sectorParam && availableSectors.includes(sectorParam)) {
      return sectorParam;
    }
    return availableSectors.length > 0 ? availableSectors[0] : null;
  }, [location.search, availableSectors]);

  const setSectorInURL = useCallback(
    (sector: string | null) => {
      const params = new URLSearchParams(location.search);
      if (sector) params.set("sector", sector);
      else params.delete("sector");
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

  return {
    getKPIFromURL,
    setKPIInURL,
    getSectorFromURL,
    setSectorInURL,
    getViewModeFromURL,
    setViewModeInURL,
  };
}

function useCompaniesWithKPIs(
  companies: ReturnType<typeof useCompanies>["companies"],
  selectedSector: string | null,
  selectedKPI: CompanyKPIValue,
) {
  return useMemo(() => {
    if (!companies || !selectedSector) return [];

    const filtered = companies.filter((company) => {
      const sectorCode = company.industry?.industryGics?.sectorCode;
      if (sectorCode !== selectedSector) return false;
      if (
        selectedKPI.key === "emissionsChangeFromBaseYear" &&
        !company.baseYear?.year
      ) {
        return false;
      }
      return true;
    });

    return filtered.map((company) => enrichCompanyWithKPIs(company));
  }, [companies, selectedSector, selectedKPI.key]);
}

function asDataPoint(
  kpi: CompanyKPIValue,
  t: ReturnType<typeof useTranslation>["t"],
): DataPoint<CompanyWithKPIs> {
  return {
    label: kpi.label,
    key: kpi.key as keyof CompanyWithKPIs,
    unit: kpi.unit,
    description: kpi.description,
    higherIsBetter: kpi.higherIsBetter,
    nullValues: kpi.nullValues,
    isBoolean: kpi.isBoolean,
    booleanLabels: kpi.booleanLabels,
    formatter: (value: unknown) => {
      if (value === null) return kpi.nullValues || t("noData");
      if (typeof value === "boolean") {
        return value
          ? t(`companies.list.kpis.${kpi.key}.booleanLabels.true`)
          : t(`companies.list.kpis.${kpi.key}.booleanLabels.false`);
      }
      if (typeof value === "number") return `${value.toFixed(1)}${kpi.unit}`;
      return String(value);
    },
  };
}

function CompaniesOverviewContent({
  companiesWithKPIs,
  selectedKPI,
  availableSectors,
  selectedSector,
  viewMode,
  onKPIChange,
  onSectorChange,
  onViewModeChange,
  onCompanyClick,
}: {
  companiesWithKPIs: CompanyWithKPIs[];
  selectedKPI: CompanyKPIValue;
  availableSectors: string[];
  selectedSector: string | null;
  viewMode: OverviewViewMode;
  onKPIChange: (kpi: CompanyKPIValue) => void;
  onSectorChange: (sector: string) => void;
  onViewModeChange: (mode: OverviewViewMode) => void;
  onCompanyClick: (company: CompanyWithKPIs) => void;
}) {
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();
  const companyKPIs = useCompanyKPIs();

  const viewToggle = (
    <ViewModeToggle
      viewMode={viewMode}
      modes={["graph", "list"]}
      onChange={onViewModeChange}
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

  const colorItem = selectedKPI.createKPIColorGetter
    ? selectedKPI.createKPIColorGetter(companiesWithKPIs)
    : undefined;

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
        onKPIChange={onKPIChange}
        iconMap={COMPANY_KPI_ICONS}
        translationPrefix="companies.list"
        label={t("municipalities.list.dataSelector.label")}
      />

      <div className="mb-4">
        <IndustryFilter
          availableSectors={availableSectors}
          selectedSector={selectedSector}
          onSectorChange={onSectorChange}
        />
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <OverviewSplitLayout
            viewMode={viewMode}
            visualizationMode="graph"
            visualization={
              <div className="h-full min-h-[500px] md:min-h-[620px]">
                <CompanyKPIVisualization
                  companies={companiesWithKPIs}
                  selectedKPI={selectedKPI}
                  onCompanyClick={onCompanyClick}
                />
              </div>
            }
            list={
              <RankedList
                data={companiesWithKPIs}
                selectedDataPoint={asDataPoint(selectedKPI, t)}
                onItemClick={onCompanyClick}
                searchKey="name"
                searchPlaceholder={t("rankedList.search.placeholder")}
                itemsPerPage={isMobile ? 6 : 8}
                headerAction={viewToggle}
                colorItem={colorItem}
              />
            }
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

export function CompaniesOverviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { companies, companiesLoading, companiesError } = useCompanies();
  const companyKPIs = useCompanyKPIs();

  const availableSectors = useMemo(() => {
    if (!companies) return [];
    const sectors = new Set<string>();
    companies.forEach((company) => {
      const sectorCode = company.industry?.industryGics?.sectorCode;
      if (sectorCode) sectors.add(sectorCode);
    });
    return Array.from(sectors).sort();
  }, [companies]);

  const urlState = useOverviewUrlState(companyKPIs, availableSectors);
  const [selectedKPI, setSelectedKPI] = useState(urlState.getKPIFromURL());
  const [selectedSector, setSelectedSector] = useState<string | null>(
    urlState.getSectorFromURL(),
  );
  const viewMode = urlState.getViewModeFromURL();

  useEffect(() => {
    if (!selectedSector && availableSectors.length > 0) {
      const firstSector = availableSectors[0];
      setSelectedSector(firstSector);
      urlState.setSectorInURL(firstSector);
    }
  }, [availableSectors, selectedSector, urlState]);

  useEffect(() => {
    const kpiFromUrl = urlState.getKPIFromURL();
    if (kpiFromUrl.key !== selectedKPI.key) setSelectedKPI(kpiFromUrl);
  }, [urlState, selectedKPI.key]);

  useEffect(() => {
    const sectorFromUrl = urlState.getSectorFromURL();
    if (sectorFromUrl !== selectedSector) setSelectedSector(sectorFromUrl);
  }, [urlState, selectedSector]);

  const companiesWithKPIs = useCompaniesWithKPIs(
    companies,
    selectedSector,
    selectedKPI,
  );

  if (companiesLoading) return <OverviewPageSkeleton />;

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

  return (
    <CompaniesOverviewContent
      companiesWithKPIs={companiesWithKPIs}
      selectedKPI={selectedKPI}
      availableSectors={availableSectors}
      selectedSector={selectedSector}
      viewMode={viewMode}
      onKPIChange={(kpi) => {
        setSelectedKPI(kpi);
        urlState.setKPIInURL(String(kpi.key));
      }}
      onSectorChange={(sector) => {
        setSelectedSector(sector);
        urlState.setSectorInURL(sector);
      }}
      onViewModeChange={urlState.setViewModeInURL}
      onCompanyClick={(company) => navigate(getCompanyDetailPath(company))}
    />
  );
}
