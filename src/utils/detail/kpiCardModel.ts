import type { ResolvedPlacement } from "@/utils/insights/kpiPlacement";

export type KpiCardScope = ResolvedPlacement & {
  id: string;
  label: string;
};

export type KpiCardModel = {
  id: string;
  label: string;
  value: string;
  valueClassName?: string;
  unit?: string;
  caption?: string;
  href?: string;
  infoText?: string;
  showAiIcon?: boolean;
  scopes: KpiCardScope[];
};
