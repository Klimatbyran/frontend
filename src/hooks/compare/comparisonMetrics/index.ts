import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { ListCardProps } from "@/components/explore/ListCard";
import { getCompanySections } from "./company";
import { getMunicipalitySections } from "./municipality";
import { getRegionSections } from "./region";

export type {
  ComparisonCellValue,
  ComparisonMetric,
  ComparisonSection,
} from "./types";

export function getComparisonSections(
  variant: ListCardProps["variant"],
  t: TFunction,
) {
  switch (variant) {
    case "municipality":
      return getMunicipalitySections(t);
    case "region":
      return getRegionSections(t);
    case "company":
    default:
      return getCompanySections(t);
  }
}

export function useComparisonSections(items: ListCardProps[]) {
  const { t } = useTranslation();

  return useMemo(() => {
    if (items.length === 0) {
      return [];
    }
    return getComparisonSections(items[0].variant, t);
  }, [items, t]);
}
