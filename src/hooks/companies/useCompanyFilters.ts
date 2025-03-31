import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { CompanyDetails as Company, RankedCompany } from "@/types/company";

export const SECTOR_NAMES = {
  "10": "Energi",
  "15": "Material",
  "20": "Industri",
  "25": "Sällanköpsvaror",
  "30": "Dagligvaror",
  "35": "Hälsovård",
  "40": "Finans",
  "45": "IT",
  "50": "Kommunikation",
  "55": "Kraftförsörjning",
  "60": "Fastigheter",
} as const;

export type SectorCode = keyof typeof SECTOR_NAMES;

export const SECTOR_ORDER: SectorCode[] = [
  "10",
  "15",
  "20",
  "25",
  "30",
  "35",
  "40",
  "45",
  "50",
  "55",
  "60",
];

export const SECTORS = [
  { value: "all", label: "Alla sektorer" },
  ...Object.entries(SECTOR_NAMES).map(([code, name]) => ({
    value: code,
    label: name,
  })),
] as const;

export type CompanySector = (typeof SECTORS)[number]["value"];

// Hook to get translated sector names
export const useSectorNames = () => {
  const { t } = useTranslation();

  return {
    "10": t("sector.energy"),
    "15": t("sector.materials"),
    "20": t("sector.industrials"),
    "25": t("sector.consumerDiscretionary"),
    "30": t("sector.consumerStaples"),
    "35": t("sector.healthCare"),
    "40": t("sector.financials"),
    "45": t("sector.informationTechnology"),
    "50": t("sector.communicationServices"),
    "55": t("sector.utilities"),
    "60": t("sector.realEstate"),
  } as const;
};

// Hook to get translated sectors for dropdown
export const useSectors = () => {
  const { t } = useTranslation();
  const sectorNames = useSectorNames();

  // Cast the first item to the expected type
  const allSectorsOption = {
    value: "all" as "all",
    label: t("companiesPage.allSectors") as "Alla sektorer",
  };

  // Create the sector options with the correct types
  const sectorOptions = Object.entries(sectorNames).map(([value, label]) => ({
    value,
    label: label as
      | "Energi"
      | "Material"
      | "Industri"
      | "Sällanköpsvaror"
      | "Dagligvaror"
      | "Hälsovård"
      | "Finans"
      | "IT"
      | "Kommunikation"
      | "Kraftförsörjning"
      | "Fastigheter",
  }));

  // Filter out the "all" option from the sector options
  const filteredOptions = sectorOptions.filter(
    (option) => option.value !== "all"
  );

  // Return the array with the correct type
  return [allSectorsOption, ...filteredOptions] as const;
};

export const useSortOptions = () => {
  const { t } = useTranslation();

  return [
    {
      value: "emissions_reduction",
      label: t("companiesPage.sortingOptions.emissionsChange"),
    },
    {
      value: "total_emissions",
      label: t("companiesPage.sortingOptions.totalEmissions"),
    },
    {
      value: "scope3_coverage",
      label: t("companiesPage.sortingOptions.scope3Coverage"),
    },
    {
      value: "name_asc",
      label: t("companiesPage.sortingOptions.nameAsc"),
    },
    {
      value: "name_desc",
      label: t("companiesPage.sortingOptions.nameDesc"),
    },
  ] as const;
};

export type SortOption =
  | "emissions_reduction"
  | "total_emissions"
  | "scope3_coverage"
  | "name_asc"
  | "name_desc";

// Add sector color types
export interface SectorColor {
  base: string;
  scope1: string;
  scope2: string;
  scope3: string;
}

export type SectorColors = {
  [key in SectorCode]: SectorColor;
};

