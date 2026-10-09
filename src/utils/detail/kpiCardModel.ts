import type { KpiDistribution } from "@/utils/insights/kpiDistribution";
import type { ResolvedPlacement } from "@/utils/insights/kpiPlacement";

export type KpiCardScope = ResolvedPlacement & {
  id: string;
  label: string;
  /** Set for yes/no and stepped scores. Ranked metrics leave this empty. */
  distribution?: KpiDistribution | null;
};

export type KpiCardModel = {
  id: string;
  label: string;
  value: string;
  valueClassName?: string;
  unit?: string;
  href?: string;
  infoText?: string;
  showAiIcon?: boolean;
  /**
   * Yes/no and stepped scores show how the dataset splits.
   * Everything else is ranked.
   */
  comparison?: "rank" | "distribution";
  /** Yes/no results use a pie. Stepped scores keep a bar. */
  distributionChart?: "bar" | "pie";
  scopes: KpiCardScope[];
};
