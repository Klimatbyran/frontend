import type { TFunction } from "i18next";
import type { ListCardProps } from "@/components/explore/ListCard";

export type ComparisonCellValue = {
  text: string;
  colorClass?: string;
  unit?: string;
  isAIGenerated?: boolean;
  displayAsBadge?: boolean;
};

export type ComparisonMetric = {
  id: string;
  label: string;
  getValue: (item: ListCardProps, t: TFunction) => ComparisonCellValue;
};

export type ComparisonSection = {
  id: string;
  label: string;
  metrics: ComparisonMetric[];
};
