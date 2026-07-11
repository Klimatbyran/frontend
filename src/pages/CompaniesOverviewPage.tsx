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
  OVERVIEW_PANEL_MD_HEIGHT,
  type OverviewViewMode,
} from "@/components/ranked/OverviewSplitLayout";
import RankedList from "@/components/ranked/RankedList";
import CompanyInsightsPanel from "@/components/companies/rankedList/CompanyInsightsPanel";
import { CompanyKPIVisualization } from "@/components/companies/rankedList/CompanyKPIVisualization";
import {
  FilterPopover,
  type FilterGroup,
} from "@/components/explore/FilterPopover";
import { FilterBadges } from "@/components/companies/list/FilterBadges";
import { cn } from "@/lib/utils";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import {
  buildCountryActiveFilters,
  buildCountryFilterGroup,
  companyMatchesCountries,
  getAvailableCountryOptions,
  parseCountriesFromURL,
  toggleCountrySelection,
  useCompanyCountryNames,
} from "@/hooks/companies/companyCountryFilterUtils";
import type { CompanyCountryTagSlug } from "@/lib/constants/companyCountryTags";
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
  const { isMobile } = useScreenSize();
  const { companies, companiesLoading, companiesError } = useCompanies();
  const companyKPIs = useCompanyKPIs();
  const sectorNames = useSectorNames();
  const countryNames = useCompanyCountryNames();
  const [filterOpen, setFilterOpen] = useState(false);

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
    if (sectorParam && availableSectors.includes(sectorParam)) {
      return sectorParam;
    }
    return null;
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

  const selectedCountries = useMemo(
    () => parseCountriesFromURL(new URLSearchParams(location.search)),
    [location.search],
  );

  const availableCountries = useMemo(
    () => getAvailableCountryOptions(companies ?? []),
    [companies],
  );

  const setCountriesInURL = useCallback(
    (countries: CompanyCountryTagSlug[]) => {
      const params = new URLSearchParams(location.search);
      if (countries.length === 0) {
        params.delete("countries");
      } else {
        params.set("countries", countries.join(","));
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
  const selectedSector = useMemo(() => getSectorFromURL(), [getSectorFromURL]);
  const viewMode = getViewModeFromURL();

  useEffect(() => {
    setSelectedKPI(getKPIFromURL());
  }, [getKPIFromURL]);

  // Filter and enrich companies with KPI values
  const companiesWithKPIs: CompanyWithKPIs[] = useMemo(() => {
    if (!companies) return [];

    const filtered = companies.filter((company) => {
      if (!companyMatchesCountries(company, selectedCountries)) {
        return false;
      }

      if (selectedSector) {
        const sectorCode = company.industry?.industryGics?.sectorCode;
        if (sectorCode !== selectedSector) {
          return false;
        }
      }

      if (
        selectedKPI.key === "emissionsChangeFromBaseYear" &&
        !company.baseYear?.year
      ) {
        return false;
      }

      return true;
    });

    return filtered.map((company) => enrichCompanyWithKPIs(company));
  }, [companies, selectedCountries, selectedSector, selectedKPI.key]);

  const handleSectorChange = (sector: string) => {
    if (sector === "all") {
      setSectorInURL(null);
      return;
    }
    setSectorInURL(sector);
  };

  const handleCountriesChange = (countries: CompanyCountryTagSlug[]) => {
    setCountriesInURL(countries);
  };

  const filterGroups: FilterGroup[] = useMemo(() => {
    const groups: FilterGroup[] = [];

    if (availableSectors.length > 0) {
      groups.push({
        heading: t("companiesOverviewPage.filterByIndustry"),
        options: [
          {
            value: "all",
            label: t("explorePage.companies.allSectors"),
          },
          ...availableSectors.map((code) => ({
            value: code,
            label: sectorNames[code as keyof typeof sectorNames] || code,
          })),
        ],
        selectedValues: selectedSector ? [selectedSector] : ["all"],
        onSelect: handleSectorChange,
        selectMultiple: false,
      });
    }

    const countryGroup = buildCountryFilterGroup({
      t,
      countryNames,
      availableCountries,
      selectedCountries,
      onSelect: (value) =>
        handleCountriesChange(toggleCountrySelection(selectedCountries, value)),
    });

    if (countryGroup) {
      groups.push(countryGroup);
    }

    return groups;
  }, [
    availableSectors,
    selectedSector,
    availableCountries,
    selectedCountries,
    sectorNames,
    countryNames,
    t,
  ]);

  const activeFilters = useMemo(() => {
    const filters = [];

    if (selectedSector) {
      filters.push({
        type: "filter" as const,
        label:
          sectorNames[selectedSector as keyof typeof sectorNames] ||
          selectedSector,
        onRemove: () => setSectorInURL(null),
      });
    }

    filters.push(
      ...buildCountryActiveFilters({
        countryNames,
        selectedCountries,
        onRemove: (country) =>
          handleCountriesChange(
            selectedCountries.filter((value) => value !== country),
          ),
      }),
    );

    return filters;
  }, [
    selectedSector,
    selectedCountries,
    sectorNames,
    countryNames,
    setSectorInURL,
  ]);

  const handleCompanyClick = (company: CompanyWithKPIs) => {
    navigate(getCompanyDetailPath(company));
  };

  if (companiesLoading) {
    return (
      <OverviewPageSkeleton
        title={t("companiesOverviewPage.title")}
        description={t("companiesOverviewPage.description")}
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

  const companyRankedList = (
    <RankedList
      data={companiesWithKPIs}
      selectedDataPoint={asDataPoint(selectedKPI)}
      onItemClick={handleCompanyClick}
      searchKey="name"
      searchPlaceholder={t("rankedList.search.placeholder")}
      itemsPerPage={isMobile ? 6 : 8}
      headerAction={viewToggle}
      colorItem={colorItem}
    />
  );

  const visualizationPanel = (
    <div className="h-full min-h-[500px] md:min-h-[620px]">
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
        label={t("companies.list.dataSelector.label")}
      />

      <div className={cn("flex flex-wrap items-center gap-2 mb-4")}>
        <FilterPopover
          filterOpen={filterOpen}
          setFilterOpen={setFilterOpen}
          groups={filterGroups}
        />
        {activeFilters.length > 0 && (
          <div
            className={cn(
              "flex flex-wrap gap-2",
              isMobile ? "w-full" : "flex-1",
            )}
          >
            <FilterBadges filters={activeFilters} view="graphs" />
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Row 1: graph/list toggle | stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 items-stretch">
          <OverviewSplitLayout
            viewMode={viewMode}
            visualizationMode="graph"
            visualization={visualizationPanel}
            list={companyRankedList}
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
              listKey={selectedSector ?? "all"}
            />
            <CompanyInsightsPanel
              companyData={companiesWithKPIs}
              selectedKPI={selectedKPI}
              section="bottom"
              listKey={selectedSector ?? "all"}
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