// Add the sector colors
export const sectorColors: SectorColors = {
  "10": {
    base: "var(--green-4)",
    scope1: "var(--green-4)",
    scope2: "var(--green-3)",
    scope3: "var(--green-2)",
  },
  "15": {
    base: "var(--blue-4)",
    scope1: "var(--blue-4)",
    scope2: "var(--blue-3)",
    scope3: "var(--blue-2)",
  },
  "20": {
    base: "var(--pink-4)",
    scope1: "var(--pink-4)",
    scope2: "var(--pink-3)",
    scope3: "var(--pink-2)",
  },
  "25": {
    base: "var(--orange-4)",
    scope1: "var(--orange-4)",
    scope2: "var(--orange-3)",
    scope3: "var(--orange-2)",
  },
  "30": {
    base: "var(--green-3)",
    scope1: "var(--green-3)",
    scope2: "var(--green-2)",
    scope3: "var(--green-1)",
  },
  "35": {
    base: "var(--blue-3)",
    scope1: "var(--blue-3)",
    scope2: "var(--blue-2)",
    scope3: "var(--blue-1)",
  },
  "40": {
    base: "var(--pink-3)",
    scope1: "var(--pink-3)",
    scope2: "var(--pink-2)",
    scope3: "var(--pink-1)",
  },
  "45": {
    base: "var(--orange-3)",
    scope1: "var(--orange-3)",
    scope2: "var(--orange-2)",
    scope3: "var(--orange-1)",
  },
  "50": {
    base: "var(--blue-2)",
    scope1: "var(--blue-2)",
    scope2: "var(--blue-3)",
    scope3: "var(--blue-1)",
  },
  "55": {
    base: "var(--green-2)",
    scope1: "var(--green-2)",
    scope2: "var(--green-3)",
    scope3: "var(--green-1)",
  },
  "60": {
    base: "var(--pink-2)",
    scope1: "var(--pink-2)",
    scope2: "var(--pink-3)",
    scope3: "var(--pink-1)",
  },
};

export const getCompanyColors = (index: number) => {
  const colors = Object.values(sectorColors);
  return colors[index % colors.length];
};

export const useCompanyFilters = (companies: RankedCompany[]) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sectors, setSectors] = useState<CompanySector[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("total_emissions");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const sortOptions = useSortOptions();

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
        const matchesSearch =
          !searchQuery ||
          company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (company.industry?.industryGics?.sectorCode &&
            SECTOR_NAMES[company.industry.industryGics.sectorCode as SectorCode]
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()));

        return matchesSector && matchesSearch;
      })
      .sort((a, b) => {
        // Sort companies
        switch (sortBy) {
          case "emissions_reduction": {
            const aChange =
              ((a.reportingPeriods[0]?.emissions?.calculatedTotalEmissions ||
                0) -
                (a.reportingPeriods[1]?.emissions?.calculatedTotalEmissions ||
                  0)) /
              (a.reportingPeriods[1]?.emissions?.calculatedTotalEmissions || 1);
            const bChange =
              ((b.reportingPeriods[0]?.emissions?.calculatedTotalEmissions ||
                0) -
                (b.reportingPeriods[1]?.emissions?.calculatedTotalEmissions ||
                  0)) /
              (b.reportingPeriods[1]?.emissions?.calculatedTotalEmissions || 1);
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
  }, [companies, sectors, searchQuery, sortBy, sortDirection]);

  return {
    searchQuery,
    setSearchQuery,
    sectors,
    setSectors,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    filteredCompanies,
    sortOptions,
  };
};

// Update the useCompanyColors hook to use CSS variables
export function useCompanyColors() {
  const companyColorPalettes = [
    // Blue palette
    {
      base: "var(--blue-5)",
      scope1: "var(--blue-5)",
      scope2: "var(--blue-3)",
      scope3: "var(--blue-1)",
    },
    {
      base: "var(--blue-4)",
      scope1: "var(--blue-4)",
      scope2: "var(--blue-2)",
      scope3: "var(--blue-1)",
    },
    {
      base: "var(--blue-3)",
      scope1: "var(--blue-3)",
      scope2: "var(--blue-5)",
      scope3: "var(--blue-1)",
    },

    // Green palette
    {
      base: "var(--green-5)",
      scope1: "var(--green-5)",
      scope2: "var(--green-3)",
      scope3: "var(--green-1)",
    },
    // Pink palette
    {
      base: "var(--pink-5)",
      scope1: "var(--pink-5)",
      scope2: "var(--pink-3)",
      scope3: "var(--pink-1)",
    },
    // Orange palette
    {
      base: "var(--orange-5)",
      scope1: "var(--orange-5)",
      scope2: "var(--orange-3)",
      scope3: "var(--orange-1)",
    },
  ];

  return (index: number) => {
    return companyColorPalettes[index % companyColorPalettes.length];
  };
}
