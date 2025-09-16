/**
 * Shared legend styling utilities and constants
 */

import { LegendItem } from "../ChartTypes";

// Common legend item configurations
export const LEGEND_CONFIGS = {
  // Overview chart legend items
  historical: {
    nameKey: "companies.emissionsHistory.totalEmissions", // Will be overridden for municipalities
    color: "white",
    isClickable: false,
    isHidden: false,
    isDashed: false,
  },
  estimated: {
    nameKey: "companies.emissionsHistory.approximated", // Will be overridden for municipalities
    color: "white",
    isClickable: false,
    isHidden: false,
    isDashed: true,
  },
  trend: {
    nameKey: "municipalities.graph.trend",
    color: "var(--pink-3)",
    isClickable: true,
    isHidden: false,
    isDashed: true,
  },
  paris: {
    nameKey: "companies.emissionsHistory.carbonLaw", // Will be overridden for municipalities
    color: "var(--green-3)",
    isClickable: false,
    isHidden: false,
    isDashed: true,
  },
  // Scope legend items
  scope1: {
    nameKey: "companies.emissionsHistory.scope1",
    color: "var(--pink-3)",
    isClickable: true,
    isHidden: false,
    isDashed: false,
  },
  scope2: {
    nameKey: "companies.emissionsHistory.scope2",
    color: "var(--green-2)",
    isClickable: true,
    isHidden: false,
    isDashed: false,
  },
  scope3: {
    nameKey: "companies.emissionsHistory.scope3",
    color: "var(--blue-2)",
    isClickable: true,
    isHidden: false,
    isDashed: false,
  },
} as const;

// Legend container configurations
export const LEGEND_CONTAINER_CONFIGS = {
  overview: {
    showMetadata: false,
    allowClickToHide: false,
    maxHeight: "200px",
    mobileMaxHeight: "150px",
    forceExpandable: false,
  },
  interactive: {
    showMetadata: false,
    allowClickToHide: true,
    maxHeight: "200px",
    mobileMaxHeight: "150px",
    forceExpandable: true, 
  },
  sectors: {
    showMetadata: false,
    allowClickToHide: true,
    maxHeight: "200px",
    mobileMaxHeight: "150px",
    forceExpandable: true, 
  },
} as const;

// Utility function to create legend items for overview charts
export const createOverviewLegendItems = (
  t: (key: string) => string,
  hiddenItems: Set<string> = new Set(),
  isMunicipality: boolean = false,
): LegendItem[] => {
  const items: LegendItem[] = [
    {
      name: isMunicipality
        ? t("municipalities.graph.historical")
        : t("companies.emissionsHistory.totalEmissions"),
      color: LEGEND_CONFIGS.historical.color,
      isClickable: LEGEND_CONFIGS.historical.isClickable,
      isHidden: hiddenItems.has("historical"),
      isDashed: LEGEND_CONFIGS.historical.isDashed,
    },
  ];

  // Add estimated/approximated line
  items.push({
    name: isMunicipality
      ? t("municipalities.graph.estimated")
      : t("companies.emissionsHistory.approximated"),
    color: LEGEND_CONFIGS.estimated.color,
    isClickable: LEGEND_CONFIGS.estimated.isClickable,
    isHidden: hiddenItems.has(isMunicipality ? "approximated" : "approximated"),
    isDashed: LEGEND_CONFIGS.estimated.isDashed,
  });

  // Add trend line (municipalities only)
  if (isMunicipality) {
    items.push({
      name: t("municipalities.graph.trend"),
      color: LEGEND_CONFIGS.trend.color,
      isClickable: LEGEND_CONFIGS.trend.isClickable,
      isHidden: hiddenItems.has("trend"),
      isDashed: LEGEND_CONFIGS.trend.isDashed,
    });
  }

  // Add Paris/carbon law line
  items.push({
    name: isMunicipality
      ? t("municipalities.graph.parisAgreement")
      : t("companies.emissionsHistory.carbonLaw"),
    color: LEGEND_CONFIGS.paris.color,
    isClickable: LEGEND_CONFIGS.paris.isClickable,
    isHidden: hiddenItems.has(isMunicipality ? "paris" : "carbonLaw"),
    isDashed: LEGEND_CONFIGS.paris.isDashed,
  });

  return items;
};

// Utility function to create legend items for scope charts
export const createScopeLegendItems = (
  t: (key: string) => string,
  hiddenScopes: Set<string> = new Set(),
): LegendItem[] => {
  return [
    {
      name: t("companies.emissionsHistory.scope1"),
      color: LEGEND_CONFIGS.scope1.color,
      isClickable: LEGEND_CONFIGS.scope1.isClickable,
      isHidden: hiddenScopes.has("scope1"),
      isDashed: LEGEND_CONFIGS.scope1.isDashed,
    },
    {
      name: t("companies.emissionsHistory.scope2"),
      color: LEGEND_CONFIGS.scope2.color,
      isClickable: LEGEND_CONFIGS.scope2.isClickable,
      isHidden: hiddenScopes.has("scope2"),
      isDashed: LEGEND_CONFIGS.scope2.isDashed,
    },
    {
      name: t("companies.emissionsHistory.scope3"),
      color: LEGEND_CONFIGS.scope3.color,
      isClickable: LEGEND_CONFIGS.scope3.isClickable,
      isHidden: hiddenScopes.has("scope3"),
      isDashed: LEGEND_CONFIGS.scope3.isDashed,
    },
  ];
};

// Utility function to create legend items for category charts
export const createCategoryLegendItems = (
  categoryKeys: string[],
  hiddenCategories: Set<number> = new Set(),
  getCategoryName: (id: number) => string,
  getCategoryColor: (id: number) => string,
): LegendItem[] => {
  return categoryKeys.map((categoryKey) => {
    const categoryId = parseInt(categoryKey.replace("cat", ""));
    return {
      name: getCategoryName(categoryId),
      color: getCategoryColor(categoryId),
      isClickable: true,
      isHidden: hiddenCategories.has(categoryId),
      isDashed: false,
    };
  });
};

// Utility function to create legend items for sector charts
export const createSectorLegendItems = (
  sectors: string[],
  hiddenSectors: Set<string> = new Set(),
  getSectorInfo: (
    sector: string,
  ) => { translatedName: string; color: string } | undefined,
): LegendItem[] => {
  return sectors.map((sector) => {
    const sectorInfo = getSectorInfo?.(sector) || {
      translatedName: sector,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    };

    return {
      name: sectorInfo.translatedName,
      color: sectorInfo.color,
      isClickable: true,
      isHidden: hiddenSectors.has(sector),
      isDashed: false,
    };
  });
};
