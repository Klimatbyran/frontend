import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { RankedCompany } from "@/types/company";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import type { OverviewViewMode } from "@/components/ranked/OverviewSplitLayout";
import {
  buildCountryActiveFilters,
  buildCountryFilterGroup,
  companyMatchesCountries,
  parseCountriesFromURL,
  toggleCountrySelection,
  useCompanyCountryNames,
} from "@/hooks/companies/companyCountryFilterUtils";
import type { CompanyCountryTagSlug } from "@/lib/constants/companyCountryTags";
import type { FilterGroup } from "@/components/explore/FilterPopover";
import {
  CompanyKPIValue,
  CompanyWithKPIs,
  enrichCompanyWithKPIs,
} from "@/hooks/companies/useCompanyKPIs";
import { DataPoint } from "@/types/rankings";

export function useCompaniesOverviewUrlState(
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
    return null;
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

  const getCountriesFromURL = useCallback(
    () => parseCountriesFromURL(new URLSearchParams(location.search)),
    [location.search],
  );

  const setCountriesInURL = useCallback(
    (countries: CompanyCountryTagSlug[]) => {
      const params = new URLSearchParams(location.search);
      if (countries.length === 0) params.delete("countries");
      else params.set("countries", countries.join(","));
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
    getCountriesFromURL,
    setCountriesInURL,
    getViewModeFromURL,
    setViewModeInURL,
  };
}

export function useCompaniesWithKPIs(
  companies: RankedCompany[] | undefined,
  selectedSector: string | null,
  selectedCountries: CompanyCountryTagSlug[],
  selectedKPI: CompanyKPIValue,
) {
  return useMemo(() => {
    if (!companies) return [];

    const filtered = companies.filter((company) => {
      if (!companyMatchesCountries(company, selectedCountries)) return false;
      if (selectedSector) {
        const sectorCode = company.industry?.industryGics?.sectorCode;
        if (sectorCode !== selectedSector) return false;
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
}

export function asCompanyDataPoint(
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

export function useCompaniesOverviewFilters(options: {
  availableSectors: string[];
  selectedSector: string | null;
  selectedCountries: CompanyCountryTagSlug[];
  availableCountries: CompanyCountryTagSlug[];
  onSectorChange: (sector: string) => void;
  onCountriesChange: (countries: CompanyCountryTagSlug[]) => void;
}) {
  const {
    availableSectors,
    selectedSector,
    selectedCountries,
    availableCountries,
    onSectorChange,
    onCountriesChange,
  } = options;
  const { t } = useTranslation();
  const sectorNames = useSectorNames();
  const countryNames = useCompanyCountryNames();

  const filterGroups: FilterGroup[] = useMemo(() => {
    const groups: FilterGroup[] = [];

    if (availableSectors.length > 0) {
      groups.push({
        heading: t("companiesOverviewPage.filterByIndustry"),
        options: [
          { value: "all", label: t("explorePage.companies.allSectors") },
          ...availableSectors.map((code) => ({
            value: code,
            label: sectorNames[code as keyof typeof sectorNames] || code,
          })),
        ],
        selectedValues: selectedSector ? [selectedSector] : ["all"],
        onSelect: onSectorChange,
        selectMultiple: false,
      });
    }

    const countryGroup = buildCountryFilterGroup({
      t,
      countryNames,
      availableCountries,
      selectedCountries,
      onSelect: (value) =>
        onCountriesChange(toggleCountrySelection(selectedCountries, value)),
    });

    if (countryGroup) groups.push(countryGroup);
    return groups;
  }, [
    availableSectors,
    selectedSector,
    availableCountries,
    selectedCountries,
    sectorNames,
    countryNames,
    t,
    onSectorChange,
    onCountriesChange,
  ]);

  const activeFilters = useMemo(
    () => [
      ...(selectedSector
        ? [
            {
              type: "filter" as const,
              label:
                sectorNames[selectedSector as keyof typeof sectorNames] ||
                selectedSector,
              onRemove: () => onSectorChange("all"),
            },
          ]
        : []),
      ...buildCountryActiveFilters({
        countryNames,
        selectedCountries,
        onRemove: (country) =>
          onCountriesChange(
            selectedCountries.filter((value) => value !== country),
          ),
      }),
    ],
    [
      selectedSector,
      selectedCountries,
      sectorNames,
      countryNames,
      onSectorChange,
      onCountriesChange,
    ],
  );

  return { filterGroups, activeFilters };
}
