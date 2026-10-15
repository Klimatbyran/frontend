import { type TFunction } from "i18next";
import type { PageExploreCompany } from "@/types/pages";
import {
  CompanySector,
  INDUSTRY_GROUP_OPTIONS,
  IndustryGroupCode,
  IndustryGroupOption,
  SECTORS,
} from "@/lib/constants/sectors";
import type {
  FilterGroup,
  FilterOptionGroup,
} from "@/components/explore/FilterPopover";
import type { CompanySortBy } from "./useCompanySorting";
import type { SortDirection } from "@/components/explore/SortPopover";
import { getSearchTerms } from "@/hooks/explore/exploreFilterUtils";
import { FilterBadge } from "@/components/companies/list/FilterBadges";
import {
  buildSearchRegex as buildLocalizedSearchRegex,
  buildWordStartSearchRegex,
} from "@/utils/data/search";
import { SupportedLanguage } from "@/lib/languageDetection";
import { getCompanySectorName } from "@/utils/data/industryGrouping";

type MeetsParisFilter = "all" | "yes" | "no" | "unknown";

type CompanyFilterParams = {
  sectors: CompanySector[];
  industryGroups: IndustryGroupOption[];
  searchQuery: string;
  meetsParisFilter: MeetsParisFilter;
  sortBy: CompanySortBy;
  sortDirection: SortDirection;
  sectorNames: Record<string, string>;
  industryGroupNames: Record<string, string>;
  currentLanguage: SupportedLanguage;
};

function matchesSector(
  company: PageExploreCompany,
  sectors: CompanySector[],
): boolean {
  return (
    sectors.includes("all") ||
    (company.sectorCode != null && sectors.includes(company.sectorCode))
  );
}

function matchesIndustryGroup(
  company: PageExploreCompany,
  industryGroups: IndustryGroupOption[],
): boolean {
  return (
    industryGroups.includes("all") ||
    (company.industryGroupCode != null &&
      industryGroups.includes(company.industryGroupCode as IndustryGroupCode))
  );
}

function matchesSearch(
  company: PageExploreCompany,
  nameSearchPatterns: RegExp[],
  industrySearchPatterns: RegExp[],
  matchedIndustryGroups: string[],
  sectorNames: Record<string, string>,
): boolean {
  if (
    nameSearchPatterns.length === 0 ||
    nameSearchPatterns.some((p) => p.test(company.name))
  ) {
    return true;
  }

  const sectorName = getCompanySectorName(company.sectorCode, sectorNames);

  return (
    industrySearchPatterns.some((pattern) => pattern.test(sectorName)) ||
    matchedIndustryGroups.some((s) => s === company.industryGroupCode)
  );
}

function matchesMeetsParis(
  company: PageExploreCompany,
  meetsParisFilter: MeetsParisFilter,
): boolean {
  if (meetsParisFilter === "all") {
    return true;
  }

  const meetsParis = company.meetsParis;
  if (meetsParisFilter === "yes") return meetsParis === true;
  if (meetsParisFilter === "no") return meetsParis === false;
  if (meetsParisFilter === "unknown") return meetsParis === null;
  return true;
}

function compareNullableNumbers(
  a: number | null,
  b: number | null,
  sortDirection: SortDirection,
): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return sortDirection === "asc" ? a - b : b - a;
}

function compareEmissionsReduction(
  a: PageExploreCompany,
  b: PageExploreCompany,
  sortDirection: SortDirection,
): number {
  return compareNullableNumbers(
    a.emissionsChangeLastTwoYears,
    b.emissionsChangeLastTwoYears,
    sortDirection,
  );
}

function compareTotalEmissions(
  a: PageExploreCompany,
  b: PageExploreCompany,
  sortDirection: SortDirection,
): number {
  return compareNullableNumbers(
    a.latestTotalEmissions,
    b.latestTotalEmissions,
    sortDirection,
  );
}

function compareScope3Coverage(
  a: PageExploreCompany,
  b: PageExploreCompany,
  sortDirection: SortDirection,
): number {
  const aHasCategories = a.hasScope3Coverage ? 1 : 0;
  const bHasCategories = b.hasScope3Coverage ? 1 : 0;
  return sortDirection === "asc"
    ? bHasCategories - aHasCategories
    : aHasCategories - bHasCategories;
}

function getMeetsParisSortValue(company: PageExploreCompany): number {
  return company.meetsParis === true ? 2 : company.meetsParis === false ? 1 : 0;
}

function compareMeetsParis(
  a: PageExploreCompany,
  b: PageExploreCompany,
  sortDirection: SortDirection,
): number {
  const aValue = getMeetsParisSortValue(a);
  const bValue = getMeetsParisSortValue(b);
  return sortDirection === "asc" ? bValue - aValue : aValue - bValue;
}

function compareNames(
  a: PageExploreCompany,
  b: PageExploreCompany,
  sortDirection: SortDirection,
  currentLanguage: SupportedLanguage,
): number {
  const locale = currentLanguage === "sv" ? "sv" : "en";
  const comparison = a.name.localeCompare(b.name, locale, {
    sensitivity: "base",
  });
  return sortDirection === "asc" ? comparison : -comparison;
}

function compareCompanies(
  a: PageExploreCompany,
  b: PageExploreCompany,
  sortBy: CompanySortBy,
  sortDirection: SortDirection,
  currentLanguage: SupportedLanguage,
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
      return compareNames(a, b, sortDirection, currentLanguage);
  }
}

