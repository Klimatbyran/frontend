import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { RankedCompany } from "@/types/company";
import { useLanguage } from "@/components/LanguageProvider";
import { useVerificationStatus } from "../useVerificationStatus";
import { useSectorNames } from "./useCompanySectors";
import type { ListCardProps } from "@/components/explore/ListCard";
import { transformCompanyToListCard } from "./transformCompanyListCard";

interface IUseTransformCompanyListCard {
  filteredCompanies: RankedCompany[];
}

const useTransformCompanyListCard = ({
  filteredCompanies,
}: IUseTransformCompanyListCard): ListCardProps[] => {
  const sectorNames = useSectorNames();
  const { isEmissionsAIGenerated } = useVerificationStatus();
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();

  const transformedCards = useMemo(() => {
    if (!filteredCompanies) {
      return [];
    }
    return filteredCompanies.map((company) =>
      transformCompanyToListCard(company, {
        sectorNames,
        isEmissionsAIGenerated,
        currentLanguage,
        t,
      }),
    );
  }, [
    filteredCompanies,
    sectorNames,
    isEmissionsAIGenerated,
    currentLanguage,
    t,
  ]);

  return transformedCards;
};

export default useTransformCompanyListCard;
