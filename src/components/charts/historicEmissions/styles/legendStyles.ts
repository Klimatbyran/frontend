/**
 * Shared legend styling constants
 */

export const LEGEND_CONFIGS = {
  historical: {
    nameKey: "companies.emissionsHistory.totalEmissions", // Will be overridden for municipalities
    color: "white",
    isClickable: false,
    isHidden: false,
    isDashed: false,
  },
  estimated: {
    nameKey: "companies.emissionsHistory.approximated", // Will be overridden for municipalities
    color: "var(--grey)",
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
