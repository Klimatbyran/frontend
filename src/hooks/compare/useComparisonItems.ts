import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCompanies } from "@/hooks/companies/useCompanies";
import useTransformCompanyListCard from "@/hooks/companies/useTransformCompanyListCard";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import useTransformMunicipalityListCard from "@/hooks/municipalities/useTransformMunicipalityListCard";
import { useRegionsForExplore } from "@/hooks/regions/useRegionsForExplore";
import { useTransformRegionListCard } from "@/hooks/regions/useTransformRegionListCard";
import { useLanguage } from "@/components/LanguageProvider";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { orderSelectedCards } from "@/utils/compare/comparisonUtils";
import { enrichComparisonCards } from "./comparisonItemsUtils";
import {
  getComparisonLoading,
  useComparisonViewState,
} from "./comparisonViewState";

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

  const { companies, companiesLoading } = useCompanies({
    enabled: loadCompanies,
  });
  const { municipalities, municipalitiesLoading } = useMunicipalities({
    enabled: loadMunicipalities,
  });
  const { regions, loading: regionsLoading } = useRegionsForExplore({
    enabled: loadRegions,
  });
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();
  const { isAIGenerated } = useVerificationStatus();

  const allCompanyCards = useTransformCompanyListCard({
    filteredCompanies: loadCompanies ? (companies ?? []) : [],
  });
  const allMunicipalityCards = useTransformMunicipalityListCard({
    filteredMunicipalities: loadMunicipalities ? (municipalities ?? []) : [],
  });
  const allRegionCards = useTransformRegionListCard({
    filteredRegions: loadRegions ? (regions ?? []) : [],
  });

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
