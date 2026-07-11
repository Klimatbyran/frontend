import type { TFunction } from "i18next";
import type { RankedCompany } from "@/types/company";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { calculateMeetsParis } from "@/lib/calculations/trends/meetsParis";
import { calculateEmissionsChange } from "@/utils/calculations/emissionsCalculations";
import { getCompanySectorName } from "@/utils/data/industryGrouping";
import { CompanySector, SECTORS } from "@/lib/constants/sectors";
import type { FilterGroup } from "@/components/explore/FilterPopover";
import type { CompanySortBy } from "./useCompanySorting";
import type { SortDirection } from "@/components/explore/SortPopover";
import { getSearchTerms } from "@/hooks/explore/exploreFilterUtils";
import type { CompanyCountryTagSlug } from "@/lib/constants/companyCountryTags";
import {
  buildCountryActiveFilters,
  buildCountryFilterGroup,
  companyMatchesCountries,
} from "./companyCountryFilterUtils";

type MeetsParisFilter = "all" | "yes" | "no" | "unknown";

type CompanyFilterParams = {
  sectors: CompanySector[];
  selectedCountries: CompanyCountryTagSlug[];
  searchQuery: string;
  meetsParisFilter: MeetsParisFilter;
  sortBy: CompanySortBy;
  sortDirection: SortDirection;
  sectorNames: Record<string, string>;
};

function matchesSector(
  company: RankedCompany,
  sectors: CompanySector[],
): boolean {
  return (
    sectors.includes("all") ||
    (company.industry?.industryGics?.sectorCode != null &&
      sectors.includes(company.industry?.industryGics?.sectorCode ?? ""))
  );
}

function matchesSearch(
  company: RankedCompany,
  searchQuery: string,
  sectorNames: Record<string, string>,
): boolean {
  const searchTerms = getSearchTerms(searchQuery);
  if (searchTerms.length === 0) {
    return true;
  }

  const companyName = company.name.toLowerCase();
  const sectorName = getCompanySectorName(company, sectorNames).toLowerCase();

  return searchTerms.some((term) => {
    const companyNamePattern = new RegExp(`\\b${term}`, "i");
    const sectorNamePattern = new RegExp(`\\b${term}`, "i");
    return (
      companyNamePattern.test(companyName) || sectorNamePattern.test(sectorName)
    );
  });
}

function matchesMeetsParis(
  company: RankedCompany,
  meetsParisFilter: MeetsParisFilter,
): boolean {
  if (meetsParisFilter === "all") {
    return true;
  }

  const trendAnalysis = calculateTrendline(company);
  const meetsParis = trendAnalysis
    ? calculateMeetsParis(company, trendAnalysis)
    : null;

  if (meetsParisFilter === "yes") return meetsParis === true;
  if (meetsParisFilter === "no") return meetsParis === false;
  if (meetsParisFilter === "unknown") return meetsParis === null;
  return true;
}

function compareEmissionsReduction(
  a: RankedCompany,
  b: RankedCompany,
  sortDirection: SortDirection,
): number {
  const aChange = calculateEmissionsChange(a.reportingPeriods[0]) || 0;
  const bChange = calculateEmissionsChange(b.reportingPeriods[0]) || 0;
  return sortDirection === "asc" ? aChange - bChange : bChange - aChange;
}

function compareTotalEmissions(
  a: RankedCompany,
  b: RankedCompany,
  sortDirection: SortDirection,
): number {
  const aEmissions =
    a.reportingPeriods[0]?.emissions?.calculatedTotalEmissions || 0;
  const bEmissions =
    b.reportingPeriods[0]?.emissions?.calculatedTotalEmissions || 0;
  return sortDirection === "asc"
    ? aEmissions - bEmissions
    : bEmissions - aEmissions;
}

function compareScope3Coverage(
  a: RankedCompany,
  b: RankedCompany,
  sortDirection: SortDirection,
): number {
  const aHasCategories =
    (a.reportingPeriods[0]?.emissions?.scope3?.categories?.length || 0) > 0
      ? 1
      : 0;
  const bHasCategories =
    (b.reportingPeriods[0]?.emissions?.scope3?.categories?.length || 0) > 0
      ? 1
      : 0;
  return sortDirection === "asc"
    ? bHasCategories - aHasCategories
    : aHasCategories - bHasCategories;
}

