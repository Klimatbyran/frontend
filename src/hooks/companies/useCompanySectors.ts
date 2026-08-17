import { useTranslation } from "react-i18next";
import {
  INDUSTRY_GROUP_CODES_BY_SECTOR,
  IndustryGroupCode,
  SECTOR_ORDER,
  SectorCode,
} from "@/lib/constants/sectors";
import { FilterOptionGroup } from "@/components/explore/FilterPopover";

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
    "2020": t(
      "sector.industrials.industryGroups.commercialProfessionalServices",
    ),
    "2030": t("sector.industrials.industryGroups.transportation"),
    "2510": t(
      "sector.consumerDiscretionary.industryGroups.automobilesComponents",
    ),
    "2520": t(
      "sector.consumerDiscretionary.industryGroups.consumerDurablesApparel",
    ),
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
    "5010": t(
      "sector.communicationServices.industryGroups.telecommunicationServices",
    ),
    "5020": t("sector.communicationServices.industryGroups.mediaEntertainment"),
    "5510": t("sector.utilities.industryGroups.utilities"),
    "6010": t(
      "sector.realEstate.industryGroups.equityRealEstateInvestmentTrustsReits",
    ),
    "6020": t(
      "sector.realEstate.industryGroups.realEstateManagementDevelopment",
    ),
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

// Hook to get industry group options for dropdowns (with translated labels)
export const useIndustryGroupFilterOptionGroups = (): FilterOptionGroup[] => {
  const { t } = useTranslation();
  const industryGroupNames = useIndustryGroupNames();
  const sectorNames = useSectorNames();

  return [
    {
      options: [
        {
          value: "all" as const,
          label: t("explorePage.companies.allIndustryGroups"),
        },
      ],
    },
    ...Object.entries(INDUSTRY_GROUP_CODES_BY_SECTOR).map((g) => ({
      title: sectorNames[g[0] as SectorCode],
      options: g[1].map((o) => ({
        value: o,
        label: industryGroupNames[o],
      })),
    })),
  ];
};
