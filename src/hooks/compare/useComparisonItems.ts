import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { orderSelectedCards } from "@/utils/compare/comparisonUtils";
import { enrichComparisonCards } from "./comparisonItemsUtils";
import {
  getComparisonLoading,
  useComparisonViewState,
} from "./comparisonViewState";
import { useComparisonSourceCards } from "./useComparisonSourceCards";

export function useComparisonItems() {
  const viewState = useComparisonViewState();
  const {
    activeIds,
    activeVariant,
    hasViewData,
    loadCompanies,
    loadMunicipalities,
    loadRegions,
  } = viewState;

  const {
    allCompanyCards,
    allMunicipalityCards,
    allRegionCards,
    companies,
    municipalities,
    regions,
    companiesLoading,
    municipalitiesLoading,
    regionsLoading,
  } = useComparisonSourceCards({
    loadCompanies,
    loadMunicipalities,
    loadRegions,
  });
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();
  const { isAIGenerated } = useVerificationStatus();

  const items = useMemo(() => {
    if (!hasViewData || !activeVariant) return [];

    const sourceByVariant = {
      company: allCompanyCards,
      municipality: allMunicipalityCards,
      region: allRegionCards,
    } as const;
    const source = sourceByVariant[activeVariant];
    const selectedCards = orderSelectedCards(source, activeIds);

    return enrichComparisonCards(selectedCards, activeVariant, {
      municipalities: municipalities ?? [],
      companies: companies ?? [],
      regions: regions ?? [],
      currentLanguage,
      t,
      isAIGenerated,
    });
  }, [
    activeIds,
    activeVariant,
    allCompanyCards,
    allMunicipalityCards,
    allRegionCards,
    companies,
    currentLanguage,
    hasViewData,
    isAIGenerated,
    municipalities,
    regions,
    t,
  ]);

  return {
    items,
    loading: getComparisonLoading({
      loadCompanies,
      loadMunicipalities,
      loadRegions,
      companiesLoading,
      municipalitiesLoading,
      regionsLoading,
    }),
    variant: activeVariant,
    viewCount: activeIds.length,
  };
}
