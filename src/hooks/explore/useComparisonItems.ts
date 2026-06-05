import { useMemo } from "react";
import type { ListCardProps } from "@/components/explore/ListCard";
import { useComparison } from "@/contexts/ComparisonContext";
import { useCompanies } from "@/hooks/companies/useCompanies";
import useTransformCompanyListCard from "@/hooks/companies/useTransformCompanyListCard";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import useTransformMunicipalityListCard from "@/hooks/municipalities/useTransformMunicipalityListCard";
import { useRegionsForExplore } from "@/hooks/regions/useRegionsForExplore";
import { useTransformRegionListCard } from "@/hooks/regions/useTransformRegionListCard";
import { entityMatchesSelection } from "@/utils/explore/comparisonUtils";

function filterSelectedCards(
  cards: ListCardProps[],
  selectedIds: Set<string>,
): ListCardProps[] {
  return cards.filter((card) => entityMatchesSelection(card.linkTo, selectedIds));
}

export function useComparisonItems() {
  const { selectedIds, variant, selectedCount } = useComparison();
  const { companies, companiesLoading } = useCompanies();
  const { municipalities, municipalitiesLoading } = useMunicipalities();
  const {
    regions,
    loading: regionsLoading,
  } = useRegionsForExplore();

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

    return filterSelectedCards(source, selectedIds);
  }, [
    allCompanyCards,
    allMunicipalityCards,
    allRegionCards,
    selectedCount,
    selectedIds,
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
