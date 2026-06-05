import type { TFunction } from "i18next";
import type { ListCardProps } from "@/components/explore/ListCard";
import type { ComparisonCellValue, ComparisonMetric, ComparisonSection } from "./types";

export function getMeetsParisValue(
  item: ListCardProps,
  t: TFunction,
): ComparisonCellValue {
  const text =
    item.meetsParis === true
      ? t("yes")
      : item.meetsParis === false
        ? t("no")
        : t("companies.card.notEnoughData");

  const colorClass =
    item.meetsParis === true
      ? "text-green-3"
      : item.meetsParis === false
        ? "text-pink-3"
        : "text-grey";

  return { text, colorClass, displayAsBadge: true };
}

export function getClimatePlanStatus(
  item: ListCardProps,
  t: TFunction,
): ComparisonCellValue {
  const hasPlan = item.climatePlanHasPlan;
  const text =
    hasPlan === true ? t("yes") : hasPlan === false ? t("no") : t("unknown");
  const colorClass =
    hasPlan === true
      ? "text-green-3"
      : hasPlan === false
        ? "text-pink-3"
        : "text-grey";

  return { text, colorClass, displayAsBadge: true };
}

export function getDetailValue(
  item: ListCardProps,
  key: keyof NonNullable<ListCardProps["comparisonDetails"]>,
  fallback: string,
  options?: Partial<ComparisonCellValue>,
): ComparisonCellValue {
  const value = item.comparisonDetails?.[key];
  return {
    text: value != null && value !== "" ? String(value) : fallback,
    ...options,
  };
}

export function getClimatePlanAdopted(
  item: ListCardProps,
  t: TFunction,
): ComparisonCellValue {
  const hasPlan = item.climatePlanHasPlan;
  const text = hasPlan
    ? t("municipalities.card.adopted", {
        year: item.climatePlanYear ?? t("unknown"),
      })
    : t("municipalities.card.noPlan");

  const colorClass = !hasPlan ? "text-grey" : "text-white";

  return { text, colorClass };
}

export function createMeetsParisMetric(
  t: TFunction,
  labelKey: string,
): ComparisonMetric {
  return {
    id: "meetsParis",
    label: t(labelKey),
    getValue: getMeetsParisValue,
  };
}

export function createTotalEmissionsMetric(t: TFunction): ComparisonMetric {
  return {
    id: "totalEmissions",
    label: t("companies.card.emissions"),
    getValue: (item, translate) => ({
      text: item.emissionsValue ?? translate("companies.card.noData"),
      colorClass: "text-orange-2",
      unit: item.emissionsYear
        ? `${item.emissionsUnit ?? ""} (${item.emissionsYear})`.trim()
        : item.emissionsUnit,
      isAIGenerated: item.emissionsIsAIGenerated,
    }),
  };
}

export function createChangeRateMetric(
  t: TFunction,
  labelKey: string,
): ComparisonMetric {
  return {
    id: "changeRate",
    label: t(labelKey),
    getValue: (item, translate) => ({
      text: item.changeRateValue ?? translate("companies.card.noData"),
      colorClass: item.changeRateColor ?? "text-orange-2",
      isAIGenerated: item.changeRateIsAIGenerated,
      tooltip: item.changeRateTooltip,
    }),
  };
}

export function createClimateTargetSection(
  t: TFunction,
  meetsParisLabelKey: string,
): ComparisonSection {
  return {
    id: "climateTarget",
    label: t("explorePage.comparison.sections.climateTarget"),
    metrics: [createMeetsParisMetric(t, meetsParisLabelKey)],
  };
}

export function createEmissionsSection(
  t: TFunction,
  changeRateLabelKey: string,
  extraMetrics: ComparisonMetric[] = [],
): ComparisonSection {
  return {
    id: "emissions",
    label: t("explorePage.comparison.sections.emissions"),
    metrics: [
      createTotalEmissionsMetric(t),
      createChangeRateMetric(t, changeRateLabelKey),
      ...extraMetrics,
    ],
  };
}

export function createScopeEmissionsMetric(
  t: TFunction,
  id: string,
  labelKey: string,
  detailKey: keyof NonNullable<ListCardProps["comparisonDetails"]>,
): ComparisonMetric {
  return {
    id,
    label: t(labelKey),
    getValue: (item, translate) =>
      getDetailValue(item, detailKey, translate("companies.card.noData"), {
        colorClass: "text-orange-2",
        unit: item.emissionsYear
          ? `${translate("emissionsUnit")} (${item.emissionsYear})`
          : translate("emissionsUnit"),
      }),
  };
}
