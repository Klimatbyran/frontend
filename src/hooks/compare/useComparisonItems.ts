import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { orderSelectedCards } from "@/utils/compare/comparisonUtils";
import { enrichComparisonCards } from "./comparisonItemsUtils";
import {
  getComparisonError,
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
    companiesError,
    municipalitiesError,
    regionsError,
  } = useComparisonSourceCards({
    selectedCompanyLinkTos: loadCompanies ? activeIds : [],
    loadCompanies,
    loadMunicipalities,
    loadRegions,
  });
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();

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
    municipalities,
    regions,
    t,
  ]);

  const loading = getComparisonLoading({
    loadCompanies,
    loadMunicipalities,
    loadRegions,
    companiesLoading,
    municipalitiesLoading,
    regionsLoading,
  });

  const error = loading
    ? null
    : getComparisonError({
        loadCompanies,
        loadMunicipalities,
        loadRegions,
        companiesError,
        municipalitiesError,
        regionsError,
      });

  return {
    items,
    loading,
    error,
    variant: activeVariant,
    viewCount: activeIds.length,
  };
}
