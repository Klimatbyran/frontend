import type { TFunction } from "i18next";
import type { UnitScale } from "@/utils/data/unitScaling";

export function getParisEmissionsUnitLabel(
  unitScale: UnitScale,
  t: TFunction,
): string {
  return t(
    `companiesOverviewPage.visualizations.meetsParis.units.${unitScale.label}`,
    { defaultValue: unitScale.label },
  );
}

export function formatParisEmissionsAmount(
  emissionsTonnes: number,
  unitScale: UnitScale,
  t: TFunction,
): string {
  const scaled = emissionsTonnes / unitScale.divisor;
  const unit = getParisEmissionsUnitLabel(unitScale, t);
  return `${scaled.toFixed(1)} ${unit}`;
}
