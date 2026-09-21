import { useState, useEffect, useMemo } from "react";
import { Leaf, ArrowDownCircle, BarChart2, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { useScreenSize } from "@/hooks/useScreenSize";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPIChipSelector } from "@/components/ranked/KPIChipSelector";
import { OverviewPageSkeleton } from "@/components/ranked/OverviewPageSkeleton";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import {
  OverviewSplitLayout,
  OVERVIEW_PANEL_MD_HEIGHT,
  type OverviewViewMode,
} from "@/components/ranked/OverviewSplitLayout";
import RankedList from "@/components/ranked/RankedList";
import CompanyInsightsPanel from "@/components/companies/rankedList/CompanyInsightsPanel";
import { CompanyKPIVisualization } from "@/components/companies/rankedList/CompanyKPIVisualization";
import { FilterPopover } from "@/components/explore/FilterPopover";
import { FilterBadges } from "@/components/companies/list/FilterBadges";
import { getAvailableCountryOptions } from "@/hooks/companies/companyCountryFilterUtils";
import type { CompanyCountryTagSlug } from "@/lib/constants/companyCountryTags";
import {
  useCompanyKPIs,
  CompanyKPIValue,
  CompanyWithKPIs,
} from "@/hooks/companies/useCompanyKPIs";
import { getCompanyDetailPath } from "@/utils/companyRouting";
import {
  asCompanyDataPoint,
  useCompaniesOverviewFilters,
  useCompaniesOverviewUrlState,
  useCompaniesWithKPIs,
} from "./companiesOverviewPageUtils";

const COMPANY_KPI_ICONS: Record<string, React.ReactNode> = {
  meetsParis: <Leaf className="w-4 h-4" />,
  emissionsChangeFromBaseYear: <ArrowDownCircle className="w-4 h-4" />,
};

