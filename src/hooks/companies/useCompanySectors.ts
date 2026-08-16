import { useTranslation } from "react-i18next";
import {
  IndustryGroupCode,
  SECTOR_ORDER,
  SectorCode,
} from "@/lib/constants/sectors";

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

export const useIndustryGroupNames = (): Record<IndustryGroupCode, string> => {
  const { t } = useTranslation();

  return {
    "1010": t("sector.energy.industryGroups.energy"),
    "1510": t("sector.materials.industryGroups.materials"),
    "2010": t("sector.industrials.industryGroups.capitalGoods"),
    "2020": t("sector.industrials.industryGroups.commercialProfessionalServices"),
    "2030": t("sector.industrials.industryGroups.transportation"),
    "2510": t("sector.consumerDiscretionary.industryGroups.automobilesComponents"),
    "2520": t("sector.consumerDiscretionary.industryGroups.consumerDurablesApparel"),
    "2530": t("sector.consumerDiscretionary.industryGroups.consumerServices"),
    "2550": t(
      "sector.consumerDiscretionary.industryGroups.consumerDiscretionaryDistributionRetail",
    ),
    "3010": t(
      "sector.consumerStaples.industryGroups.consumerStaplesDistributionRetail",
    ),
    "3020": t("sector.consumerStaples.industryGroups.foodBeverageTobacco"),
    "3030": t("sector.consumerStaples.industryGroups.personalCareProducts"),
    "3510": t("sector.healthCare.industryGroups.healthCareEquipmentServices"),
    "3520": t(
      "sector.healthCare.industryGroups.pharmaceuticalsBiotechnologyLifeSciences",
    ),
    "4010": t("sector.financials.industryGroups.banks"),
    "4020": t("sector.financials.industryGroups.financialServices"),
    "4030": t("sector.financials.industryGroups.insurance"),
    "4510": t("sector.informationTechnology.industryGroups.softwareServices"),
    "4520": t(
      "sector.informationTechnology.industryGroups.technologyHardwareEquipment",
    ),
    "4530": t(
      "sector.informationTechnology.industryGroups.semiconductorsSemiconductorEquipment",
    ),
    "5010": t("sector.communicationServices.industryGroups.telecommunicationServices"),
    "5020": t("sector.communicationServices.industryGroups.mediaEntertainment"),
    "5510": t("sector.utilities.industryGroups.utilities"),
    "6010": t("sector.realEstate.industryGroups.equityRealEstateInvestmentTrustsReits"),
    "6020": t("sector.realEstate.industryGroups.realEstateManagementDevelopment"),
  };
};

export const useIndustryGroupsBySector = (): Record<
  SectorCode,
  IndustryGroupCode[]
> => {
  return {
    "10": ["1010"],
    "15": ["1510"],
    "20": ["2010", "2020", "2030"],
    "25": ["2510", "2520", "2530", "2550"],
    "30": ["3010", "3020", "3030"],
    "35": ["3510", "3520"],
    "40": ["4010", "4020", "4030"],
    "45": ["4510", "4520", "4530"],
    "50": ["5010", "5020"],
    "55": ["5510"],
    "60": ["6010", "6020"],
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
