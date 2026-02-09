import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { RankedCompany } from "@/types/company";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { calculateMeetsParis } from "@/lib/calculations/trends/meetsParis";
import { calculateEmissionsChange } from "@/utils/calculations/emissionsCalculations";
import {
  useSectorNames,
  useSectors,
} from "@/hooks/companies/useCompanySectors";
import { getCompanySectorName } from "@/utils/data/industryGrouping";
import { CompanySector, SECTORS } from "@/lib/constants/sectors";
import { FilterGroup } from "@/components/explore/FilterPopover";
import setOrDeleteSearchParam from "@/utils/data/setOrDeleteSearchParam";
import { isSortOption, useSortOptions, type CompanySortBy } from "./useCompanySorting";

const MEETS_PARIS_OPTIONS = ["all", "yes", "no", "unknown"] as const;
type MeetsParisFilter = (typeof MEETS_PARIS_OPTIONS)[number];

const isMeetsParisFilter = (value: string): value is MeetsParisFilter =>
  MEETS_PARIS_OPTIONS.includes(value as MeetsParisFilter);

export const useCompanyFilters = (companies: RankedCompany[]) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sortingOptions = useSortOptions();

  const searchQuery = searchParams.get("searchQuery") || "";
  const meetsParisFilter = isMeetsParisFilter(
    searchParams.get("meetsParisFilter") ?? "",
  )
    ? (searchParams.get("meetsParisFilter") as MeetsParisFilter)
    : "all";
  const sectors = (searchParams
    .get("sectors")
    ?.split(",")
    .filter((s) => SECTORS.some((sector) => sector.value === s)) ?? [
    "all",
  ]) as CompanySector[];
  const sortBy = isSortOption(searchParams.get("sortBy") ?? "")
    ? (searchParams.get("sortBy") as CompanySortBy)
    : "total_emissions";
  const sortDirection = (
    searchParams.get("sortDirection") == "asc" ||
    searchParams.get("sortDirection") == "desc"
      ? searchParams.get("sortDirection")
      : sortingOptions.find(o => o.value == sortBy)?.defaultDirection ?? "desc"
  ) as "asc" | "desc";

  const setSearchQuery = useCallback(
    (searchQuery: string) =>
      setOrDeleteSearchParam(
        setSearchParams,
        searchQuery.trim() || null,
        "searchQuery",
      ),
    [],
  );
  const setMeetsParisFilter = useCallback(
    (meetsParisFilter: string) =>
      setOrDeleteSearchParam(
        setSearchParams,
        meetsParisFilter,
        "meetsParisFilter",
      ),
    [],
  );
  const setSectors = useCallback(
    (sectors: CompanySector[]) =>
      setOrDeleteSearchParam(
        setSearchParams,
        sectors.length > 0 ? sectors.join(",") : null,
        "sectors",
      ),
    [],
  );
  const setSortBy = useCallback(
    (sortBy: string) =>
      setOrDeleteSearchParam(setSearchParams, sortBy, "sortBy"),
    [],
  );
  const setSortDirection = useCallback(
    (sortDirection: string) =>
      setOrDeleteSearchParam(setSearchParams, sortDirection, "sortDirection"),
    [],
  );

  const sectorNames = useSectorNames();
  const { t } = useTranslation();

  const filteredCompanies = useMemo(() => {
    return companies
      .filter((company) => {
        // Filter by sector
        const matchesSector =
          sectors.includes("all") ||
          (company.industry?.industryGics?.sectorCode &&
            sectors.includes(company.industry.industryGics.sectorCode));

        // Filter by search query
        const searchTerms = searchQuery
          .split(",")
          .map((term) => term.trim().toLowerCase())
          .filter((term) => term.length > 0);

        const matchesSearch =
          searchTerms.length === 0 ||
          searchTerms.some((term) => {
            const companyName = company.name.toLowerCase();
            const sectorName = getCompanySectorName(
              company,
              sectorNames,
            ).toLowerCase();

            // For shorter terms, use substring matching but require it to be at the start of a word
            const companyNamePattern = new RegExp(`\\b${term}`, "i");
            const sectorNamePattern = new RegExp(`\\b${term}`, "i");
            return (
              companyNamePattern.test(companyName) ||
              sectorNamePattern.test(sectorName)
            );
          });

        // Filter by meets Paris
        const matchesMeetsParis = (() => {
          if (meetsParisFilter === "all") return true;

          const trendAnalysis = calculateTrendline(company);
          const meetsParis = trendAnalysis
            ? calculateMeetsParis(company, trendAnalysis)
            : null; // null = unknown

          if (meetsParisFilter === "yes") return meetsParis === true;
          if (meetsParisFilter === "no") return meetsParis === false;
          if (meetsParisFilter === "unknown") return meetsParis === null;
          return true;
        })();

        return matchesSector && matchesSearch && matchesMeetsParis;
      })
      .sort((a, b) => {
        // Sort companies
        switch (sortBy) {
          case "emissions_reduction": {
            // Calculate year-over-year emissions change for both companies
            const aChange =
              calculateEmissionsChange(a.reportingPeriods[0]) || 0;
            const bChange =
              calculateEmissionsChange(b.reportingPeriods[0]) || 0;

            return sortDirection === "asc"
              ? aChange - bChange
              : bChange - aChange;
          }
          case "total_emissions": {
            const aEmissions =
              a.reportingPeriods[0]?.emissions?.calculatedTotalEmissions || 0;
            const bEmissions =
              b.reportingPeriods[0]?.emissions?.calculatedTotalEmissions || 0;
            return sortDirection === "asc"
              ? aEmissions - bEmissions
              : bEmissions - aEmissions;
          }
          case "scope3_coverage": {
            const aCategories =
              a.reportingPeriods[0]?.emissions?.scope3?.categories?.length || 0;
            const bCategories =
              b.reportingPeriods[0]?.emissions?.scope3?.categories?.length || 0;
            return sortDirection === "asc"
              ? aCategories - bCategories
              : bCategories - aCategories;
          }
          case "meets_paris": {
            const aTrendAnalysis = calculateTrendline(a);
            const bTrendAnalysis = calculateTrendline(b);
            const aMeetsParis = aTrendAnalysis
              ? calculateMeetsParis(a, aTrendAnalysis)
              : null; // null = unknown
            const bMeetsParis = bTrendAnalysis
              ? calculateMeetsParis(b, bTrendAnalysis)
              : null; // null = unknown

            // Convert to number for sorting (true = 2, false = 1, null = 0)
            const aValue =
              aMeetsParis === true ? 2 : aMeetsParis === false ? 1 : 0;
            const bValue =
              bMeetsParis === true ? 2 : bMeetsParis === false ? 1 : 0;

            return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
          }
          case "name":
          default:
            return sortDirection === "asc"
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
        }
      });
  }, [
    companies,
    sectors,
    searchQuery,
    meetsParisFilter,
    sortBy,
    sortDirection,
    sectorNames,
  ]);

  const filterGroups: FilterGroup[] = [
    {
      heading: t("explorePage.companies.sector"),
      options: useSectors().map((s) => ({ value: s.value, label: s.label })),
      selectedValues: sectors,
      onSelect: (value: string) => {
        if (value === "all") {
          setSectors(["all"]);
        } else if (sectors.includes("all")) {
          setSectors([value]);
        } else if (sectors.includes(value)) {
          setSectors(sectors.filter((s) => s !== value));
        } else {
          setSectors([...sectors, value]);
        }
      },
      selectMultiple: true,
    },
    {
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
      onSelect: (value: string) =>
        setMeetsParisFilter(value as MeetsParisFilter),
      selectMultiple: false,
    },
  ];

  const activeFilters = useMemo(() => {
    return [
      ...(!sectors.includes("all")
        ? sectors.map((sector) => ({
            type: "filter" as const,
            label: sectorNames[sector as keyof typeof sectorNames] || sector,
            onRemove: () => setSectors(sectors.filter((s) => s !== sector)),
          }))
        : []),
      ...(meetsParisFilter !== "all"
        ? [
            {
              type: "filter" as const,
              label: `${t("explorePage.companies.filteringOptions.meetsParis")}: ${
                meetsParisFilter === "yes"
                  ? t("explorePage.companies.filteringOptions.meetsParisYes")
                  : meetsParisFilter === "no"
                    ? t("explorePage.companies.filteringOptions.meetsParisNo")
                    : t(
                        "explorePage.companies.filteringOptions.meetsParisUnknown",
                      )
              }`,
              onRemove: () => setMeetsParisFilter("all"),
            },
          ]
        : []),
    ];
  }, [
    sectors,
    meetsParisFilter,
    sectorNames,
    t,
    setSectors,
    setMeetsParisFilter,
  ]);

  return {
    searchQuery,
    setSearchQuery,
    sectors,
    setSectors,
    meetsParisFilter,
    setMeetsParisFilter,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    filteredCompanies,
    filterGroups,
    activeFilters,
  };
};
