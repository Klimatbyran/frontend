import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { PageExploreCompany } from "@/types/pages";
import { useLanguage } from "@/components/LanguageProvider";
import { useIndustryGroupNames, useSectorNames } from "./useCompanySectors";
import type { ListCardProps } from "@/components/explore/ListCard";
import { transformCompanyToListCard } from "./transformCompanyListCard";

interface IUseTransformCompanyListCard {
  filteredCompanies: PageExploreCompany[];
}

const useTransformCompanyListCard = ({
  filteredCompanies,
}: IUseTransformCompanyListCard): ListCardProps[] => {
  const sectorNames = useSectorNames();
  const industryGroupNames = useIndustryGroupNames();
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();

  const transformedCards = useMemo(() => {
    if (!filteredCompanies) {
      return [];
    }
    return filteredCompanies.map((company) =>
      transformCompanyToListCard(company, {
        sectorNames,
        industryGroupNames,
        currentLanguage,
        t,
      }),
    );
  }, [
    filteredCompanies,
    sectorNames,
    industryGroupNames,
    currentLanguage,
    t,
  ]);

  return transformedCards;
};

export default useTransformCompanyListCard;
