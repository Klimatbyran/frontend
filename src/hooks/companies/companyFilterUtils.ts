import { type TFunction } from "i18next";
import type { RankedCompany } from "@/types/company";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { calculateMeetsParis } from "@/lib/calculations/trends/meetsParis";
import { calculateEmissionsChange } from "@/utils/calculations/emissionsCalculations";
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
import type { CompanyCountryTagSlug } from "@/lib/constants/companyCountryTags";
import {
  buildCountryActiveFilters,
  buildCountryFilterGroup,
  companyMatchesCountries,
} from "./companyCountryFilterUtils";
import { FilterBadge } from "@/components/companies/list/FilterBadges";
import { buildSearchRegex as buildLocalizedSearchRegex } from "@/utils/data/search";
import { SupportedLanguage } from "@/lib/languageDetection";
import { getCompanySectorName } from "@/utils/data/industryGrouping";

type MeetsParisFilter = "all" | "yes" | "no" | "unknown";

type CompanyFilterParams = {
  sectors: CompanySector[];
  industryGroups: IndustryGroupOption[];
  selectedCountries: CompanyCountryTagSlug[];
  searchQuery: string;
  meetsParisFilter: MeetsParisFilter;
  sortBy: CompanySortBy;
  sortDirection: SortDirection;
  sectorNames: Record<string, string>;
  industryGroupNames: Record<string, string>;
  currentLanguage: SupportedLanguage;
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

function matchesIndustryGroup(
  company: RankedCompany,
  industryGroups: IndustryGroupOption[],
): boolean {
  return (
    industryGroups.includes("all") ||
    (company.industry?.industryGics?.groupCode != null &&
      industryGroups.includes(
        company.industry.industryGics.groupCode as IndustryGroupCode,
      ))
  );
}

function matchesSearch(
  company: RankedCompany,
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

  const sectorName = getCompanySectorName(company, sectorNames);

  return (
    industrySearchPatterns.some((pattern) => pattern.test(sectorName)) ||
    matchedIndustryGroups.some(
      (s) => s === company.industry?.industryGics.groupCode,
    )
  );
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
    industryGroups,
    selectedCountries,
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

  const industrySearchPatterns = getSearchTerms(searchQuery).map(
    (s) => new RegExp(`(?<!\\p{L})${s}`, "iu"),
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
    selectedCountries: CompanyCountryTagSlug[];
    meetsParisFilter: MeetsParisFilter;
    sectorNames: Record<string, string>;
    industryGroupNames: Record<string, string>;
    countryNames: Record<CompanyCountryTagSlug, string>;
    setSectors: (sectors: CompanySector[]) => void;
    setIndustryGroups: (industryGroups: IndustryGroupOption[]) => void;
    setSelectedCountries: (countries: CompanyCountryTagSlug[]) => void;
    setMeetsParisFilter: (value: MeetsParisFilter) => void;
  },
): FilterBadge[] {
  const {
    includeSectorFilter,
    includeIndustryGroupFilter,
    sectors,
    industryGroups,
    selectedCountries,
    meetsParisFilter,
    sectorNames,
    industryGroupNames,
    countryNames,
    setSectors,
    setIndustryGroups,
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
    selectedCountries: CompanyCountryTagSlug[];
    availableCountries: CompanyCountryTagSlug[];
    meetsParisFilter: MeetsParisFilter;
    sectorNames: Record<string, string>;
    industryGroupNames: Record<string, string>;
    countryNames: Record<CompanyCountryTagSlug, string>;
    setSectors: (value: CompanySector[]) => void;
    setIndustryGroups: (value: IndustryGroupOption[]) => void;
    setSelectedCountries: (countries: CompanyCountryTagSlug[]) => void;
    onCountrySelect: (value: string) => void;
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
    selectedCountries,
    availableCountries,
    meetsParisFilter,
    sectorNames,
    industryGroupNames,
    countryNames,
    setSectors,
    setIndustryGroups,
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
    ...(countryFilterGroup ? [countryFilterGroup] : []),
    buildCompanyMeetsParisFilterGroup(t, meetsParisFilter, setMeetsParisFilter),
  ];

  const activeFilters = buildCompanyActiveFilters(t, {
    includeSectorFilter,
    includeIndustryGroupFilter,
    sectors,
    industryGroups,
    selectedCountries,
    meetsParisFilter,
    sectorNames,
    industryGroupNames,
    countryNames,
    setSectors,
    setIndustryGroups,
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
