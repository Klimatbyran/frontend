import type { TFunction } from "i18next";
import type { ListCardProps } from "@/components/explore/ListCard";
import type { RankedCompany } from "@/types/company";
import type { Municipality } from "@/types/municipality";
import type { RegionForExplore } from "@/hooks/regions/useRegionsForExplore";
import type { SupportedLanguage } from "@/utils/formatting/localization";
import {
  enrichComparisonItem,
  getCompanyLinkTo,
  getMunicipalityLinkTo,
  getRegionLinkTo,
} from "@/utils/compare/buildComparisonDetails";
import { isSameComparisonLink } from "@/utils/compare/comparisonUtils";

type ComparisonVariant = "company" | "municipality" | "region";

type EnrichContext = {
  municipalities?: Municipality[];
  companies?: RankedCompany[];
  regions?: RegionForExplore[];
  currentLanguage: SupportedLanguage;
  t: TFunction;
  isAIGenerated?: <T extends { metadata?: unknown }>(
    data: T | undefined | null,
  ) => boolean;
};

function enrichMunicipalityCards(
  cards: ListCardProps[],
  context: EnrichContext,
): ListCardProps[] {
  const { municipalities = [], currentLanguage, t } = context;

  return cards.map((card) => {
    const municipality = municipalities.find((m) =>
      isSameComparisonLink(getMunicipalityLinkTo(m.name), card.linkTo),
    );

    return enrichComparisonItem(card, {
      municipality,
      currentLanguage,
      t,
    });
  });
}

function enrichCompanyCards(
  cards: ListCardProps[],
  context: EnrichContext,
): ListCardProps[] {
  const { companies = [], currentLanguage, t, isAIGenerated } = context;

  return cards.map((card) => {
    const company = companies.find((c) =>
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

function enrichRegionCards(
  cards: ListCardProps[],
  context: EnrichContext,
): ListCardProps[] {
  const { regions = [], currentLanguage, t } = context;

  return cards.map((card) => {
    const region = regions.find((r) =>
      isSameComparisonLink(getRegionLinkTo(r.name), card.linkTo),
    );

    return enrichComparisonItem(card, {
      region,
      currentLanguage,
      t,
    });
  });
}

export function enrichComparisonCards(
  cards: ListCardProps[],
  variant: ComparisonVariant,
  context: EnrichContext,
): ListCardProps[] {
  if (variant === "municipality") {
    return enrichMunicipalityCards(cards, context);
  }
  if (variant === "company") {
    return enrichCompanyCards(cards, context);
  }
  return enrichRegionCards(cards, context);
}
