import { useTranslation } from "react-i18next";
import { SECTOR_ORDER } from "@/lib/constants/sectors";

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
  };
};

// Hook to get sector options for dropdowns (with translated labels)
export const useSectors = () => {
  const { t } = useTranslation();
  const sectorNames = useSectorNames();

  const allSectorsOption = {
    value: "all" as const,
    label: t("companiesPage.allSectors"),
  };

  // Build sectors array using translated names
  const filteredOptions = SECTOR_ORDER.map((code) => ({
    value: code,
    label: sectorNames[code],
  }));

  return [allSectorsOption, ...filteredOptions];
};
