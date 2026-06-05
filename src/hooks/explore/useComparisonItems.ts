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
} from "@/utils/explore/buildComparisonDetails";
import {
  isSameComparisonLink,
  orderSelectedCards,
} from "@/utils/explore/comparisonUtils";

export function useComparisonItems() {
  const { selectedIdOrder, variant, selectedCount } = useComparison();
  const hasSelection = selectedCount > 0 && variant !== null;
  const loadCompanies = hasSelection && variant === "company";
  const loadMunicipalities = hasSelection && variant === "municipality";
  const loadRegions = hasSelection && variant === "region";

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
    if (!hasSelection || !variant) {
      return [];
    }

    const source =
      variant === "company"
        ? allCompanyCards
        : variant === "municipality"
          ? allMunicipalityCards
          : allRegionCards;

    const selectedCards = orderSelectedCards(source, selectedIdOrder);

    if (variant === "municipality") {
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

    if (variant === "company") {
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
    allCompanyCards,
    allMunicipalityCards,
    allRegionCards,
    companies,
    currentLanguage,
    hasSelection,
    isAIGenerated,
    municipalities,
    regions,
    selectedIdOrder,
    t,
    variant,
  ]);

  const loading = loadCompanies
    ? companiesLoading
    : loadMunicipalities
      ? municipalitiesLoading
      : loadRegions
        ? regionsLoading
        : false;

  return { items, loading, variant, selectedCount };
}