function getMeetsParisSortValue(company: RankedCompany): number {
  const trendAnalysis = calculateTrendline(company);
  const meetsParis = trendAnalysis
    ? calculateMeetsParis(company, trendAnalysis)
    : null;
  return meetsParis === true ? 2 : meetsParis === false ? 1 : 0;
}

function compareMeetsParis(
  a: RankedCompany,
  b: RankedCompany,
  sortDirection: SortDirection,
): number {
  const aValue = getMeetsParisSortValue(a);
  const bValue = getMeetsParisSortValue(b);
  return sortDirection === "asc" ? bValue - aValue : aValue - bValue;
}

function compareNames(
  a: RankedCompany,
  b: RankedCompany,
  sortDirection: SortDirection,
): number {
  return sortDirection === "asc"
    ? a.name.localeCompare(b.name)
    : b.name.localeCompare(a.name);
}

function compareCompanies(
  a: RankedCompany,
  b: RankedCompany,
  sortBy: CompanySortBy,
  sortDirection: SortDirection,
): number {
  switch (sortBy) {
    case "emissions_reduction":
      return compareEmissionsReduction(a, b, sortDirection);
    case "total_emissions":
      return compareTotalEmissions(a, b, sortDirection);
    case "scope3_coverage":
      return compareScope3Coverage(a, b, sortDirection);
    case "meets_paris":
      return compareMeetsParis(a, b, sortDirection);
    case "name":
    default:
      return compareNames(a, b, sortDirection);
  }
}

export function filterAndSortCompanies(
  companies: RankedCompany[],
  params: CompanyFilterParams,
): RankedCompany[] {
  const {
    sectors,
    selectedCountries,
    searchQuery,
    meetsParisFilter,
    sortBy,
    sortDirection,
    sectorNames,
  } = params;

  return companies
    .filter(
      (company) =>
        matchesSector(company, sectors) &&
        matchesSearch(company, searchQuery, sectorNames) &&
        matchesMeetsParis(company, meetsParisFilter) &&
        companyMatchesCountries(company, selectedCountries),
    )
    .sort((a, b) => compareCompanies(a, b, sortBy, sortDirection));
}

function buildSectorFilterGroup(
  t: TFunction,
  sectorOptions: { value: string; label: string }[],
  sectors: CompanySector[],
  setSectors: (sectors: CompanySector[]) => void,
): FilterGroup {
  return {
    heading: t("explorePage.companies.sector"),
    options: sectorOptions.map((s) => ({
      value: s.value,
      label: s.label,
    })),
    selectedValues: sectors,
    onSelect: (value: string) => {
      if (value === "all") {
        setSectors(["all"]);
      } else if (sectors.includes("all")) {
        setSectors([value as CompanySector]);
      } else if (sectors.includes(value as CompanySector)) {
        setSectors(sectors.filter((s) => s !== value));
      } else {
        setSectors([...sectors, value as CompanySector]);
      }
    },
    selectMultiple: true,
  };
}

function buildCompanyMeetsParisFilterGroup(
  t: TFunction,
  meetsParisFilter: MeetsParisFilter,
  setMeetsParisFilter: (value: MeetsParisFilter) => void,
): FilterGroup {
  return {
    heading: t("explorePage.companies.filteringOptions.meetsParis"),
    options: [
      { value: "all", label: t("all") },
      {
        value: "yes",
        label: t("explorePage.companies.filteringOptions.meetsParisYes"),
      },
      {
        value: "no",
        label: t("explorePage.companies.filteringOptions.meetsParisNo"),
      },
      {
        value: "unknown",
        label: t("explorePage.companies.filteringOptions.meetsParisUnknown"),
      },
    ],
    selectedValues: [meetsParisFilter],
    onSelect: (value: string) => setMeetsParisFilter(value as MeetsParisFilter),
    selectMultiple: false,
  };
}

function getMeetsParisFilterLabel(
  t: TFunction,
  meetsParisFilter: MeetsParisFilter,
): string {
  if (meetsParisFilter === "yes") {
    return t("explorePage.companies.filteringOptions.meetsParisYes");
  }
  if (meetsParisFilter === "no") {
    return t("explorePage.companies.filteringOptions.meetsParisNo");
  }
  return t("explorePage.companies.filteringOptions.meetsParisUnknown");
}

