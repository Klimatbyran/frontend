/**
 * Legend utility functions for creating legend items
 */

import { LegendItem } from "../../../../types/charts";
import { LEGEND_CONFIGS } from "../styles/legendStyles";

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
      ? t("municipalities.graph.carbonLaw")
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
