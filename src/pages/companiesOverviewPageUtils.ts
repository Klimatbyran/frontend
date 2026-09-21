import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { RankedCompany } from "@/types/company";
import {
  useIndustryGroupNames,
  useSectorNames,
} from "@/hooks/companies/useCompanySectors";
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
import type {
  FilterGroup,
  FilterOptionGroup,
} from "@/components/explore/FilterPopover";
import {
  CompanyKPIValue,
  CompanyWithKPIs,
  enrichCompanyWithKPIs,
} from "@/hooks/companies/useCompanyKPIs";
import { DataPoint } from "@/types/rankings";
import {
  INDUSTRY_GROUP_CODES_BY_SECTOR,
  type IndustryGroupCode,
  type SectorCode,
} from "@/lib/constants/sectors";

export function useCompaniesOverviewUrlState(
  companyKPIs: CompanyKPIValue[],
  availableIndustryGroups: string[],
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

  const getIndustryGroupFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const industryGroupParam =
      params.get("industryGroup") ?? params.get("sector");
    if (
      industryGroupParam &&
      availableIndustryGroups.includes(industryGroupParam)
    ) {
      return industryGroupParam;
    }
    return null;
  }, [location.search, availableIndustryGroups]);

  const setIndustryGroupInURL = useCallback(
    (industryGroup: string | null) => {
      const params = new URLSearchParams(location.search);
      if (industryGroup) params.set("industryGroup", industryGroup);
      else params.delete("industryGroup");
      params.delete("sector");
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
    getIndustryGroupFromURL,
    setIndustryGroupInURL,
    getCountriesFromURL,
    setCountriesInURL,
    getViewModeFromURL,
    setViewModeInURL,
  };
}

export function useCompaniesWithKPIs(
  companies: RankedCompany[] | undefined,
  selectedIndustryGroup: string | null,
  selectedCountries: CompanyCountryTagSlug[],
  selectedKPI: CompanyKPIValue,
) {
  const selectedCountriesKey = [...selectedCountries].sort().join(",");

  return useMemo(() => {
    if (!companies) return [];

    const filtered = companies.filter((company) => {
      if (!companyMatchesCountries(company, selectedCountries)) return false;
      if (selectedIndustryGroup) {
        const groupCode = company.industry?.industryGics?.groupCode;
        if (groupCode !== selectedIndustryGroup) return false;
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
  }, [companies, selectedCountriesKey, selectedIndustryGroup, selectedKPI.key]);
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

export function buildAvailableIndustryGroupOptionGroups(
  availableIndustryGroups: string[],
  sectorNames: Record<string, string>,
  industryGroupNames: Record<string, string>,
  allLabel: string,
): FilterOptionGroup[] {
  const available = new Set(availableIndustryGroups);

  return [
    {
      options: [{ value: "all", label: allLabel }],
    },
    ...Object.entries(INDUSTRY_GROUP_CODES_BY_SECTOR)
      .map(([sectorCode, groupCodes]) => ({
        title: sectorNames[sectorCode as SectorCode],
        options: groupCodes
          .filter((code) => available.has(code))
          .map((code) => ({
            value: code,
            label: industryGroupNames[code as IndustryGroupCode] || code,
          })),
      }))
      .filter((group) => group.options.length > 0),
  ];
}

export function useCompaniesOverviewFilters(options: {
  availableIndustryGroups: string[];
  selectedIndustryGroup: string | null;
  selectedCountries: CompanyCountryTagSlug[];
  availableCountries: CompanyCountryTagSlug[];
  onIndustryGroupChange: (industryGroup: string) => void;
  onCountriesChange: (countries: CompanyCountryTagSlug[]) => void;
}) {
  const {
    availableIndustryGroups,
    selectedIndustryGroup,
    selectedCountries,
    availableCountries,
    onIndustryGroupChange,
    onCountriesChange,
  } = options;
  const { t } = useTranslation();
  const sectorNames = useSectorNames();
  const industryGroupNames = useIndustryGroupNames();
  const countryNames = useCompanyCountryNames();

  const filterGroups: FilterGroup[] = useMemo(() => {
    const groups: FilterGroup[] = [];

    if (availableIndustryGroups.length > 0) {
      groups.push({
        heading: t("companiesOverviewPage.filterByIndustry"),
        optionGroups: buildAvailableIndustryGroupOptionGroups(
          availableIndustryGroups,
          sectorNames,
          industryGroupNames,
          t("explorePage.companies.allIndustryGroups"),
        ),
        selectedValues: selectedIndustryGroup
          ? [selectedIndustryGroup]
          : ["all"],
        onSelect: onIndustryGroupChange,
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
    availableIndustryGroups,
    selectedIndustryGroup,
    availableCountries,
    selectedCountries,
    sectorNames,
    industryGroupNames,
    countryNames,
    t,
    onIndustryGroupChange,
    onCountriesChange,
  ]);

  const activeFilters = useMemo(
    () => [
      ...(selectedIndustryGroup
        ? [
            {
              type: "filter" as const,
              label:
                industryGroupNames[
                  selectedIndustryGroup as keyof typeof industryGroupNames
                ] || selectedIndustryGroup,
              onRemove: () => onIndustryGroupChange("all"),
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
      selectedIndustryGroup,
      selectedCountries,
      industryGroupNames,
      countryNames,
      onIndustryGroupChange,
      onCountriesChange,
    ],
  );

  return { filterGroups, activeFilters };
}
