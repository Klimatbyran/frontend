import type { CompanyKPIValue } from "@/types/company";
import type { TFunction } from "i18next";
import { COLORS } from "@/lib/colors";

export const MEETS_PARIS_KPI_KEY = "meetsParis" as const;

export function isMeetsParisKpi(kpi: Pick<CompanyKPIValue, "key">): boolean {
  return kpi.key === MEETS_PARIS_KPI_KEY;
}

export const PARIS_STATUS_COLORS = {
  yes: COLORS.blue3,
  no: COLORS.pink3,
  unknown: COLORS.grey,
} as const;

export function getParisStatusLabels(t: TFunction) {
  return {
    yes: t("companiesOverviewPage.visualizations.meetsParis.yes"),
    no: t("companiesOverviewPage.visualizations.meetsParis.no"),
    unknown: t("companiesOverviewPage.visualizations.meetsParis.unknown"),
  };
}
