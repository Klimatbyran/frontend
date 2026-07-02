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
import { useClimateTraceEmissions } from "@/hooks/europe/useClimateTraceEmissions";
import { useTransformNationListCard } from "@/hooks/europe/useTransformNationListCard";
import europeGeoJson from "@/data/europeGeo.json";
import { FeatureCollection } from "geojson";
import { useEuropeanData } from "@/hooks/europe/useEuropeanData";
import { useEuropeanKPIs } from "@/hooks/europe/useEuropeKPIs";
import { useLanguage } from "@/components/LanguageProvider";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import {
  enrichComparisonItem,
  getCompanyLinkTo,
  getMunicipalityLinkTo,
  getNationLinkTo,
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
  const loadNations = hasViewData && activeVariant === "nation";
  const europeanKPIs = useEuropeanKPIs();
  const defaultEuropeanKpi = europeanKPIs[0];

  const { companies, companiesLoading } = useCompanies({
    enabled: loadCompanies,
  });
  const { municipalities, municipalitiesLoading } = useMunicipalities({
    enabled: loadMunicipalities,
  });
  const { regions, loading: regionsLoading } = useRegionsForExplore({
    enabled: loadRegions,
  });
  const { emissionsByIso, isLoading: nationsLoading } = useClimateTraceEmissions();
  const { countryEntities } = useEuropeanData(
    defaultEuropeanKpi,
    europeGeoJson as FeatureCollection,
    loadNations ? emissionsByIso : {},
  );
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
  const allNationCards = useTransformNationListCard({
    countries: loadNations ? countryEntities : [],
    emissionsByIso: loadNations ? emissionsByIso : {},
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
          : activeVariant === "nation"
            ? allNationCards
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

    if (activeVariant === "nation") {
      return selectedCards.map((card) => {
        const nation = countryEntities.find((country) =>
          isSameComparisonLink(getNationLinkTo(String(country.id)), card.linkTo),
        );

        return enrichComparisonItem(card, {
          nation,
          currentLanguage,
          t,
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
    allNationCards,
    allRegionCards,
    companies,
    countryEntities,
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
      : loadNations
        ? nationsLoading
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
