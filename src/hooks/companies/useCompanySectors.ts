import { useTranslation } from "react-i18next";
import { SECTOR_ORDER } from "@/lib/constants/sectors";

export const useSectorNames = () => {
  const { t } = useTranslation();

  return {
    "10": t("sector.energy.name"),
    "15": t("sector.materials.name"),
    "20": t("sector.industrials.name"),
    "25": t("sector.consumerDiscretionary.name"),
    "30": t("sector.consumerStaples.name"),
    "35": t("sector.healthCare.name"),
    "40": t("sector.financials.name"),
    "45": t("sector.informationTechnology.name"),
    "50": t("sector.communicationServices.name"),
    "55": t("sector.utilities.name"),
    "60": t("sector.realEstate.name"),
  };
};

export const useSectorTitles = () => {
  const { t } = useTranslation();

  return {
    "10": t("sector.energy.title"),
    "15": t("sector.materials.title"),
    "20": t("sector.industrials.title"),
    "25": t("sector.consumerDiscretionary.title"),
    "30": t("sector.consumerStaples.title"),
    "35": t("sector.healthCare.title"),
    "40": t("sector.financials.title"),
    "45": t("sector.informationTechnology.title"),
    "50": t("sector.communicationServices.title"),
    "55": t("sector.utilities.title"),
    "60": t("sector.realEstate.title"),
  };
};

// Hook to get sector options for dropdowns (with translated labels)
export const useSectors = () => {
  const { t } = useTranslation();
  const sectorNames = useSectorNames();

  const allSectorsOption = {
    value: "all" as const,
    label: t("explorePage.companies.allSectors"),
  };

  // Build sectors array using translated names
  const filteredOptions = SECTOR_ORDER.map((code) => ({
    value: code,
    label: sectorNames[code],
  }));

  return [allSectorsOption, ...filteredOptions];
};
