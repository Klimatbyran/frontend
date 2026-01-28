import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CardGrid } from "@/components/layout/CardGrid";
import { ListCard } from "@/components/layout/ListCard";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import {
  isMeetsParisFilter,
  isMunicipalitySortBy,
  MeetsParisFilter,
  MunicipalitySortBy,
} from "@/types/municipality";
import { SortDirection, SortPopover } from "@/components/explore/SortPopover";
import { useScreenSize } from "@/hooks/useScreenSize";
import { Input } from "@/components/ui/input";
import { FilterBadges } from "@/components/companies/list/FilterBadges";
import { FilterPopover } from "@/components/explore/FilterPopover";
import { useSortOptions } from "@/hooks/municipalities/useMunicipalitiesSorting";
import type { Municipality } from "@/types/municipality";
import { isSortDirection } from "@/components/explore/SortPopover";
import type { FilterGroup } from "@/components/explore/FilterPopover";
import { regions } from "@/lib/constants/regions";
import { cn } from "@/lib/utils";

interface MunicipalityListProps {
  municipalities: Municipality[];
}
export function MunicipalityList({ municipalities }: MunicipalityListProps) {
  const screenSize = useScreenSize();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const sortOptions = useSortOptions();

  const selectedRegion = searchParams.get("selectedRegion") || "all";
  const meetsParisFilter = isMeetsParisFilter(
    searchParams.get("meetsParisFilter") ?? "",
  )
    ? (searchParams.get("meetsParisFilter") as MeetsParisFilter)
    : "all";
  const searchQuery = searchParams.get("searchQuery") || "";
  const sortBy = isMunicipalitySortBy(searchParams.get("sortBy") ?? "")
    ? (searchParams.get("sortBy") as MunicipalitySortBy)
    : "emissions";
  const sortDirection = isSortDirection(searchParams.get("sortDirection") ?? "")
    ? (searchParams.get("sortDirection") as SortDirection)
    : (sortOptions.find((s) => s.value === sortBy)?.defaultDirection ?? "desc");

  const setOrDeleteSearchParam = (value: string | null, param: string) =>
    setSearchParams(
      (searchParams) => {
        if (value !== null) {
          searchParams.set(param, value);
        } else {
          searchParams.delete(param);
        }
        return searchParams;
      },
      { replace: true },
    );

  const setSelectedRegion = (selectedRegion: string) =>
    setOrDeleteSearchParam(selectedRegion, "selectedRegion");
  const setMeetsParisFilter = (meetsParisFilter: string) =>
    setOrDeleteSearchParam(meetsParisFilter, "meetsParisFilter");
  const setSearchQuery = (searchQuery: string) =>
    setOrDeleteSearchParam(searchQuery.trim() || null, "searchQuery");
  const setSortBy = (sortBy: string) =>
    setOrDeleteSearchParam(sortBy, "sortBy");
  const setSortDirection = (sortDirection: string) =>
    setOrDeleteSearchParam(sortDirection, "sortDirection");

  const filterGroups: FilterGroup[] = [
    {
      heading: t("explorePage.municipalities.filteringOptions.selectRegion"),
      options: [
        {
          value: "all",
          label: t("explorePage.municipalities.filteringOptions.allRegions"),
        },
        ...Object.keys(regions).map((r) => ({ value: r, label: r })),
      ],
      selectedValues: [selectedRegion],
      onSelect: setSelectedRegion,
      selectMultiple: false,
    },
    {
      heading: t("explorePage.municipalities.sortingOptions.meetsParis"),
      options: [
        { value: "all", label: t("all") },
        {
          value: "yes",
          label: t("yes"),
        },
        {
          value: "no",
          label: t("no"),
        },
      ],
      selectedValues: [meetsParisFilter],
      onSelect: (value: string) =>
        setMeetsParisFilter(value as MeetsParisFilter),
      selectMultiple: false,
    },
  ];

  // Create active filters for badges
  const activeFilters = [
    ...(selectedRegion !== "all"
      ? [
          {
            type: "filter" as const,
            label: selectedRegion,
            onRemove: () => setSelectedRegion("all"),
          },
        ]
      : []),
    ...(meetsParisFilter !== "all"
      ? [
          {
            type: "filter" as const,
            label: `${t("explorePage.municipalities.sortingOptions.meetsParis")}: ${
              meetsParisFilter === "yes" ? t("yes") : t("no")
            }`,
            onRemove: () => setMeetsParisFilter("all"),
          },
        ]
      : []),
    {
      type: "sort" as const,
      label: String(
        sortOptions.find((s) => s.value === sortBy)?.label ?? sortBy,
      ),
    },
  ];

  const filteredMunicipalities = municipalities.filter((municipality) => {
    if (selectedRegion !== "all" && municipality.region !== selectedRegion) {
      return false;
    }

    if (
      (meetsParisFilter === "yes" && municipality.meetsParisGoal !== true) ||
      (meetsParisFilter === "no" && municipality.meetsParisGoal !== false)
    ) {
      return false;
    }

    if (searchQuery) {
      const searchTerms = searchQuery
        .toLowerCase()
        .split(",")
        .map((term) => term.trim())
        .filter((term) => term.length > 0);

      return searchTerms.some((term) =>
        municipality.name.toLowerCase().startsWith(term),
      );
    }

    return true;
  });

  const sortedMunicipalities = filteredMunicipalities.sort((a, b) => {
    const directionMultiplier = sortDirection === "desc" ? -1 : 1;
    switch (sortBy) {
      case "meets_paris": {
        return (
          directionMultiplier *
          ((a.meetsParisGoal ? 0 : 1) - (b.meetsParisGoal ? 0 : 1))
        );
      }
      case "name":
        return directionMultiplier * a.name.localeCompare(b.name);
      case "emissions":
        return (
          directionMultiplier *
          ((a.emissions?.at(-1)?.value ?? 0) -
            (b.emissions?.at(-1)?.value ?? 0))
        );
      case "emissionsChangeRate":
        return (
          directionMultiplier *
          (a.historicalEmissionChangePercent -
            b.historicalEmissionChangePercent)
        );
      default:
        return 0;
    }
  });

  // Transform municipality data for ListCard components
  const transformedMunicipalities = useMemo(() => {
    return sortedMunicipalities.map((municipality) => {
      const { meetsParisGoal } = municipality;

      const lastYearEmission = municipality.emissions.at(-1);
      const lastYearEmissions = lastYearEmission
        ? formatEmissionsAbsolute(lastYearEmission.value, currentLanguage)
        : t("municipalities.card.noData");
      const lastYear = lastYearEmission?.year.toString() || "";

      const emissionsChangeExists =
        municipality.historicalEmissionChangePercent;
      const emissionsChange = emissionsChangeExists
        ? formatPercentChange(emissionsChangeExists, currentLanguage)
        : t("municipalities.card.noData");

      const noClimatePlan = !municipality.climatePlanLink;

      return {
        name: municipality.name,
        description: municipality.region,
        logoUrl: municipality.logoUrl,
        linkTo: `/municipalities/${municipality.name}`,
        meetsParis: meetsParisGoal,
        meetsParisTranslationKey: "municipalities.card.meetsParis",
        emissionsValue: lastYearEmissions,
        emissionsYear: lastYear,
        emissionsUnit: t("emissionsUnit"),
        changeRateValue: emissionsChange,
        changeRateColor:
          emissionsChangeExists > 0 ? "text-pink-3" : "text-orange-2",
        changeRateTooltip: t("municipalities.card.changeRateInfo"),
        linkCardLink:
          municipality.climatePlanLink &&
          municipality.climatePlanLink !== "Saknar plan"
            ? municipality.climatePlanLink
            : undefined,
        linkCardTitle: t("municipalities.card.climatePlan"),
        linkCardDescription: noClimatePlan
          ? t("municipalities.card.noPlan")
          : t("municipalities.card.adopted", {
              year: municipality.climatePlanYear,
            }),
        linkCardDescriptionColor: noClimatePlan
          ? "text-pink-3"
          : "text-green-3",
      };
    });
  }, [sortedMunicipalities, currentLanguage, t]);

  return (
    <>
      {/* Filters & Sorting Section */}
      <div
        className={cn(
          screenSize.isMobile ? "relative" : "sticky top-0 z-10",
          "bg-black shadow-md",
        )}
      >
        <div className="absolute inset-0 w-full bg-black -z-10" />

        {/* Wrapper for Filters, Search, and Badges */}
        <div className={cn("flex flex-wrap items-center gap-2 mb-2 md:mb-4")}>
          {/* Search Input */}
          <Input
            type="text"
            placeholder={t(
              "explorePage.municipalities.filteringOptions.searchPlaceholder",
            )}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black-1 rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-2 relative w-full md:w-[350px]"
          />

          {/* Filter and Sort Buttons */}
          <FilterPopover
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            groups={filterGroups}
          />

          <SortPopover
            sortOpen={sortOpen}
            setSortOpen={setSortOpen}
            sortOptions={sortOptions}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
          />

          {/* Badges */}
          {activeFilters.length > 0 && (
            <div
              className={cn(
                "flex flex-wrap gap-2",
                screenSize.isMobile ? "w-full" : "flex-1",
              )}
            >
              <FilterBadges filters={activeFilters} view="list" />
            </div>
          )}
        </div>
      </div>

      <CardGrid
        items={transformedMunicipalities}
        itemContent={(transformedData) => (
          <ListCard key={transformedData.linkTo} {...transformedData} />
        )}
      />
    </>
  );
}