export function filterAndSortCompanies(
  companies: PageExploreCompany[],
  params: CompanyFilterParams,
): PageExploreCompany[] {
  const {
    sectors,
    industryGroups,
    searchQuery,
    meetsParisFilter,
    sortBy,
    sortDirection,
    sectorNames,
    industryGroupNames,
    currentLanguage,
  } = params;

  const nameSearchPatterns = getSearchTerms(searchQuery).map((s) =>
    buildLocalizedSearchRegex(s, currentLanguage, true),
  );

  const industrySearchPatterns = getSearchTerms(searchQuery).map((s) =>
    buildWordStartSearchRegex(s),
  );

  const matchedSearchIndustryGroups = Object.entries(industryGroupNames)
    .filter((s) => industrySearchPatterns.some((pattern) => pattern.test(s[1])))
    .map((s) => s[0]);

  return companies
    .filter(
      (company) =>
        matchesSector(company, sectors) &&
        matchesIndustryGroup(company, industryGroups) &&
        matchesSearch(
          company,
          nameSearchPatterns,
          industrySearchPatterns,
          matchedSearchIndustryGroups,
          sectorNames,
        ) &&
        matchesMeetsParis(company, meetsParisFilter),
    )
    .sort((a, b) =>
      compareCompanies(a, b, sortBy, sortDirection, currentLanguage),
    );
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

function buildIndustryGroupFilterGroup(
  t: TFunction,
  industryGroupFilterOptionGroups: FilterOptionGroup[],
  industryGroups: IndustryGroupOption[],
  setIndustryGroups: (industryGroups: IndustryGroupOption[]) => void,
): FilterGroup {
  return {
    heading: t("explorePage.companies.industryGroup"),
    optionGroups: industryGroupFilterOptionGroups,
    selectedValues: industryGroups,
    onSelect: (value: string) => {
      if (value === "all") {
        setIndustryGroups(["all"]);
      } else if (industryGroups.includes("all")) {
        setIndustryGroups([value as IndustryGroupOption]);
      } else if (industryGroups.includes(value as IndustryGroupOption)) {
        setIndustryGroups(industryGroups.filter((s) => s !== value));
      } else {
        setIndustryGroups([...industryGroups, value as IndustryGroupOption]);
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
    includeIndustryGroupFilter: boolean;
    sectors: CompanySector[];
    industryGroups: IndustryGroupOption[];
    meetsParisFilter: MeetsParisFilter;
    sectorNames: Record<string, string>;
    industryGroupNames: Record<string, string>;
    setSectors: (sectors: CompanySector[]) => void;
    setIndustryGroups: (industryGroups: IndustryGroupOption[]) => void;
    setMeetsParisFilter: (value: MeetsParisFilter) => void;
  },
): FilterBadge[] {
  const {
    includeSectorFilter,
    includeIndustryGroupFilter,
    sectors,
    industryGroups,
    meetsParisFilter,
    sectorNames,
    industryGroupNames,
    setSectors,
    setIndustryGroups,
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
    ...(includeIndustryGroupFilter && !industryGroups.includes("all")
      ? industryGroups.map((industryGroup) => ({
          type: "filter" as const,
          label:
            industryGroupNames[
              industryGroup as keyof typeof industryGroupNames
            ] || industryGroup,
          onRemove: () =>
            setIndustryGroups(
              industryGroups.filter((s) => s !== industryGroup),
            ),
        }))
      : []),
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

  const sectors = searchParams
    .get("sectors")
    ?.split(",")
    .filter((s) => SECTORS.some((sector) => sector.value === s));

  return (sectors && sectors.length > 0 ? sectors : ["all"]) as CompanySector[];
}

export function parseIndustryGroups(
  searchParams: URLSearchParams,
  includeIndustryGroupFilter: boolean,
): IndustryGroupOption[] {
  if (!includeIndustryGroupFilter) {
    return ["all"];
  }

  const industryGroups = searchParams
    .get("industryGroups")
    ?.split(",")
    .filter((s) => INDUSTRY_GROUP_OPTIONS.some((g) => g === s));

  return (
    industryGroups && industryGroups.length > 0 ? industryGroups : ["all"]
  ) as IndustryGroupOption[];
}

export function buildCompanyFilterUi(
  t: TFunction,
  options: {
    includeSectorFilter: boolean;
    includeIndustryGroupFilter: boolean;
    sectorOptions: { value: string; label: string }[];
    sectors: CompanySector[];
    industryGroupFilterOptionGroups: FilterOptionGroup[];
    industryGroups: IndustryGroupOption[];
    meetsParisFilter: MeetsParisFilter;
    sectorNames: Record<string, string>;
    industryGroupNames: Record<string, string>;
    setSectors: (value: CompanySector[]) => void;
    setIndustryGroups: (value: IndustryGroupOption[]) => void;
    setMeetsParisFilter: (value: MeetsParisFilter) => void;
  },
) {
  const {
    includeSectorFilter,
    includeIndustryGroupFilter,
    sectorOptions,
    sectors,
    industryGroupFilterOptionGroups,
    industryGroups,
    meetsParisFilter,
    sectorNames,
    industryGroupNames,
    setSectors,
    setIndustryGroups,
    setMeetsParisFilter,
  } = options;

  const filterGroups = [
    ...(includeSectorFilter
      ? [buildSectorFilterGroup(t, sectorOptions, sectors, setSectors)]
      : []),
    ...(includeIndustryGroupFilter
      ? [
          buildIndustryGroupFilterGroup(
            t,
            industryGroupFilterOptionGroups,
            industryGroups,
            setIndustryGroups,
          ),
        ]
      : []),
    buildCompanyMeetsParisFilterGroup(t, meetsParisFilter, setMeetsParisFilter),
  ];

  const activeFilters = buildCompanyActiveFilters(t, {
    includeSectorFilter,
    includeIndustryGroupFilter,
    sectors,
    industryGroups,
    meetsParisFilter,
    sectorNames,
    industryGroupNames,
    setSectors,
    setIndustryGroups,
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
