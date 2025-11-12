import { useState, useMemo } from "react";
import type { RankedCompany } from "@/types/company";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { calculateMeetsParis } from "@/lib/calculations/trends/meetsParis";
import { calculateEmissionsChange } from "@/utils/calculations/emissionsCalculations";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import { getCompanySectorName } from "@/utils/data/industryGrouping";
import type { CompanySector } from "@/lib/constants/sectors";
import type { SortOption } from "./useCompanySorting";

export const useCompanyFilters = (companies: RankedCompany[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sectors, setSectors] = useState<CompanySector[]>([]);
  const [meetsParisFilter, setMeetsParisFilter] = useState<
    "all" | "yes" | "no" | "unknown"
  >("all");
  const [sortBy, setSortBy] = useState<SortOption>("total_emissions");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const sectorNames = useSectorNames();

  const filteredCompanies = useMemo(() => {
    return companies
      .filter((company) => {
        // Filter by sector
        const matchesSector =
          sectors.length === 0 ||
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
          case "name_asc":
            return a.name.localeCompare(b.name);
          case "name_desc":
            return b.name.localeCompare(a.name);
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
  };
};