function buildCompanyActiveFilters(
  t: TFunction,
  options: {
    includeSectorFilter: boolean;
    sectors: CompanySector[];
    selectedCountries: CompanyCountryTagSlug[];
    meetsParisFilter: MeetsParisFilter;
    sectorNames: Record<string, string>;
    countryNames: Record<CompanyCountryTagSlug, string>;
    setSectors: (sectors: CompanySector[]) => void;
    setSelectedCountries: (countries: CompanyCountryTagSlug[]) => void;
    setMeetsParisFilter: (value: MeetsParisFilter) => void;
  },
) {
  const {
    includeSectorFilter,
    sectors,
    selectedCountries,
    meetsParisFilter,
    sectorNames,
    countryNames,
    setSectors,
    setSelectedCountries,
    setMeetsParisFilter,
  } = options;

  return [
    ...(includeSectorFilter && !sectors.includes("all")
      ? sectors.map((sector) => ({
          type: "filter" as const,
          label: sectorNames[sector as keyof typeof sectorNames] || sector,
          onRemove: () => setSectors(sectors.filter((s) => s !== sector)),
        }))
      : []),
    ...buildCountryActiveFilters({
      countryNames,
      selectedCountries,
      onRemove: (country) =>
        setSelectedCountries(
          selectedCountries.filter((value) => value !== country),
        ),
    }),
    ...(meetsParisFilter !== "all"
      ? [
          {
            type: "filter" as const,
            label: `${t("explorePage.companies.filteringOptions.meetsParis")}: ${getMeetsParisFilterLabel(t, meetsParisFilter)}`,
            onRemove: () => setMeetsParisFilter("all"),
          },
        ]
      : []),
  ];
}

export function parseCompanySectors(
  searchParams: URLSearchParams,
  includeSectorFilter: boolean,
): CompanySector[] {
  if (!includeSectorFilter) {
    return ["all"];
  }

  return (searchParams
    .get("sectors")
    ?.split(",")
    .filter((s) => SECTORS.some((sector) => sector.value === s)) ?? [
    "all",
  ]) as CompanySector[];
}

export function buildCompanyFilterUi(
  t: TFunction,
  options: {
    includeSectorFilter: boolean;
    sectorOptions: { value: string; label: string }[];
    sectors: CompanySector[];
    selectedCountries: CompanyCountryTagSlug[];
    availableCountries: CompanyCountryTagSlug[];
    meetsParisFilter: MeetsParisFilter;
    sectorNames: Record<string, string>;
    countryNames: Record<CompanyCountryTagSlug, string>;
    setSectors: (value: CompanySector[]) => void;
    setSelectedCountries: (countries: CompanyCountryTagSlug[]) => void;
    onCountrySelect: (value: string) => void;
    setMeetsParisFilter: (value: MeetsParisFilter) => void;
  },
) {
  const {
    includeSectorFilter,
    sectorOptions,
    sectors,
    selectedCountries,
    availableCountries,
    meetsParisFilter,
    sectorNames,
    countryNames,
    setSectors,
    setSelectedCountries,
    onCountrySelect,
    setMeetsParisFilter,
  } = options;

  const countryFilterGroup = buildCountryFilterGroup({
    t,
    countryNames,
    availableCountries,
    selectedCountries,
    onSelect: onCountrySelect,
  });

  const filterGroups = [
    ...(includeSectorFilter
      ? [buildSectorFilterGroup(t, sectorOptions, sectors, setSectors)]
      : []),
    ...(countryFilterGroup ? [countryFilterGroup] : []),
    buildCompanyMeetsParisFilterGroup(t, meetsParisFilter, setMeetsParisFilter),
  ];

  const activeFilters = buildCompanyActiveFilters(t, {
    includeSectorFilter,
    sectors,
    selectedCountries,
    meetsParisFilter,
    sectorNames,
    countryNames,
    setSectors,
    setSelectedCountries,
    setMeetsParisFilter,
  });

  return { filterGroups, activeFilters };
}

export function parseMeetsParisFilter(
  searchParams: URLSearchParams,
): MeetsParisFilter {
  const meetsParisRaw = searchParams.get("meetsParisFilter") ?? "";
  const MEETS_PARIS_OPTIONS = ["all", "yes", "no", "unknown"] as const;
  return MEETS_PARIS_OPTIONS.includes(meetsParisRaw as MeetsParisFilter)
    ? (meetsParisRaw as MeetsParisFilter)
    : "all";
}
