import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { ListCardProps } from "@/components/explore/ListCard";
import {
  getComparisonSections,
  type ComparisonCellValue,
  type ComparisonMetric,
  type ComparisonSection,
} from "./comparisonMetrics";

export type { ComparisonCellValue, ComparisonMetric, ComparisonSection };

export { getComparisonSections };

export function useComparisonSections(items: ListCardProps[]) {
  const { t } = useTranslation();

  return useMemo(() => {
    if (items.length === 0) {
      return [];
    }
    return getComparisonSections(items[0].variant, t);
  }, [items, t]);
}