function CompaniesOverviewMainGrid({
  companiesWithKPIs,
  selectedKPI,
  selectedIndustryGroup,
  viewMode,
  onCompanyClick,
  onViewModeChange,
}: {
  companiesWithKPIs: CompanyWithKPIs[];
  selectedKPI: CompanyKPIValue;
  selectedIndustryGroup: string | null;
  viewMode: OverviewViewMode;
  onCompanyClick: (company: CompanyWithKPIs) => void;
  onViewModeChange: (mode: OverviewViewMode) => void;
}) {
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();

  const viewToggle = (
    <ViewModeToggle
      viewMode={viewMode}
      modes={["graph", "list"]}
      onChange={onViewModeChange}
      titles={{
        graph: t("companiesOverviewPage.viewToggle.showGraph"),
        list: t("companiesOverviewPage.viewToggle.showList"),
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 items-stretch">
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
              selectedDataPoint={asCompanyDataPoint(selectedKPI, t)}
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
        <div className={`min-h-0 h-full ${OVERVIEW_PANEL_MD_HEIGHT}`}>
          <CompanyInsightsPanel
            companyData={companiesWithKPIs}
            selectedKPI={selectedKPI}
            section="stats"
          />
        </div>
      </div>

      {!selectedKPI.isBoolean && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          <CompanyInsightsPanel
            companyData={companiesWithKPIs}
            selectedKPI={selectedKPI}
            section="top"
            listKey={selectedIndustryGroup ?? "all"}
          />
          <CompanyInsightsPanel
            companyData={companiesWithKPIs}
            selectedKPI={selectedKPI}
            section="bottom"
            listKey={selectedIndustryGroup ?? "all"}
          />
          <CompanyInsightsPanel
            companyData={companiesWithKPIs}
            selectedKPI={selectedKPI}
            section="distribution"
          />
        </div>
      )}
    </div>
  );
}

function CompaniesOverviewContent({
  companiesWithKPIs,
  selectedKPI,
  availableIndustryGroups,
  selectedIndustryGroup,
  selectedCountries,
  availableCountries,
  viewMode,
  filterOpen,
  setFilterOpen,
  onKPIChange,
  onIndustryGroupChange,
  onCountriesChange,
  onViewModeChange,
  onCompanyClick,
}: {
  companiesWithKPIs: CompanyWithKPIs[];
  selectedKPI: CompanyKPIValue;
  availableIndustryGroups: string[];
  selectedIndustryGroup: string | null;
  selectedCountries: CompanyCountryTagSlug[];
  availableCountries: CompanyCountryTagSlug[];
  viewMode: OverviewViewMode;
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  onKPIChange: (kpi: CompanyKPIValue) => void;
  onIndustryGroupChange: (industryGroup: string) => void;
  onCountriesChange: (countries: CompanyCountryTagSlug[]) => void;
  onViewModeChange: (mode: OverviewViewMode) => void;
  onCompanyClick: (company: CompanyWithKPIs) => void;
}) {
  const { t } = useTranslation();
  const companyKPIs = useCompanyKPIs();
  const { filterGroups, activeFilters } = useCompaniesOverviewFilters({
    availableIndustryGroups,
    selectedIndustryGroup,
    selectedCountries,
    availableCountries,
    onIndustryGroupChange,
    onCountriesChange,
  });

  return (
    <>
      <PageHeader
        variant="title-only"
        title={t("companiesOverviewPage.title")}
      />

      <KPIChipSelector<CompanyWithKPIs>
        selectedKPI={selectedKPI}
        kpis={companyKPIs}
        onKPIChange={onKPIChange}
        iconMap={COMPANY_KPI_ICONS}
        translationPrefix="companies.list"
        label={t("companies.list.dataSelector.label")}
        actions={
          <>
            <FilterPopover
              filterOpen={filterOpen}
              setFilterOpen={setFilterOpen}
              groups={filterGroups}
            />
            {activeFilters.length > 0 && (
              <FilterBadges filters={activeFilters} view="graphs" />
            )}
          </>
        }
      />

      <CompaniesOverviewMainGrid
        companiesWithKPIs={companiesWithKPIs}
        selectedKPI={selectedKPI}
        selectedIndustryGroup={selectedIndustryGroup}
        viewMode={viewMode}
        onCompanyClick={onCompanyClick}
        onViewModeChange={onViewModeChange}
      />
    </>
  );
}

export function CompaniesOverviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { companies, companiesLoading, companiesError } = useCompanies();
  const companyKPIs = useCompanyKPIs();
  const [filterOpen, setFilterOpen] = useState(false);

  const availableIndustryGroups = useMemo(() => {
    if (!companies) return [];
    const industryGroups = new Set<string>();
    companies.forEach((company) => {
      const groupCode = company.industry?.industryGics?.groupCode;
      if (groupCode) industryGroups.add(groupCode);
    });
    return Array.from(industryGroups).sort();
  }, [companies]);

  const availableCountries = useMemo(
    () => getAvailableCountryOptions(companies ?? []),
    [companies],
  );

  const urlState = useCompaniesOverviewUrlState(
    companyKPIs,
    availableIndustryGroups,
  );
  const [selectedKPI, setSelectedKPI] = useState(urlState.getKPIFromURL());
  const selectedIndustryGroup = urlState.getIndustryGroupFromURL();
  const selectedCountries = urlState.getCountriesFromURL();
  const viewMode = urlState.getViewModeFromURL();

  useEffect(() => {
    setSelectedKPI(urlState.getKPIFromURL());
  }, [urlState]);

  const companiesWithKPIs = useCompaniesWithKPIs(
    companies,
    selectedIndustryGroup,
    selectedCountries,
    selectedKPI,
  );

  if (companiesLoading) {
    return (
      <OverviewPageSkeleton
        variant="companies"
        chipCount={companyKPIs.length}
      />
    );
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

  return (
    <CompaniesOverviewContent
      companiesWithKPIs={companiesWithKPIs}
      selectedKPI={selectedKPI}
      availableIndustryGroups={availableIndustryGroups}
      selectedIndustryGroup={selectedIndustryGroup}
      selectedCountries={selectedCountries}
      availableCountries={availableCountries}
      viewMode={viewMode}
      filterOpen={filterOpen}
      setFilterOpen={setFilterOpen}
      onKPIChange={(kpi) => {
        setSelectedKPI(kpi);
        urlState.setKPIInURL(String(kpi.key));
      }}
      onIndustryGroupChange={(industryGroup) => {
        urlState.setIndustryGroupInURL(
          industryGroup === "all" ? null : industryGroup,
        );
      }}
      onCountriesChange={urlState.setCountriesInURL}
      onViewModeChange={urlState.setViewModeInURL}
      onCompanyClick={(company) => navigate(getCompanyDetailPath(company))}
    />
  );
}
