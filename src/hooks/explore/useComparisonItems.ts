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
  entityMatchesSelection,
  isSameComparisonLink,
} from "@/utils/explore/comparisonUtils";

function filterSelectedCards(
  cards: ListCardProps[],
  selectedIds: Set<string>,
): ListCardProps[] {
  return cards.filter((card) =>
    entityMatchesSelection(card.linkTo, selectedIds),
  );
}

export function useComparisonItems() {
  const { selectedIds, variant, selectedCount } = useComparison();
  const { companies, companiesLoading } = useCompanies();
  const { municipalities, municipalitiesLoading } = useMunicipalities();
  const { regions, loading: regionsLoading } = useRegionsForExplore();
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();
  const { isAIGenerated } = useVerificationStatus();

  const allCompanyCards = useTransformCompanyListCard({
    filteredCompanies: companies ?? [],
  });
  const allMunicipalityCards = useTransformMunicipalityListCard({
    filteredMunicipalities: municipalities ?? [],
  });
  const allRegionCards = useTransformRegionListCard({
    filteredRegions: regions ?? [],
  });

  const items = useMemo(() => {
    if (selectedCount === 0 || !variant) {
      return [];
    }

    const source =
      variant === "company"
        ? allCompanyCards
        : variant === "municipality"
          ? allMunicipalityCards
          : allRegionCards;

    const selectedCards = filterSelectedCards(source, selectedIds);

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
    isAIGenerated,
    municipalities,
    regions,
    selectedCount,
    selectedIds,
    t,
    variant,
  ]);

  const loading =
    variant === "company"
      ? companiesLoading
      : variant === "municipality"
        ? municipalitiesLoading
        : regionsLoading;

  return { items, loading, variant, selectedCount };
}
