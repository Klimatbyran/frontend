import {
  INDUSTRY_GROUP_CODES_BY_SECTOR,
  type SectorCode,
  getSectorCodeFromIndustryGroup,
  isIndustryGroupCode,
} from "./sectors";

export interface SectorColor {
  base: string;
  scope1: string;
  scope2: string;
  scope3: string;
}

export type SectorColors = {
  [key in SectorCode]: SectorColor;
};

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

const INDUSTRY_GROUP_SHADE_KEYS = ["base", "scope2", "scope3"] as const;

export const getIndustryGroupColor = (groupCode?: string): string => {
  if (!groupCode) {
    return "var(--grey)";
  }

  const sectorCode = getSectorCodeFromIndustryGroup(groupCode);
  if (!sectorCode) {
    return "var(--grey)";
  }

  const palette = sectorColors[sectorCode];
  const siblings = INDUSTRY_GROUP_CODES_BY_SECTOR[sectorCode];
  const siblingIndex = isIndustryGroupCode(groupCode)
    ? siblings.indexOf(groupCode)
    : -1;
  const shadeKey =
    INDUSTRY_GROUP_SHADE_KEYS[
      Math.max(0, siblingIndex) % INDUSTRY_GROUP_SHADE_KEYS.length
    ];

  return palette[shadeKey];
};

export const getGicsCategoryColor = (code?: string): string => {
  if (!code) {
    return "var(--grey)";
  }

  if (isIndustryGroupCode(code) || code.length === 4) {
    return getIndustryGroupColor(code);
  }

  return sectorColors[code as SectorCode]?.base ?? "var(--grey)";
};
