import { useTranslation } from "react-i18next";

export const SECTOR_TRANSLATION_KEYS = {
  "Industri (energi + processer)": "industry",
  "Produktanvändning (inkl. lösningsmedel)": "productUse",
  "Utrikes transporter": "internationalTransport",
  Jordbruk: "agriculture",
  "El och fjärrvärme": "electricityAndHeating",
  Arbetsmaskiner: "workingMachines",
  "Avfall (inkl.avlopp)": "waste",
  "Egen uppvärmning av bostäder och lokaler": "ownHeating",
  Transporter: "transport",
} as const;

const SECTOR_COLORS = {
  industry: "var(--orange-2)",
  productUse: "var(--orange-4)",
  internationalTransport: "var(--green-2)",
  agriculture: "var(--green-4)",
  electricityAndHeating: "var(--blue-2)",
  workingMachines: "var(--blue-4)",
  waste: "var(--pink-2)",
  ownHeating: "var(--pink-4)",
  transport: "var(--orange-3)",
} as const;

export type Sector = keyof typeof SECTOR_TRANSLATION_KEYS;
export type SectorKey = (typeof SECTOR_TRANSLATION_KEYS)[Sector];

export interface SectorInfo {
  translatedName: string;
  color: string;
  originalName: string;
}

export function useSectors() {
  const { t } = useTranslation();

  const getSectorInfo = (sectorName: string): SectorInfo => {
    const key = SECTOR_TRANSLATION_KEYS[sectorName as Sector];

    if (key) {
      return {
        translatedName: t(`detailPage.sectors.${key}`),
        color: SECTOR_COLORS[key],
        originalName: sectorName,
      };
    }

    // Fallback for unknown sectors
    return {
      translatedName: sectorName,
      color: "var(--grey)",
      originalName: sectorName,
    };
  };

  return {
    getSectorInfo,
    getSectorColor: (sectorName: string): string => {
      return getSectorInfo(sectorName).color;
    },
    getSectorTranslation: (sectorName: string): string => {
      return getSectorInfo(sectorName).translatedName;
    },
  };
}
