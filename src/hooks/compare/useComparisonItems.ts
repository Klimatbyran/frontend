import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { ListCardProps } from "@/components/explore/ListCard";
import { useComparison } from "@/contexts/ComparisonContext";
import { useCompanies } from "@/hooks/companies/useCompanies";
import useTransformCompanyListCard from "@/hooks/companies/useTransformCompanyListCard";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import useTransformMunicipalityListCard from "@/hooks/municipalities/useTransformMunicipalityListCard";
import { useRegionsForExplore } from "@/hooks/regions/useRegionsForExplore";
import { useTransformRegionListCard } from "@/hooks/regions/useTransformRegionListCard";
import { useLanguage } from "@/components/LanguageProvider";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import {
  enrichComparisonItem,
  getCompanyLinkTo,
  getMunicipalityLinkTo,
  getRegionLinkTo,
} from "@/utils/compare/buildComparisonDetails";
import {
  getComparisonViewSnapshot,
  isSameComparisonLink,
  orderSelectedCards,
} from "@/utils/compare/comparisonUtils";

export function useComparisonItems() {
  const { selectedIds, variant, selectedCount } = useComparison();
  const viewSnapshot = getComparisonViewSnapshot();
  const activeIds =
    selectedCount > 0 && variant
      ? selectedIds
      : (viewSnapshot?.selectedIds ?? []);
  const activeVariant =
    selectedCount > 0 && variant ? variant : (viewSnapshot?.variant ?? null);
  const hasViewData = activeIds.length > 0 && activeVariant !== null;
  const loadCompanies = hasViewData && activeVariant === "company";
  const loadMunicipalities = hasViewData && activeVariant === "municipality";
  const loadRegions = hasViewData && activeVariant === "region";

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
    if (!hasViewData || !activeVariant) {
      return [];
    }

    const source =
      activeVariant === "company"
        ? allCompanyCards
        : activeVariant === "municipality"
          ? allMunicipalityCards
          : allRegionCards;

    const selectedCards = orderSelectedCards(source, activeIds);

    if (activeVariant === "municipality") {
      return selectedCards.map((card) => {
        const municipality = (municipalities ?? []).find((m) =>
          isSameComparisonLink(getMunicipalityLinkTo(m.name), card.linkTo),
        );

        return enrichComparisonItem(card, {
          municipality,
          currentLanguage,
          t,
        });
      });
    }

    if (activeVariant === "company") {
      return selectedCards.map((card) => {
        const company = (companies ?? []).find((c) =>
          isSameComparisonLink(getCompanyLinkTo(c.wikidataId), card.linkTo),
        );

        return enrichComparisonItem(card, {
          company,
          currentLanguage,
          t,
          isAIGenerated,
        });
      });
    }

    return selectedCards.map((card) => {
      const region = (regions ?? []).find((r) =>
        isSameComparisonLink(getRegionLinkTo(r.name), card.linkTo),
      );

      return enrichComparisonItem(card, {
        region,
        currentLanguage,
        t,
      });
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

  const loading = loadCompanies
    ? companiesLoading
    : loadMunicipalities
      ? municipalitiesLoading
      : loadRegions
        ? regionsLoading
        : false;

  return {
    items,
    loading,
    variant: activeVariant,
    viewCount: activeIds.length,
  };
}
