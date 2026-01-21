import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { CardGrid } from "@/components/layout/CardGrid";
import { ListCard } from "@/components/layout/ListCard";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { calculateMeetsParis } from "@/lib/calculations/trends/meetsParis";
import { calculateEmissionsChange } from "@/utils/calculations/emissionsCalculations";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import { getCompanySectorName } from "@/utils/data/industryGrouping";
import type { RankedCompany } from "@/types/company";
import { useSortOptions } from "@/hooks/companies/useCompanySorting";
import { useCompanyFilters } from "@/hooks/companies/useCompanyFilters";
import { Input } from "@/components/ui/input";
import { FilterBadges } from "@/components/companies/list/FilterBadges";
import { FilterPopover } from "@/components/explore/FilterPopover";
import { SortPopover } from "@/components/explore/SortPopover";
import { useScreenSize } from "@/hooks/useScreenSize";
import { cn } from "@/lib/utils";

interface CompanyListProps {
  companies: RankedCompany[];
}

export function CompanyList({ companies }: CompanyListProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isEmissionsAIGenerated } = useVerificationStatus();
  const sectorNames = useSectorNames();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const sortOptions = useSortOptions();
  const screenSize = useScreenSize();

  const {
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
  } = useCompanyFilters(companies);

  // Transform company data for ListCard components
  const transformedCompanies = useMemo(() => {
    if (!companies) return [];

    return filteredCompanies.map((company) => {
      console.log(company);
      const { wikidataId, name, industry, reportingPeriods } = company;
      const isFinancialsSector = industry?.industryGics?.sectorCode === "40";
      const latestPeriod = reportingPeriods?.[0];
      const previousPeriod = reportingPeriods?.[1];

      // Get sector name instead of description
      const sectorName = getCompanySectorName(company, sectorNames);

      const currentEmissions =
        latestPeriod?.emissions?.calculatedTotalEmissions || null;

      // Calculate emissions change from previous period
      const emissionsChange = calculateEmissionsChange(
        latestPeriod,
        previousPeriod,
      );

      const noSustainabilityReport =
        !latestPeriod ||
        latestPeriod?.reportURL === null ||
        latestPeriod?.reportURL === "Saknar report" ||
        latestPeriod?.reportURL === undefined;

      const totalEmissionsAIGenerated = latestPeriod
        ? isEmissionsAIGenerated(latestPeriod)
        : false;
      const yearOverYearAIGenerated =
        (latestPeriod && isEmissionsAIGenerated(latestPeriod)) ||
        (previousPeriod && isEmissionsAIGenerated(previousPeriod));

      // Calculate trend analysis and meets Paris status
      const trendAnalysis = calculateTrendline(company);
      const meetsParis = trendAnalysis
        ? calculateMeetsParis(company, trendAnalysis)
        : null; // null = unknown

      //Get largest emittor (Scope or category if Scope 3)
      const scope1 = { scope1: latestPeriod?.emissions?.scope1?.total };
      const scope2 = {
        scope2: latestPeriod?.emissions?.scope2?.calculatedTotalEmissions,
      };
      const scope3 = {
        scope3: latestPeriod?.emissions?.scope3?.calculatedTotalEmissions,
      };

      const largestScope3Emission = (
        latestPeriod?.emissions?.scope3?.categories ?? []
      ).reduce(
        (acc, current) => {
          const value = current.total ?? 0; // alltid number
          const category = current.category;

          return value > acc.value ? { category, value } : acc;
        },
        { category: null as number | null, value: 0 },
      );

      const largestEmittorScope = [scope1, scope2, scope3].reduce(
        (acc, current) => {
          const value = Object.values(current)[0] ?? 0;
          const name = Object.keys(current)[0];

          return value > acc.value ? { name, value } : acc;
        },
        { name: null as string | null, value: 0 },
      );
      let largestEmission:
        | {
            key: string | number;
            value: number;
            type: "scope1" | "scope2" | "scope3";
          }
        | undefined;

      if (largestEmittorScope.name === "scope3") {
        largestEmission = {
          key: largestScope3Emission.category ?? 0,
          value: largestScope3Emission.value,
          type: "scope3",
        };
      } else if (largestEmittorScope.name === "scope2") {
        largestEmission = {
          key: "scope2",
          value: largestEmittorScope.value,
          type: "scope2",
        };
      } else if (largestEmittorScope.name === "scope1") {
        largestEmission = {
          key: "scope1",
          value: largestEmittorScope.value,
          type: "scope1",
        };
      } else {
        largestEmission = undefined;
      }

      const companyBaseYear = company?.baseYear?.year || null;

      return {
        name,
        description: sectorName,
        linkTo: `/companies/${wikidataId}`,
        meetsParis,
        meetsParisTranslationKey: "companies.card.meetsParis",
        emissionsValue:
          currentEmissions != null
            ? formatEmissionsAbsolute(currentEmissions, currentLanguage)
            : null,
        emissionsYear: latestPeriod
          ? new Date(latestPeriod.endDate).getFullYear().toString()
          : undefined,
        emissionsUnit: t("emissionsUnit"),
        emissionsIsAIGenerated: totalEmissionsAIGenerated,
        changeRateValue: emissionsChange
          ? formatPercentChange(emissionsChange, currentLanguage)
          : null,
        changeRateColor: emissionsChange
          ? emissionsChange < 0
            ? "text-orange-2"
            : "text-pink-3"
          : undefined,
        changeRateIsAIGenerated: yearOverYearAIGenerated,
        changeRateTooltip:
          emissionsChange && (emissionsChange <= -80 || emissionsChange >= 80)
            ? `${t("companies.card.emissionsChangeRateInfo")}\n\n${t("companies.card.emissionsChangeRateInfoExtended")}`
            : t("companies.card.emissionsChangeRateInfo"),
        latestReportTranslationKey: "companies.card.latestReport",
        latestReportContainEmissions: noSustainabilityReport
          ? t("companies.card.missingReport")
          : currentEmissions !== null,
        latestReportYearColor:
          noSustainabilityReport || currentEmissions === null
            ? "text-pink-3"
            : "text-green-3",
        isFinancialsSector,
        largestEmission: largestEmission,
        largestEmissionTranslationKey: largestEmission
          ? t("companies.card.largestEmissionSource")
          : t("companies.card.unknown"),
        emissionTrackingTranslationKey: t("companies.card.emissionTracking"),
        companyBaseYear: companyBaseYear,
      };
    });
  }, [companies, t, currentLanguage, isEmissionsAIGenerated, sectorNames]);

  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-light text-grey">
          {t("explorePage.companies.noCompaniesFound")}
        </h3>
        <p className="text-grey mt-2">
          {t("explorePage.companies.tryDifferentCriteria")}
        </p>
      </div>
    );
  }

  // Create active filters for badges
  const activeFilters = [
    ...(sectors.length > 0 && !sectors.includes("all")
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
    {
      type: "sort" as const,
      label: String(
        sortOptions.find((s) => s.value === sortBy)?.label ?? sortBy,
      ),
    },
  ];

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
            placeholder={t("explorePage.companies.searchPlaceholder")}
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
        items={transformedCompanies}
        itemContent={(transformedData) => (
          <ListCard key={transformedData.linkTo} {...transformedData} />
        )}
      />
    </>
  );
}
